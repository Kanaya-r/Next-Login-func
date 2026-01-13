import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/src/lib/prisma'
import { createSessionToken, calcSessionExpiresAt } from '@/src/lib/auth/session'

type Body = {
  email?: string
  password?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const email = (body.email ?? '').trim().toLowerCase()
    const password = body.password ?? ''

    if (!email || !password) {
      return NextResponse.json(
        { message: 'メールアドレスとパスワードは必須です。' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        emailVerifiedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'メールアドレスまたはパスワードが違います。' },
        { status: 401 }
      )
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { message: '認証が完了していないメールアドレスです。確認メールをご確認ください。' },
        { status: 403 }
      )
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json(
        { message: 'メールアドレスまたはパスワードが違います。' },
        { status: 401 }
      )
    }

    const sessionToken = createSessionToken()
    const expiresAt = calcSessionExpiresAt(7)

    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
      },
    })

    const res = NextResponse.json(
      { message: 'ログインしました。' },
      { status: 200 }
    )

    // HttpOnly Cookie にセッショントークンを保存
    res.cookies.set('session', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: expiresAt,
    })

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
