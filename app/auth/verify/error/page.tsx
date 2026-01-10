import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>エラーが発生しました</h1>
      <p>時間をおいて再度お試しください。</p>
      <Link href="/">トップへ戻る</Link>
    </main>
  )
}
