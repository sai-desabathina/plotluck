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
    <div className="min-h-screen bg-[#0C0C0C] text-zinc-100">
      <nav className="border-b border-zinc-900 px-6 py-3.5 flex items-center justify-between bg-[#0C0C0C]/95 backdrop-blur-sm sticky top-0 z-40">
        <Link
          href="/dashboard"
          className="font-black text-lg tracking-tight"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
        >
          outv<span className="text-amber-400">go</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900 font-mono"
          >
            sessions
          </Link>
          <Link
            href="/persona"
            className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900 font-mono"
          >
            profile
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              title="Sign out"
              className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono flex items-center justify-center hover:bg-amber-500/20 transition-colors ml-2"
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
