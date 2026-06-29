import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({ token: z.string() })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid token' }, { status: 400 })

  const serviceClient = await createServiceClient()
  const { data: session } = await serviceClient
    .from('sessions')
    .select('id, invite_token, invite_expires_at')
    .eq('id', id)
    .eq('invite_token', parsed.data.token)
    .single()

  if (!session) return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  if (session.invite_expires_at && new Date(session.invite_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 })
  }

  await serviceClient.from('session_members').upsert({
    session_id: id,
    user_id: user.id,
    role: 'member',
  }, { onConflict: 'session_id,user_id', ignoreDuplicates: true })

  return NextResponse.json({ ok: true })
}
