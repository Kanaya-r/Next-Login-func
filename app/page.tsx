import Link from "next/link";
import { getCurrentUser } from '@/src/lib/auth/getCurrentUser'
import LogoutButton from '@/app/_components/LogoutButton'

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
            <LogoutButton />
          </>
        )}
      </main>
    </div>
  );
}
