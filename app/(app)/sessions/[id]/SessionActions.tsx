'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  sessionId: string
  action: 'generate-invite' | 'rotate-invite' | 'clear-invite' | 'email-invite' | 'remove-member' | 'generate' | 'delete' | 'availability'
  memberId?: string
}

export default function SessionActions({ sessionId, action, memberId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState('')
  const [slots, setSlots] = useState([{ start: '', end: '' }])

  async function post(path: string, body: unknown) {
    setLoading(true)
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (res.ok) router.refresh()
    return res
  }

  if (action === 'generate-invite') {
    return (
      <button
        onClick={() => post(`/api/sessions/${sessionId}/invite`, { action: 'generate' })}
        disabled={loading}
        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate invite link'}
      </button>
    )
  }

  if (action === 'rotate-invite') {
    return (
      <button
        onClick={() => post(`/api/sessions/${sessionId}/invite`, { action: 'rotate' })}
        disabled={loading}
        className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        Rotate
      </button>
    )
  }

  if (action === 'clear-invite') {
    return (
      <button
        onClick={() => post(`/api/sessions/${sessionId}/invite`, { action: 'clear' })}
        disabled={loading}
        className="border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
      >
        Clear
      </button>
    )
  }

  if (action === 'email-invite') {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={emails}
          onChange={e => setEmails(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={() => post(`/api/sessions/${sessionId}/invite`, { emails: emails.split(',').map(e => e.trim()).filter(Boolean) })}
          disabled={loading || !emails.trim()}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send email'}
        </button>
      </div>
    )
  }

  if (action === 'remove-member') {
    return (
      <button
        onClick={async () => {
          setLoading(true)
          await fetch(`/api/sessions/${sessionId}/members/${memberId}`, { method: 'DELETE' })
          setLoading(false)
          router.refresh()
        }}
        disabled={loading}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        Remove
      </button>
    )
  }

  if (action === 'generate') {
    return (
      <button
        onClick={() => post(`/api/sessions/${sessionId}/generate`, {})}
        disabled={loading}
        className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? '🤖 Analyzing…' : '🤖 Find the spot'}
      </button>
    )
  }

  if (action === 'delete') {
    return (
      <button
        onClick={async () => {
          if (!confirm('Delete this session? This removes it for everyone.')) return
          setLoading(true)
          await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
          router.push('/dashboard')
        }}
        disabled={loading}
        className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? 'Deleting…' : 'Delete session'}
      </button>
    )
  }

  if (action === 'availability') {
    return (
      <div className="space-y-3">
        {slots.map((slot, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="datetime-local"
              value={slot.start}
              onChange={e => setSlots(s => s.map((sl, j) => j === i ? { ...sl, start: e.target.value } : sl))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <span className="text-gray-400">to</span>
            <input
              type="datetime-local"
              value={slot.end}
              onChange={e => setSlots(s => s.map((sl, j) => j === i ? { ...sl, end: e.target.value } : sl))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
            />
            {slots.length > 1 && (
              <button onClick={() => setSlots(s => s.filter((_, j) => j !== i))} className="text-red-400 text-sm">✕</button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={() => setSlots(s => [...s, { start: '', end: '' }])}
            className="text-sm text-orange-500 hover:text-orange-700"
          >
            + Add slot
          </button>
          <button
            onClick={async () => {
              setLoading(true)
              await fetch(`/api/sessions/${sessionId}/availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slots }),
              })
              setLoading(false)
              router.refresh()
            }}
            disabled={loading}
            className="ml-auto bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save availability'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
