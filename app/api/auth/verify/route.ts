import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { cleanupExpiredUnverifiedUsers } from '@/src/lib/auth/cleanup'
import { hashToken } from '@/src/lib/auth/token'

function redirectTo(path: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return NextResponse.redirect(new URL(path, baseUrl))
}

export async function GET(req: Request) {
  try {
    await cleanupExpiredUnverifiedUsers()

    const { searchParams } = new URL(req.url)
    const rawToken = searchParams.get('token') ?? ''

    if (!rawToken) {
      return redirectTo('/auth/verify/invalid')
    }

    const tokenHash = hashToken(rawToken)

    const token = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    })

    if (!token) {
      return redirectTo('/auth/verify/invalid')
    }

    // 既に使用済み
    if (token.usedAt) {
      return redirectTo('/auth/verify/expired')
    }

    // 期限切れ
    if (token.expiresAt.getTime() < Date.now()) {
      return redirectTo('/auth/verify/expired')
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ])

    return redirectTo('/auth/verify/success')
  } catch (err) {
    console.error(err)
    return redirectTo('/auth/verify/error')
  }
}
