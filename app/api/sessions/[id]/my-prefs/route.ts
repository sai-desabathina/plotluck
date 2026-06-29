import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  budget_band: z.number().int().min(1).max(4).optional(),
  transport_mode: z.enum(['drive', 'transit', 'walk', 'any']).optional(),
  has_kids: z.boolean().optional(),
  has_pets: z.boolean().optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = await createServiceClient()
  const { data } = await svc.from('session_members').select('prefs_override').eq('session_id', id).eq('user_id', user.id).single()
  return NextResponse.json(data?.prefs_override ?? null)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const svc = await createServiceClient()

  if (body === null) {
    await svc.from('session_members').update({ prefs_override: null }).eq('session_id', id).eq('user_id', user.id)
    return NextResponse.json({ ok: true })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { error } = await svc.from('session_members').update({ prefs_override: parsed.data }).eq('session_id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
