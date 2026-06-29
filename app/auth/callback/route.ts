import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this user already has a complete profile
      const { data: existing } = await supabase
        .from('personas')
        .select('display_name, cuisine_prefs, budget_band, transport_mode')
        .eq('user_id', data.user.id)
        .single()

      // Upsert starter persona (no-op if already exists)
      await supabase.from('personas').upsert({
        user_id: data.user.id,
        display_name: data.user.user_metadata?.full_name ?? data.user.email ?? 'User',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id', ignoreDuplicates: true })

      // First-time user or incomplete profile → send to profile setup
      const isNewUser = !existing || !existing.transport_mode || (existing.cuisine_prefs ?? []).length === 0
      const redirectTo = isNewUser ? '/persona?setup=1' : next

      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}
