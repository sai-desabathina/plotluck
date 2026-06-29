import { Constraints } from './constraints'

export interface Venue {
  place_id: string
  name: string
  rating?: number
  price_level?: number
  cuisine_types?: string[]
  serves_vegetarian?: boolean
  serves_vegan?: boolean
  is_kid_friendly?: boolean
  lat: number
  lng: number
}

export interface RankedVenue {
  restaurantId: string
  rank: number
  headline: string
  score: number
}

export function rulesEngine(venues: Venue[], constraints: Constraints): RankedVenue[] {
  const filtered = venues.filter(v => {
    if (constraints.hard.max_budget && v.price_level && v.price_level > constraints.hard.max_budget) return false
    if (constraints.hard.dietary.includes('vegetarian') && !v.serves_vegetarian) return false
    if (constraints.hard.dietary.includes('vegan') && !v.serves_vegan) return false
    if (constraints.hard.kid_friendly && !v.is_kid_friendly) return false
    return true
  })

  const scored = filtered.map(v => {
    let score = (v.rating ?? 3) * 20
    for (const [cuisine, count] of Object.entries(constraints.soft.cuisine_tally)) {
      if (v.cuisine_types?.includes(cuisine)) score += count * 5
    }
    if (v.price_level === constraints.soft.budget_target) score += 10
    return { venue: v, score }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map((s, i) => ({
    restaurantId: s.venue.place_id,
    rank: i + 1,
    headline: s.venue.name,
    score: s.score,
  }))
}
