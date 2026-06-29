'use client'
import { useEffect, useState } from 'react'

const BUDGET = [
  { label: '$', desc: '<$15', value: 1 },
  { label: '$$', desc: '$15–30', value: 2 },
  { label: '$$$', desc: '$30–60', value: 3 },
  { label: '$$$$', desc: '$60+', value: 4 },
]
const TRANSPORT = [
  { label: '🚗 Drive', value: 'drive' },
  { label: '🚇 Transit', value: 'transit' },
  { label: '🚶 Walk', value: 'walk' },
  { label: '🤷 Any', value: 'any' },
]
const ALLERGIES = ['peanuts','shellfish','dairy','gluten','eggs','fish','tree_nuts','soy']
const DIETS = ['vegetarian','vegan','gluten_free','halal','kosher','keto']

type Universal = {
  budget_band: number
  transport_mode: string
  has_kids: boolean
  has_pets: boolean
  dietary_restrictions: string[]
  allergies: string[]
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

export default function MyPrefsPanel({ sessionId, universal }: { sessionId: string; universal: Universal }) {
  const [override, setOverride] = useState<Partial<Universal> | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // local edit state — starts from override ?? universal
  const base = { ...universal, ...override }
  const [budget, setBudget] = useState(base.budget_band)
  const [transport, setTransport] = useState(base.transport_mode)
  const [kids, setKids] = useState(base.has_kids)
  const [pets, setPets] = useState(base.has_pets)
  const [allergies, setAllergies] = useState<string[]>(base.allergies)
  const [diets, setDiets] = useState<string[]>(base.dietary_restrictions)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/my-prefs`)
      .then(r => r.json())
      .then(d => {
        setOverride(d)
        if (d) {
          if (d.budget_band) setBudget(d.budget_band)
          if (d.transport_mode) setTransport(d.transport_mode)
          if (typeof d.has_kids === 'boolean') setKids(d.has_kids)
          if (typeof d.has_pets === 'boolean') setPets(d.has_pets)
          if (d.allergies) setAllergies(d.allergies)
          if (d.dietary_restrictions) setDiets(d.dietary_restrictions)
        }
        setLoading(false)
      })
  }, [sessionId])

  async function save() {
    setSaving(true)
    await fetch(`/api/sessions/${sessionId}/my-prefs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget_band: budget, transport_mode: transport, has_kids: kids, has_pets: pets, allergies, dietary_restrictions: diets }),
    })
    setOverride({ budget_band: budget, transport_mode: transport, has_kids: kids, has_pets: pets, allergies, dietary_restrictions: diets })
    setSaving(false)
    setEditing(false)
  }

  async function resetToUniversal() {
    setSaving(true)
    await fetch(`/api/sessions/${sessionId}/my-prefs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(null),
    })
    setOverride(null)
    setBudget(universal.budget_band)
    setTransport(universal.transport_mode)
    setKids(universal.has_kids)
    setPets(universal.has_pets)
    setAllergies(universal.allergies)
    setDiets(universal.dietary_restrictions)
    setSaving(false)
    setEditing(false)
  }

  if (loading) return <p className="text-sm text-gray-400">Loading your preferences…</p>

  const isCustomised = override !== null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900">My preferences for this session</h2>
          {isCustomised && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Customised</span>
          )}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            {isCustomised ? 'Edit' : 'Customise for this session'}
          </button>
        )}
      </div>

      {!editing ? (
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex gap-4 flex-wrap">
            <span>💰 {'$'.repeat(isCustomised && override?.budget_band ? override.budget_band : universal.budget_band)}</span>
            <span>{transport === 'drive' ? '🚗' : transport === 'transit' ? '🚇' : transport === 'walk' ? '🚶' : '🤷'} {transport}</span>
            {(isCustomised ? override?.has_kids : universal.has_kids) && <span>👶 Kids</span>}
            {(isCustomised ? override?.has_pets : universal.has_pets) && <span>🐾 Pet</span>}
          </div>
          {allergies.length > 0 && (
            <p>🚫 Allergies: {allergies.join(', ')}</p>
          )}
          {isCustomised && (
            <button onClick={resetToUniversal} className="text-xs text-gray-400 hover:text-gray-600 underline mt-1">
              Reset to my universal profile
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Budget */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Budget for this outing</p>
            <div className="grid grid-cols-4 gap-2">
              {BUDGET.map(b => (
                <button key={b.value} type="button" onClick={() => setBudget(b.value)}
                  className={`py-2.5 rounded-xl border text-center transition-all ${budget === b.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'}`}>
                  <div className="font-bold">{b.label}</div>
                  <div className={`text-xs ${budget === b.value ? 'text-orange-100' : 'text-gray-400'}`}>{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transport */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Getting there</p>
            <div className="grid grid-cols-4 gap-2">
              {TRANSPORT.map(t => (
                <button key={t.value} type="button" onClick={() => setTransport(t.value)}
                  className={`py-2 rounded-xl border text-sm font-medium transition-all ${transport === t.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES.map(a => (
                <button key={a} type="button" onClick={() => setAllergies(prev => toggle(prev, a))}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${allergies.includes(a) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Dietary</p>
            <div className="flex flex-wrap gap-2">
              {DIETS.map(d => (
                <button key={d} type="button" onClick={() => setDiets(prev => toggle(prev, d))}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${diets.includes(d) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'}`}>
                  {d.replace('_', '-')}
                </button>
              ))}
            </div>
          </div>

          {/* Kids / Pets */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setKids(p => !p)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${kids ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-200'}`}>
              👶 Bringing kids
            </button>
            <button type="button" onClick={() => setPets(p => !p)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${pets ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-200'}`}>
              🐾 Bringing a pet
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving}
              className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm">
              {saving ? 'Saving…' : 'Save for this session'}
            </button>
            <button onClick={() => setEditing(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
