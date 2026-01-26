import { cookies } from 'next/headers'
import { prisma } from '@/src/lib/prisma'

export async function getCurrentUser() {
  const cookieStore = cookies()
  const sessionToken = (await cookieStore).get('session')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      expiresAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // セッション期限切れ
  if (session.expiresAt.getTime() < Date.now()) {
    return null
  }

  return session.user
}
