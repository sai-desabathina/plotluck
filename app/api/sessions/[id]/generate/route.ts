import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { mergeConstraints, overlapSlots } from '@/lib/matching/constraints'
import { callAgent } from '@/lib/matching/agent'
import { fetchNearbyRestaurants } from '@/lib/places'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await supabase.from('sessions').select('*').eq('id', id).single()
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update status
  await supabase.from('sessions').update({ status: 'generating' }).eq('id', id)

  const { data: members } = await supabase.from('session_members').select('user_id').eq('session_id', id)
  const memberIds = members?.map(m => m.user_id) ?? []

  const { data: personasData } = await supabase.from('personas').select('*').in('user_id', memberIds)
  const personas = personasData ?? []

  const { data: availData } = await supabase.from('availability').select('user_id, slots').eq('session_id', id)
  const allSlots = availData?.map(a => ({ user_id: a.user_id, slots: a.slots as Array<{ start: string; end: string }> })) ?? []

  const constraints = mergeConstraints(personas)
  const windows = overlapSlots(allSlots)
  const chosenWindow = windows[0]

  const lat = session.anchor_lat ?? (personas.find((p: { home_lat: number | null }) => p.home_lat)?.home_lat ?? 40.7128)
  const lng = session.anchor_lng ?? (personas.find((p: { home_lng: number | null }) => p.home_lng)?.home_lng ?? -74.0060)

  let venues: Awaited<ReturnType<typeof fetchNearbyRestaurants>> = []
  try {
    venues = await fetchNearbyRestaurants(lat, lng, constraints.hard.max_budget)
  } catch {
    // Places API not configured — use empty list, rules engine handles it
  }

  const result = await callAgent(venues, constraints, memberIds, chosenWindow)

  await supabase.from('recommendations').insert({
    session_id: id,
    model_version: 'claude-sonnet-4-6',
    chosen_time: result.chosen_time,
    payload: { picks: result.picks },
    source: result.source,
  })

  await supabase.from('sessions').update({ status: 'proposed' }).eq('id', id)

  return NextResponse.json({ ok: true, source: result.source })
}
