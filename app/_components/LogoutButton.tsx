'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onLogout = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!res.ok) {
        setLoading(false)
        return
      }

      // Server Components の表示更新のために refresh
      router.refresh()
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button type="button" onClick={onLogout} disabled={loading}>
      {loading ? 'ログアウト中...' : 'ログアウト'}
    </button>
  )
}
