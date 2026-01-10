
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/src/lib/prisma'
import { Prisma } from '@/app/generated/prisma/client'
import { cleanupExpiredUnverifiedUsers } from '@/src/lib/auth/cleanup'
import { calcExpiresAt, createRawToken, hashToken } from '@/src/lib/auth/token'

type SignupBody = {
  name?: string
  email?: string
  password?: string
}

function buildVerifyUrl(rawToken: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${baseUrl}/api/auth/verify?token=${rawToken}`
}

export async function POST(req: Request) {
  try {
    await cleanupExpiredUnverifiedUsers()

    const body = (await req.json()) as SignupBody

    const name = (body.name ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const password = body.password ?? ''

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'ユーザー名, メールアドレス, パスワードは必須です。' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) { // かなり簡易的（@ が含まれるかのみ）
      return NextResponse.json(
        { message: 'メールアドレス形式が正しくありません。' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'パスワードは8文字以上にしてください。' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerifiedAt: true },
    })

    // 既に確認済みなら登録不可（通常の二重登録防止）
    if (existing?.emailVerifiedAt) {
      return NextResponse.json(
        { message: 'そのメールアドレスは既に使われています。' },
        { status: 409 }
      )
    }

    const rawToken = createRawToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = calcExpiresAt(2)
    const now = new Date()

    // 未確認が既に存在する場合は「通す」＋「古いURLを失効」＋「新トークン発行」
    if (existing && !existing.emailVerifiedAt) {
      await prisma.$transaction([
        // 最新の入力を反映
        prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            password: hashedPassword,
          },
        }),
        // 古いトークンを強制失効（古い確認URLは expiresAt チェックで弾く）
        prisma.verificationToken.updateMany({
          where: {
            userId: existing.id,
            usedAt: null,
            expiresAt: { gt: now },
          },
          data: {
            expiresAt: now,
          },
        }),
        // 新トークン発行
        prisma.verificationToken.create({
          data: {
            userId: existing.id,
            tokenHash,
            expiresAt,
          },
        }),
      ])

      // ToDO: のちのちメール送信処理
      // メールの代わりにコンソール出力
      console.log('[Verify URL]', buildVerifyUrl(rawToken))

      return NextResponse.json(
        {
          message:
            '未確認のアカウントが存在したため、確認メールを再送しました。メールをご確認ください。',
        },
        { status: 201 }
      )
    }

    // 初回登録（未確認ユーザーを作成）
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerifiedAt: null,
      },
      select: { id: true },
    })

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    console.log('[Verify URL]', buildVerifyUrl(rawToken))

    return NextResponse.json(
      { message: '確認メールを送信しました。メールをご確認ください。' },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json(
          { message: 'そのメールアドレスは既に使われています。' },
          { status: 409 }
        )
      }
    }

    console.error(err)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
