import Link from "next/link";
import { getCurrentUser } from '@/src/lib/auth/getCurrentUser'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div>
      <main>
        {!user && (
          <div>
            <Link href="/login/">ログイン</Link>
            <Link href="/signup/">新規登録</Link>
          </div>
        )}
        {user && (
          <>
            <span>
              ようこそ、{user.name}
            </span>
          </>
        )}
      </main>
    </div>
  );
}
