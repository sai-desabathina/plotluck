import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SessionActions from './SessionActions'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!session) notFound()

  const { data: members } = await supabase
    .from('session_members')
    .select('user_id, role, joined_at')
    .eq('session_id', id)

  const { data: recs } = await supabase
    .from('recommendations')
    .select('*')
    .eq('session_id', id)
    .order('generated_at', { ascending: false })
    .limit(1)

  const isOrganizer = members?.some(m => m.user_id === user!.id && m.role === 'organizer')
  const latestRec = recs?.[0]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = session.invite_token ? `${appUrl}/join/${session.invite_token}` : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
          <span className="text-sm text-gray-500 capitalize">{session.status}</span>
        </div>
        {isOrganizer && (
          <div className="flex gap-2">
            <Link href={`/sessions/${id}/edit`} className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">Edit</Link>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Members ({members?.length ?? 0})</h2>
        <div className="space-y-2">
          {members?.map(m => (
            <div key={m.user_id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{m.user_id.slice(0, 8)}… {m.role === 'organizer' ? '👑' : ''}</span>
              {isOrganizer && m.user_id !== user!.id && (
                <SessionActions sessionId={id} action="remove-member" memberId={m.user_id} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Invite people</h2>
        {inviteUrl ? (
          <div className="flex gap-2">
            <input readOnly value={inviteUrl} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600" />
            <SessionActions sessionId={id} action="rotate-invite" />
            <SessionActions sessionId={id} action="clear-invite" />
          </div>
        ) : isOrganizer ? (
          <SessionActions sessionId={id} action="generate-invite" />
        ) : (
          <p className="text-sm text-gray-500">Ask the organizer for an invite link.</p>
        )}
        {isOrganizer && (
          <div className="mt-3">
            <SessionActions sessionId={id} action="email-invite" />
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Your availability</h2>
        <SessionActions sessionId={id} action="availability" />
      </div>

      {/* Generate */}
      {isOrganizer && session.status === 'collecting' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Find the spot</h2>
          <p className="text-sm text-gray-500 mb-3">Ready to pick a restaurant? We&apos;ll analyze everyone&apos;s preferences.</p>
          <SessionActions sessionId={id} action="generate" />
        </div>
      )}

      {/* Results */}
      {latestRec && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Recommendations</h2>
          <p className="text-xs text-gray-400 mb-3">Source: {latestRec.source} · {latestRec.chosen_time ?? 'time TBD'}</p>
          <div className="space-y-3">
            {((latestRec.payload as { picks: Array<{ rank: number; headline: string; restaurantId: string }> }).picks ?? []).map((pick) => (
              <div key={pick.restaurantId} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <span className="font-bold text-orange-500">#{pick.rank}</span>
                <div>
                  <p className="font-medium text-gray-900">{pick.headline}</p>
                  <p className="text-xs text-gray-500">{pick.restaurantId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone */}
      {isOrganizer && (
        <div className="border border-red-200 rounded-xl p-5">
          <h2 className="font-semibold text-red-600 mb-2">Danger zone</h2>
          <SessionActions sessionId={id} action="delete" />
        </div>
      )}
    </div>
  )
}
