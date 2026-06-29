'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const ACTIVITIES = [
  { label: '🍽️ Eating out', value: 'restaurant' },
  { label: '☕ Coffee & cafes', value: 'cafe' },
  { label: '🍺 Bars & drinks', value: 'bar' },
  { label: '🏔️ Hiking', value: 'hiking' },
  { label: '🏕️ Camping', value: 'camping' },
  { label: '🚗 Road trips', value: 'roadtrip' },
  { label: '🎬 Movies', value: 'movies' },
  { label: '🎵 Live music', value: 'livemusic' },
  { label: '⚽ Sports', value: 'sports' },
  { label: '🎮 Gaming', value: 'gaming' },
  { label: '🛍️ Shopping', value: 'shopping' },
  { label: '🧘 Wellness', value: 'wellness' },
]

const CUISINES = [
  { label: '🍕 Italian', value: 'italian' },
  { label: '🍣 Japanese', value: 'japanese' },
  { label: '🍛 Indian', value: 'indian' },
  { label: '🥘 Thai', value: 'thai' },
  { label: '🌮 Mexican', value: 'mexican' },
  { label: '🥗 Mediterranean', value: 'mediterranean' },
  { label: '🍔 American', value: 'american' },
  { label: '🍜 Chinese', value: 'chinese' },
  { label: '🥩 Korean BBQ', value: 'korean' },
  { label: '🥐 French', value: 'french' },
  { label: '🧆 Middle Eastern', value: 'middleeastern' },
  { label: '🌯 Fusion', value: 'fusion' },
]

const DIETS = [
  { label: '🌱 Vegetarian', value: 'vegetarian' },
  { label: '🌿 Vegan', value: 'vegan' },
  { label: '🌾 Gluten-free', value: 'gluten_free' },
  { label: '☪️ Halal', value: 'halal' },
  { label: '✡️ Kosher', value: 'kosher' },
  { label: '🥩 Keto', value: 'keto' },
  { label: '🐟 Pescatarian', value: 'pescatarian' },
  { label: '🥛 Dairy-free', value: 'dairy_free' },
]

const ALLERGIES = [
  { label: '🥜 Peanuts', value: 'peanuts' },
  { label: '🦐 Shellfish', value: 'shellfish' },
  { label: '🥛 Dairy', value: 'dairy' },
  { label: '🌾 Gluten', value: 'gluten' },
  { label: '🥚 Eggs', value: 'eggs' },
  { label: '🐟 Fish', value: 'fish' },
  { label: '🌰 Tree nuts', value: 'tree_nuts' },
  { label: '🫘 Soy', value: 'soy' },
]

const BUDGET = [
  { label: '$', desc: 'Under $15', value: 1 },
  { label: '$$', desc: '$15–30', value: 2 },
  { label: '$$$', desc: '$30–60', value: 3 },
  { label: '$$$$', desc: '$60+', value: 4 },
]

const TRANSPORT = [
  { label: '🚗 I\'ll drive', value: 'drive', desc: 'Happy to go anywhere' },
  { label: '🚇 Public transit', value: 'transit', desc: 'Bus, metro, train' },
  { label: '🚶 Walking only', value: 'walk', desc: 'Keep it nearby' },
  { label: '🤷 Flexible', value: 'any', desc: 'Whatever works' },
]

type PersonaData = Record<string, unknown>

function Pill({ active, onClick, children, color = 'orange' }: {
  active: boolean; onClick: () => void; children: React.ReactNode; color?: string
}) {
  const colors: Record<string, string> = {
    orange: active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300',
    red: active ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-200 hover:border-red-300',
    green: active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300',
    blue: active ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300',
    purple: active ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300',
  }
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${colors[color]}`}>
      {children}
    </button>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

export default function PersonaForm({ persona }: { persona: PersonaData | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSetup = searchParams.get('setup') === '1'

  const [displayName, setDisplayName] = useState((persona?.display_name as string) ?? '')
  const [bio, setBio] = useState((persona?.bio as string) ?? '')
  const [activities, setActivities] = useState<string[]>((persona?.activity_types as string[]) ?? [])
  const [cuisines, setCuisines] = useState<string[]>((persona?.cuisine_prefs as string[]) ?? [])
  const [diets, setDiets] = useState<string[]>((persona?.dietary_restrictions as string[]) ?? [])
  const [allergies, setAllergies] = useState<string[]>((persona?.allergies as string[]) ?? [])
  const [budget, setBudget] = useState<number>((persona?.budget_band as number) ?? 2)
  const [transport, setTransport] = useState<string>((persona?.transport_mode as string) ?? 'any')
  const [hasKids, setHasKids] = useState<boolean>((persona?.has_kids as boolean) ?? false)
  const [hasPets, setHasPets] = useState<boolean>((persona?.has_pets as boolean) ?? false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/personas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        bio,
        activity_types: activities,
        cuisine_prefs: cuisines,
        dietary_restrictions: diets,
        allergies,
        budget_band: budget,
        transport_mode: transport,
        has_kids: hasKids,
        has_pets: hasPets,
      }),
    })
    setLoading(false)
    if (isSetup) {
      router.push('/dashboard')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Identity */}
      <Section title="About you">
        <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
          placeholder="Optional: a quick line about you (e.g. 'night-owl foodie, will drive anywhere for good ramen')"
          maxLength={160}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
      </Section>

      {/* Activities */}
      <Section title="What do you like to do?" subtitle="Outvgo will suggest the right kind of outing — not just restaurants.">
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map(a => (
            <Pill key={a.value} active={activities.includes(a.value)} color="orange"
              onClick={() => setActivities(prev => toggle(prev, a.value))}>
              {a.label}
            </Pill>
          ))}
        </div>
      </Section>

      {/* Allergies — safety first */}
      <Section title="Allergies" subtitle="Hard limits. Outvgo will never suggest somewhere that could harm you.">
        <div className="flex flex-wrap gap-2">
          {ALLERGIES.map(a => (
            <Pill key={a.value} active={allergies.includes(a.value)} color="red"
              onClick={() => setAllergies(prev => toggle(prev, a.value))}>
              {a.label}
            </Pill>
          ))}
        </div>
      </Section>

      {/* Diet */}
      <Section title="Dietary preferences" subtitle="Outvgo prioritises places that accommodate these.">
        <div className="flex flex-wrap gap-2">
          {DIETS.map(d => (
            <Pill key={d.value} active={diets.includes(d.value)} color="green"
              onClick={() => setDiets(prev => toggle(prev, d.value))}>
              {d.label}
            </Pill>
          ))}
        </div>
      </Section>

      {/* Cuisines */}
      <Section title="Favourite cuisines" subtitle="Pick as many as you like.">
        <div className="flex flex-wrap gap-2">
          {CUISINES.map(c => (
            <Pill key={c.value} active={cuisines.includes(c.value)} color="orange"
              onClick={() => setCuisines(prev => toggle(prev, c.value))}>
              {c.label}
            </Pill>
          ))}
        </div>
      </Section>

      {/* Budget */}
      <Section title="Typical budget per person">
        <div className="grid grid-cols-4 gap-2">
          {BUDGET.map(b => (
            <button key={b.value} type="button" onClick={() => setBudget(b.value)}
              className={`py-3 rounded-xl border text-center transition-all ${budget === b.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'}`}>
              <div className="font-bold text-lg">{b.label}</div>
              <div className={`text-xs mt-0.5 ${budget === b.value ? 'text-orange-100' : 'text-gray-400'}`}>{b.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Transport */}
      <Section title="How do you usually get around?">
        <div className="grid grid-cols-2 gap-2">
          {TRANSPORT.map(t => (
            <button key={t.value} type="button" onClick={() => setTransport(t.value)}
              className={`px-4 py-3 rounded-xl border text-left transition-all ${transport === t.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
              <div className="font-medium text-sm">{t.label}</div>
              <div className={`text-xs mt-0.5 ${transport === t.value ? 'text-blue-100' : 'text-gray-400'}`}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Kids & Pets */}
      <Section title="Anything else we should know?">
        <div className="flex gap-3">
          <Pill active={hasKids} color="purple" onClick={() => setHasKids(p => !p)}>👶 I bring kids</Pill>
          <Pill active={hasPets} color="purple" onClick={() => setHasPets(p => !p)}>🐾 I bring a pet</Pill>
        </div>
      </Section>

      <button type="submit" disabled={loading}
        className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors text-base">
        {saved ? '✓ Saved!' : loading ? 'Saving…' : isSetup ? 'Save and go to dashboard →' : 'Save profile'}
      </button>
    </form>
  )
}
