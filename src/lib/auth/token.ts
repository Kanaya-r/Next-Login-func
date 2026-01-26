import crypto from 'crypto'

export const TOKEN_EXPIRES_HOURS = 2

export function createRawToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

export function calcExpiresAt(hours = TOKEN_EXPIRES_HOURS) {
  const now = new Date()
  now.setHours(now.getHours() + hours)
  return now
}
