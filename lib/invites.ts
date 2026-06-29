import { randomBytes } from 'crypto'

export function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

export function tokenExpiresAt(days = 14): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}
