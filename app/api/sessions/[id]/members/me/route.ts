import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Organizers cannot leave — they must delete or transfer ownership
  const { data: member } = await supabase
    .from('session_members')
    .select('role')
    .eq('session_id', id)
    .eq('user_id', user.id)
    .single()

  if (member?.role === 'organizer') {
    return NextResponse.json({ error: 'Organizers cannot leave — delete the session instead.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('session_members')
    .delete()
    .eq('session_id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
