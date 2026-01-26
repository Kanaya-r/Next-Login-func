'use client'

import { useState } from 'react'

type Result =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<Result>({ status: 'idle' })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult({ status: 'loading' })

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = (await res.json()) as { message?: string }

      if (!res.ok) {
        setResult({
          status: 'error',
          message: data.message ?? 'エラーが発生しました。',
        })
        return
      }

      setResult({
        status: 'success',
        message: data.message ?? 'ログインしました。',
      })
    } catch {
      setResult({ status: 'error', message: '通信に失敗しました。' })
    }
  }

  const messageStyle: Record<'error' | 'success', React.CSSProperties> = {
    error: { color: 'crimson' },
    success: { color: 'green' },
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        メールアドレス
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label>
        パスワード
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      <button type="submit" disabled={result.status === 'loading'}>
        {result.status === 'loading' ? 'ログイン中...' : 'ログイン'}
      </button>

      {(result.status === 'error' || result.status === 'success') && (
        <p style={messageStyle[result.status]}>
          {result.message}
        </p>
      )}
    </form>
  )
}
