import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cleanupExpiredUnverifiedUsers } from '@/lib/auth/cleanup'
import { calcExpiresAt, createRawToken, hashToken } from '@/lib/auth/token'

type Body = { email?: string }

function buildVerifyUrl(rawToken: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${baseUrl}/api/auth/verify?token=${rawToken}`
}

export async function POST(req: Request) {
  try {
    await cleanupExpiredUnverifiedUsers()

    const body = (await req.json()) as Body
    const email = (body.email ?? '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { message: 'email は必須です。' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerifiedAt: true },
    })

    if (!user) {
      return NextResponse.json(
        { message: '確認メールを送信しました。メールをご確認ください。' },
        { status: 200 }
      )
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に確認済みです。' },
        { status: 400 }
      )
    }

    const rawToken = createRawToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = calcExpiresAt(2)

    await prisma.$transaction([
      prisma.verificationToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
      prisma.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ])

    console.log('[Verify URL]', buildVerifyUrl(rawToken))

    return NextResponse.json(
      { message: '確認メールを送信しました。メールをご確認ください。' },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
