'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ACTIVITY_TYPES = [
  { value: 'restaurant', label: '🍽️ Restaurant', desc: 'Sit-down meal' },
  { value: 'cafe', label: '☕ Cafe', desc: 'Coffee & light bites' },
  { value: 'bar', label: '🍺 Bar / drinks', desc: 'Drinks and vibes' },
  { value: 'outdoor', label: '🏔️ Outdoor activity', desc: 'Hiking, parks, etc.' },
  { value: 'roadtrip', label: '🚗 Road trip', desc: 'Day trip or overnight' },
  { value: 'entertainment', label: '🎬 Entertainment', desc: 'Movies, concerts, events' },
  { value: 'sports', label: '⚽ Sports / fitness', desc: 'Games, gyms, courts' },
]

export default function NewSessionPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [activityType, setActivityType] = useState('restaurant')
  const [recMode, setRecMode] = useState<'immediate' | 'wait_for_all'>('immediate')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: description || undefined,
        activity_type: activityType,
        recommendation_mode: recMode,
        date_range_start: dateStart || undefined,
        date_range_end: dateEnd || undefined,
      }),
    })
    if (res.ok) {
      const { id } = await res.json()
      router.push(`/sessions/${id}`)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Failed to create session')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">← Back</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Plan an outing</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">What kind of outing?</label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_TYPES.map(a => (
              <button key={a.value} type="button" onClick={() => setActivityType(a.value)}
                className={`px-4 py-3 rounded-xl border text-left transition-all ${activityType === a.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'}`}>
                <div className="font-medium text-sm">{a.label}</div>
                <div className={`text-xs mt-0.5 ${activityType === a.value ? 'text-orange-100' : 'text-gray-400'}`}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Session name *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Friday lunch, Camping weekend"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            placeholder="Any context for your group — area, occasion, etc."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">From (optional)</label>
            <input type="datetime-local" value={dateStart} onChange={e => setDateStart(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">To (optional)</label>
            <input type="datetime-local" value={dateEnd} onChange={e => setDateEnd(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>

        {/* AI recommendation mode */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">When should AI recommend?</label>
          <div className="space-y-2">
            <button type="button" onClick={() => setRecMode('immediate')}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-all ${recMode === 'immediate' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
              <div className={`font-medium text-sm ${recMode === 'immediate' ? 'text-blue-700' : 'text-gray-700'}`}>
                ⚡ Recommend as members join
              </div>
              <div className="text-xs text-gray-500 mt-0.5">AI updates recommendations as each person fills their profile</div>
            </button>
            <button type="button" onClick={() => setRecMode('wait_for_all')}
              className={`w-full px-4 py-3 rounded-xl border text-left transition-all ${recMode === 'wait_for_all' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
              <div className={`font-medium text-sm ${recMode === 'wait_for_all' ? 'text-blue-700' : 'text-gray-700'}`}>
                ⏳ Wait for everyone
              </div>
              <div className="text-xs text-gray-500 mt-0.5">AI waits until you give the go-ahead before recommending</div>
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors">
            {loading ? 'Creating…' : 'Create session'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
