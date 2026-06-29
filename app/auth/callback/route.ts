import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  // Collect cookies during exchange, then stamp them onto the redirect
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  // Upsert starter persona so the user always has a row
  await supabase.from('personas').upsert({
    user_id: data.user.id,
    display_name: data.user.user_metadata?.full_name ?? data.user.email ?? 'User',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id', ignoreDuplicates: true })

  // Decide where to send the user
  const { data: existing } = await supabase
    .from('personas')
    .select('transport_mode, cuisine_prefs')
    .eq('user_id', data.user.id)
    .single()

  const isNewUser = !existing?.transport_mode || (existing?.cuisine_prefs ?? []).length === 0
  const redirectTo = isNewUser ? '/persona?setup=1' : next

  // Build redirect and STAMP cookies onto it
  const response = NextResponse.redirect(`${origin}${redirectTo}`)
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })

  return response
}
