import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>無効なURLです</h1>
      <p>リンクが正しくない可能性があります。お手数ですが、もう一度サインアップを行ってください。</p>
      <Link href="/signup">サインアップへ戻る</Link>
    </main>
  )
}
