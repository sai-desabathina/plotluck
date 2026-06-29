'use client'
import { useState } from 'react'

const CUISINES = ['Italian', 'Chinese', 'Mexican', 'Japanese', 'Thai', 'Indian', 'Mediterranean', 'American', 'French', 'Korean']
const DIETS = ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher']

export default function PersonaForm({ persona }: { persona: Record<string, unknown> | null }) {
  const [displayName, setDisplayName] = useState((persona?.display_name as string) ?? '')
  const [cuisines, setCuisines] = useState<string[]>((persona?.cuisine_prefs as string[]) ?? [])
  const [diets, setDiets] = useState<string[]>((persona?.dietary_restrictions as string[]) ?? [])
  const [allergies, setAllergies] = useState((persona?.allergies as string[])?.join(', ') ?? '')
  const [budget, setBudget] = useState<number>((persona?.budget_band as number) ?? 2)
  const [hasKids, setHasKids] = useState<boolean>((persona?.has_kids as boolean) ?? false)
  const [hasPets, setHasPets] = useState<boolean>((persona?.has_pets as boolean) ?? false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/personas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        cuisine_prefs: cuisines,
        dietary_restrictions: diets,
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        budget_band: budget,
        has_kids: hasKids,
        has_pets: hasPets,
      }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine preferences</label>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map(c => (
            <button key={c} type="button"
              onClick={() => setCuisines(prev => toggle(prev, c.toLowerCase()))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${cuisines.includes(c.toLowerCase()) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary restrictions (hard limits)</label>
        <div className="flex flex-wrap gap-2">
          {DIETS.map(d => (
            <button key={d} type="button"
              onClick={() => setDiets(prev => toggle(prev, d))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${diets.includes(d) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {d.replace('_', '-')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma-separated)</label>
        <input type="text" value={allergies} onChange={e => setAllergies(e.target.value)}
          placeholder="peanut, shellfish, dairy"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($ to $$$$)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(b => (
            <button key={b} type="button" onClick={() => setBudget(b)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${budget === b ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {'$'.repeat(b)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hasKids} onChange={e => setHasKids(e.target.checked)}
            className="w-4 h-4 accent-orange-500" />
          <span className="text-sm text-gray-700">Bringing kids 👶</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hasPets} onChange={e => setHasPets(e.target.checked)}
            className="w-4 h-4 accent-orange-500" />
          <span className="text-sm text-gray-700">Have pets 🐾</span>
        </label>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors">
        {saved ? '✓ Saved!' : loading ? 'Saving…' : 'Save persona'}
      </button>
    </form>
  )
}
