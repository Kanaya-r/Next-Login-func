import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>無効なURLです</h1>
      <p>リンクが正しくない可能性があります。</p>
      <Link href="/">トップへ戻る</Link>
    </main>
  )
}
