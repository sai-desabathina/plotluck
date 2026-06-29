import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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

  const statusColor: Record<string, string> = {
    collecting: 'bg-blue-100 text-blue-700',
    generating: 'bg-yellow-100 text-yellow-700',
    proposed: 'bg-purple-100 text-purple-700',
    confirmed: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <Link
          href="/sessions/new"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🍜</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h2>
          <p className="text-gray-500 mb-6">Create your first group meal session and invite your crew.</p>
          <Link
            href="/sessions/new"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Create your first meetup
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/sessions/${s.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <h2 className="font-semibold text-gray-900">{s.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {s.role === 'organizer' ? '👑 Organizer' : '👤 Member'}
                </p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[s.status] ?? statusColor.closed}`}>
                {s.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
