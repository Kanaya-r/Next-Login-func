import crypto from 'crypto'

const SESSION_EXPIRES_DAYS = 7

export function createSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function calcSessionExpiresAt(days = SESSION_EXPIRES_DAYS) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}
