import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/src/lib/prisma'

export async function POST() {
  const cookieStore = cookies()
  const sessionToken = (await cookieStore).get('session')?.value

  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    })
  }

  const res = NextResponse.json({ message: 'ログアウトしました。' }, { status: 200 })

  // Cookie を無効化（即時削除）
  res.cookies.set('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0), // 1970-01-01T00:00:00.000Z にして Cookie を期限切れに
  })

  return res
}
