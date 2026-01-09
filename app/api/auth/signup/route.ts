import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/src/lib/prisma'
import { Prisma } from '@/app/generated/prisma/client'

type SignupBody = {
  name?: string
  email?: string
  password?: string
}

export async function POST(req: Request) {
  try {
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

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
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
