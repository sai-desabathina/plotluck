import { NextResponse } from 'next/server'
import { fetchNearbyRestaurants } from '@/lib/places'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '0')
  const lng = parseFloat(searchParams.get('lng') ?? '0')
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined

  if (!lat || !lng) return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })

  try {
    const places = await fetchNearbyRestaurants(lat, lng, maxPrice)
    return NextResponse.json(places)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
