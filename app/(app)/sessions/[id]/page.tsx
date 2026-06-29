import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SessionActions from './SessionActions'
import MyPrefsPanel from './MyPrefsPanel'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase.from('sessions').select('*').eq('id', id).single()
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

  // Get display names for members
  const memberIds = members?.map(m => m.user_id) ?? []
  const { data: personaNames } = await supabase
    .from('personas')
    .select('user_id, display_name')
    .in('user_id', memberIds)

  const nameMap = Object.fromEntries((personaNames ?? []).map(p => [p.user_id, p.display_name]))

  // Get current user's universal persona for session prefs panel
  const { data: myPersona } = await supabase
    .from('personas')
    .select('budget_band, transport_mode, has_kids, has_pets, dietary_restrictions, allergies')
    .eq('user_id', user!.id)
    .single()

  const isOrganizer = members?.some(m => m.user_id === user!.id && m.role === 'organizer')
  const isMember = members?.some(m => m.user_id === user!.id)
  const latestRec = recs?.[0]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = session.invite_token ? `${appUrl}/join/${session.invite_token}` : null

  const statusColors: Record<string, string> = {
    collecting: 'bg-blue-100 text-blue-700',
    generating: 'bg-yellow-100 text-yellow-700',
    proposed: 'bg-purple-100 text-purple-700',
    confirmed: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">← My Sessions</Link>
          <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[session.status] ?? statusColors.closed}`}>
            {session.status}
          </span>
          {isOrganizer && (
            <Link href={`/sessions/${id}/edit`} className="text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* My preferences for this session */}
      {isMember && myPersona && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <MyPrefsPanel
            sessionId={id}
            universal={{
              budget_band: myPersona.budget_band ?? 2,
              transport_mode: myPersona.transport_mode ?? 'any',
              has_kids: myPersona.has_kids ?? false,
              has_pets: myPersona.has_pets ?? false,
              dietary_restrictions: myPersona.dietary_restrictions ?? [],
              allergies: myPersona.allergies ?? [],
            }}
          />
        </div>
      )}

      {/* Members */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Who&apos;s in ({members?.length ?? 0})</h2>
        <div className="space-y-2">
          {members?.map(m => (
            <div key={m.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                  {(nameMap[m.user_id] ?? '?')[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">
                  {nameMap[m.user_id] ?? m.user_id.slice(0, 8)}
                  {m.user_id === user!.id && <span className="text-gray-400"> (you)</span>}
                </span>
                {m.role === 'organizer' && <span className="text-xs text-amber-600 font-medium">organizer</span>}
              </div>
              {isOrganizer && m.user_id !== user!.id && (
                <SessionActions sessionId={id} action="remove-member" memberId={m.user_id} />
              )}
            </div>
          ))}
        </div>

        {/* Leave session — non-organizer members */}
        {isMember && !isOrganizer && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <SessionActions sessionId={id} action="leave" />
          </div>
        )}
      </div>

      {/* Invite */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Invite people</h2>
        {inviteUrl ? (
          <div className="flex gap-2">
            <input readOnly value={inviteUrl} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 min-w-0" />
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
          <h2 className="font-semibold text-gray-900 mb-1">Find the spot</h2>
          <p className="text-sm text-gray-500 mb-3">Outvgo will read everyone&apos;s profiles and pick the best match.</p>
          <SessionActions sessionId={id} action="generate" />
        </div>
      )}

      {/* Results */}
      {latestRec && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Outvgo&apos;s picks</h2>
          <p className="text-xs text-gray-400 mb-3">via {latestRec.source} · {latestRec.chosen_time ?? 'time TBD'}</p>
          <div className="space-y-3">
            {((latestRec.payload as { picks: Array<{ rank: number; headline: string; restaurantId: string }> }).picks ?? []).map(pick => (
              <div key={pick.restaurantId} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="font-bold text-orange-500 text-lg">#{pick.rank}</span>
                <div>
                  <p className="font-semibold text-gray-900">{pick.headline}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{pick.restaurantId}</p>
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
