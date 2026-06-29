import { createClient } from './supabase/server'

export interface PlaceResult {
  place_id: string
  name: string
  rating?: number
  price_level?: number
  lat: number
  lng: number
  address?: string
  cuisine_types?: string[]
  serves_vegetarian?: boolean
  serves_vegan?: boolean
  is_kid_friendly?: boolean
  photo_reference?: string
}

export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  maxPrice?: number
): Promise<PlaceResult[]> {
  const supabase = await createClient()

  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', '2000')
  url.searchParams.set('type', 'restaurant')
  url.searchParams.set('key', process.env.GOOGLE_PLACES_KEY!)
  if (maxPrice) url.searchParams.set('maxprice', String(maxPrice))

  const response = await fetch(url.toString())
  const data = await response.json()

  const results: PlaceResult[] = (data.results ?? []).map((r: Record<string, unknown>) => ({
    place_id: r.place_id as string,
    name: r.name as string,
    rating: r.rating as number | undefined,
    price_level: r.price_level as number | undefined,
    lat: (r.geometry as { location: { lat: number; lng: number } }).location.lat,
    lng: (r.geometry as { location: { lat: number; lng: number } }).location.lng,
    address: r.vicinity as string | undefined,
    cuisine_types: (r.types as string[])?.filter((t: string) =>
      ['italian', 'chinese', 'mexican', 'japanese', 'thai', 'indian', 'mediterranean'].includes(t)
    ),
    serves_vegetarian: (r.types as string[])?.includes('vegetarian_restaurant'),
    is_kid_friendly: true,
  }))

  // Cache results
  for (const place of results) {
    await supabase.from('place_cache').upsert({
      place_id: place.place_id,
      data: place,
      fetched_at: new Date().toISOString(),
    })
  }

  return results
}
