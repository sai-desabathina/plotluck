export interface Persona {
  user_id: string
  display_name: string
  cuisine_prefs: string[]
  dietary_restrictions: string[]
  allergies: string[]
  budget_band: number
  has_kids: boolean
  has_pets: boolean
  home_lat: number | null
  home_lng: number | null
  prefs_override?: Record<string, unknown>
}

export interface Constraints {
  hard: {
    dietary: string[]
    allergies: string[]
    kid_friendly: boolean
    max_budget: number
  }
  soft: {
    cuisine_tally: Record<string, number>
    budget_target: number
    dog_friendly: boolean
  }
}

export function mergeConstraints(personas: Persona[]): Constraints {
  const dietary = [...new Set(personas.flatMap(p => p.dietary_restrictions))]
  const allergies = [...new Set(personas.flatMap(p => p.allergies))]
  const kid_friendly = personas.some(p => p.has_kids)
  const max_budget = Math.min(...personas.map(p => p.budget_band))

  const cuisine_tally: Record<string, number> = {}
  for (const p of personas) {
    for (const c of p.cuisine_prefs) {
      cuisine_tally[c] = (cuisine_tally[c] ?? 0) + 1
    }
  }

  const budget_target = Math.round(
    personas.reduce((sum, p) => sum + p.budget_band, 0) / personas.length
  )

  const dog_friendly = personas.some(p => p.has_pets)

  return {
    hard: { dietary, allergies, kid_friendly, max_budget },
    soft: { cuisine_tally, budget_target, dog_friendly },
  }
}

export function overlapSlots(
  allSlots: Array<{ user_id: string; slots: Array<{ start: string; end: string }> }>
): Array<{ start: string; end: string }> {
  if (!allSlots.length) return []
  let result = allSlots[0].slots.map(s => ({ start: new Date(s.start).getTime(), end: new Date(s.end).getTime() }))
  for (const { slots } of allSlots.slice(1)) {
    const next: typeof result = []
    for (const a of result) {
      for (const b of slots) {
        const bs = new Date(b.start).getTime()
        const be = new Date(b.end).getTime()
        const start = Math.max(a.start, bs)
        const end = Math.min(a.end, be)
        if (start < end) next.push({ start, end })
      }
    }
    result = next
  }
  return result.map(r => ({ start: new Date(r.start).toISOString(), end: new Date(r.end).toISOString() }))
}
