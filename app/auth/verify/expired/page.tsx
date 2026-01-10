import Link from "next/link";

export default function Page() {
  return (
    <main>
      <h1>有効期限が切れたURLです</h1>
      <p>
        この確認リンクは期限切れ、または無効化されています。
        お手数ですが、もう一度サインアップを行い、確認メールを再送してください。
      </p>
      <Link href="/signup">サインアップへ戻る</Link>
    </main>
  )
}
