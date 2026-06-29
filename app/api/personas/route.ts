import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  display_name: z.string().min(1).max(100),
  username: z.string().max(30).optional(),
  bio: z.string().max(160).optional(),
  activity_types: z.array(z.string()).default([]),
  cuisine_prefs: z.array(z.string()).default([]),
  dietary_restrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  budget_band: z.number().int().min(1).max(4).default(2),
  has_kids: z.boolean().default(false),
  has_pets: z.boolean().default(false),
  transport_mode: z.enum(['drive', 'transit', 'walk', 'any']).default('any'),
  home_lat: z.number().optional(),
  home_lng: z.number().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('personas').select('*').eq('user_id', user.id).single()
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.from('personas').upsert({
    ...parsed.data,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
