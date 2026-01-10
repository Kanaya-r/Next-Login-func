import Link from "next/link";

export default function Home() {
  return (
    <div>
      <main>
        <Link href="/login/">ログイン</Link>
        <Link href="/signup/">新規登録</Link>
      </main>
    </div>
  );
}
