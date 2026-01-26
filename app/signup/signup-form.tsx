'use client'

import { useState } from 'react'

type Result =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<Result>({ status: 'idle' })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult({ status: 'loading' })

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = (await res.json()) as { message?: string }

      if (!res.ok) {
        setResult({
          status: 'error',
          message: data.message ?? 'エラーが発生しました。',
        })
        return
      }

      setResult({ status: 'success', message: '確認メールを送信しました。メールをご確認ください。' })
      setName('')
      setEmail('')
      setPassword('')
    } catch {
      setResult({ status: 'error', message: '通信に失敗しました。' })
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        ユーザー名
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="username"
          required
        />
      </label>

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
          autoComplete="new-password"
          required
        />
      </label>

      <button type="submit" disabled={result.status === 'loading'}>
        {result.status === 'loading' ? '確認中...' : '作成'}
      </button>

      {result.status === 'error' && (
        <p>{result.message}</p>
      )}
      {result.status === 'success' && (
        <p>{result.message}</p>
      )}
    </form>
  )
}
