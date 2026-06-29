import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: persona } = await supabase
    .from('personas')
    .select('display_name')
    .eq('user_id', user.id)
    .single()

  const initials = (persona?.display_name ?? user.email ?? 'U')
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-black tracking-tight text-gray-900">
          outv<span className="text-orange-500">go</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Sessions</Link>
          <Link href="/persona" className="text-sm text-gray-600 hover:text-gray-900">My Profile</Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center hover:bg-orange-200 transition-colors"
              title="Sign out"
            >
              {initials}
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
