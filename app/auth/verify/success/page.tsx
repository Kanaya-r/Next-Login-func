import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>メール認証が完了しました</h1>
      <p>ログインできるようになりました。</p>
      <Link href="/login">ログインへ</Link>
    </main>
  )
}
