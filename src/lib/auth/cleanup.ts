// ToDO: 実際の公開環境ではcronなどで定期的に実行する想定

import { prisma } from '@/src/lib/prisma'

export const UNVERIFIED_TTL_HOURS = 2

export async function cleanupExpiredUnverifiedUsers() {
  const threshold = new Date(Date.now() - UNVERIFIED_TTL_HOURS * 60 * 60 * 1000)

  await prisma.user.deleteMany({
    where: {
      emailVerifiedAt: null,
      createdAt: { lt: threshold },
    },
  })
}
