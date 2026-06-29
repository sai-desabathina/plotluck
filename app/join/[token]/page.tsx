import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Validate token
  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, invite_expires_at')
    .eq('invite_token', token)
    .single()

  if (!session || (session.invite_expires_at && new Date(session.invite_expires_at) < new Date())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">This invite link has expired</h1>
          <p className="text-gray-500">Ask the organizer for a new invite link.</p>
        </div>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectTo = `${appUrl}/auth/callback?next=/join/${token}`
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Join &quot;{session.name}&quot;</h1>
          <p className="text-gray-500 mb-6">Sign in with Google to join this meal session.</p>
          <a href={data?.url ?? '/'}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors">
            Continue with Google
          </a>
        </div>
      </div>
    )
  }

  // Auto-join
  const joinRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/sessions/${session.id}/join`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }
  )

  if (joinRes.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;re in!</h1>
          <p className="text-gray-500 mb-6">You&apos;ve joined &quot;{session.name}&quot;.</p>
          <Link href={`/sessions/${session.id}`}
            className="inline-flex items-center bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors">
            Go to session →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Something went wrong. <Link href="/dashboard" className="text-orange-500">Go home</Link></p>
    </div>
  )
}
