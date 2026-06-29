import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateToken, tokenExpiresAt } from '@/lib/invites'
import { sendInviteEmail } from '@/lib/email'
import { z } from 'zod'

const Schema = z.union([
  z.object({ action: z.enum(['generate', 'rotate', 'clear']) }),
  z.object({ emails: z.array(z.string().email()) }),
])

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: session } = await supabase.from('sessions').select('id, name, invite_token').eq('id', id).single()
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if ('action' in parsed.data) {
    const { action } = parsed.data
    if (action === 'clear') {
      await supabase.from('sessions').update({ invite_token: null, invite_expires_at: null }).eq('id', id)
      return NextResponse.json({ ok: true })
    }
    const token = generateToken()
    await supabase.from('sessions').update({ invite_token: token, invite_expires_at: tokenExpiresAt() }).eq('id', id)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    return NextResponse.json({ url: `${appUrl}/join/${token}` })
  }

  // Email invites
  if ('emails' in parsed.data) {
    const { data: orgPersona } = await supabase.from('personas').select('display_name').eq('user_id', user.id).single()
    const orgName = orgPersona?.display_name ?? 'Someone'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const joinUrl = `${appUrl}/join/${session.invite_token}`
    for (const email of parsed.data.emails) {
      await sendInviteEmail(email, session.name, joinUrl, orgName)
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid' }, { status: 400 })
}
