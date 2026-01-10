import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>有効期限が切れたURLです</h1>
      <p>
        この確認リンクは期限切れ、または無効化されています。
      </p>
      <Link href="/">トップへ戻る</Link>
    </main>
  )
}
