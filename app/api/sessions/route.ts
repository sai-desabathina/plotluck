import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  activity_type: z.string().default('restaurant'),
  recommendation_mode: z.enum(['immediate', 'wait_for_all']).default('immediate'),
  date_range_start: z.string().optional(),
  date_range_end: z.string().optional(),
  anchor_lat: z.number().optional(),
  anchor_lng: z.number().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single()

  if (error || !session) return NextResponse.json({ error: error?.message }, { status: 500 })

  await supabase.from('session_members').insert({
    session_id: session.id,
    user_id: user.id,
    role: 'organizer',
  })

  return NextResponse.json(session, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('session_members')
    .select('sessions(*)')
    .eq('user_id', user.id)

  return NextResponse.json(data?.map(m => m.sessions) ?? [])
}
