import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; cls: string }> = {
  collecting: { label: 'collecting',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  generating: { label: 'generating',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  proposed:   { label: 'proposed',    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  confirmed:  { label: 'confirmed',   cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  closed:     { label: 'closed',      cls: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('session_members')
    .select('session_id, role, sessions(id, name, status, created_at)')
    .eq('user_id', user!.id)
    .order('joined_at', { ascending: false })

  type SessionRow = { id: string; name: string; status: string; created_at: string; role: string }
  const sessions: SessionRow[] = memberships?.map(m => ({
    ...(m.sessions as unknown as Omit<SessionRow, 'role'>),
    role: m.role,
  })) ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-2xl tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Sessions
          </h1>
          {sessions.length > 0 && (
            <p className="text-zinc-500 text-sm font-mono mt-0.5">{sessions.length} total</p>
          )}
        </div>
        <Link
          href="/sessions/new"
          className="bg-amber-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-400 transition-all duration-150 shadow-lg shadow-amber-500/20"
        >
          + New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-24 border border-zinc-900 rounded-2xl bg-[#141414]">
          <div className="text-5xl mb-4">🍜</div>
          <h2 className="font-black text-xl mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            No sessions yet
          </h2>
          <p className="text-zinc-500 text-sm mb-8 font-mono max-w-xs mx-auto">
            Create your first outing session and invite your crew.
          </p>
          <Link
            href="/sessions/new"
            className="inline-block bg-amber-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
          >
            Create your first meetup
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => {
            const cfg = statusConfig[s.status] ?? statusConfig.closed
            const date = new Date(s.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
            })
            return (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="group bg-[#141414] border border-zinc-800 rounded-xl p-5 flex items-center justify-between hover:border-zinc-700 transition-colors duration-150"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                    {s.role === 'organizer' ? '👑' : '👤'}
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-100 text-sm group-hover:text-white transition-colors">
                      {s.name}
                    </div>
                    <div className="font-mono text-xs text-zinc-600 mt-0.5">{date}</div>
                  </div>
                </div>
                <span className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
