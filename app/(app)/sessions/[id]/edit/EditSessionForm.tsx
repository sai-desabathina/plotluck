'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditSessionForm({ session }: { session: Record<string, unknown> }) {
  const router = useRouter()
  const [name, setName] = useState(session.name as string)
  const [dateStart, setDateStart] = useState(
    session.date_range_start ? new Date(session.date_range_start as string).toISOString().slice(0, 16) : ''
  )
  const [dateEnd, setDateEnd] = useState(
    session.date_range_end ? new Date(session.date_range_end as string).toISOString().slice(0, 16) : ''
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date_range_start: dateStart || null, date_range_end: dateEnd || null }),
    })
    setLoading(false)
    router.push(`/sessions/${session.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date from</label>
          <input type="datetime-local" value={dateStart} onChange={e => setDateStart(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date to</label>
          <input type="datetime-local" value={dateEnd} onChange={e => setDateEnd(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
          {loading ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  )
}
