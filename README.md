# Next.js 認証アプリケーション

Next.js と Prisma を使用したフル機能の認証システムです。ユーザー登録、メール認証、ログイン、セッション管理を含む完全な認証フローを実装しています。

## 機能

- ✨ **ユーザー登録** - 新規アカウントの作成
- 📧 **メール認証** - トークンベースのメールアドレス検証
- 🔐 **ログイン/ログアウト** - セキュアな認証フロー
- 🔒 **パスワードのハッシュ化** - bcryptjs によるセキュアなパスワード管理
- 🎫 **セッション管理** - トークンベースのセッション（7日間有効）
- 🗑️ **自動クリーンアップ** - 期限切れトークンと未検証ユーザーの削除
- 💾 **SQLite データベース** - Prisma ORM を使用した軽量データベース

## 技術スタック

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router)
- **言語**: TypeScript
- **データベース**: SQLite
- **ORM**: [Prisma](https://www.prisma.io/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **認証**: カスタム実装（bcryptjs）
- **ランタイム**: Node.js

## プロジェクト構造

```
├── app/                      # Next.js App Router
│   ├── api/auth/            # 認証 API エンドポイント
│   │   ├── login/           # ログイン API
│   │   ├── logout/          # ログアウト API
│   │   ├── signup/          # サインアップ API
│   │   └── verify/          # メール認証 API
│   ├── auth/verify/         # 認証結果ページ
│   ├── login/               # ログインページ
│   └── signup/              # サインアップページ
├── src/lib/                 # ユーティリティとヘルパー
│   └── auth/                # 認証ロジック
│       ├── session.ts       # セッション管理
│       ├── token.ts         # トークン生成・検証
│       ├── cleanup.ts       # データベースクリーンアップ
│       └── getCurrentUser.ts # ユーザー取得
├── prisma/                  # データベース設定
│   ├── schema.prisma        # データベーススキーマ
│   └── migrations/          # マイグレーションファイル
└── public/                  # 静的ファイル
```

## データベーススキーマ

### User（ユーザー）
- ユーザーの基本情報を管理
- メールアドレスの検証状態を追跡

### VerificationToken（検証トークン）
- メール認証用のワンタイムトークン
- 有効期限と使用状態を管理

### Session（セッション）
- ユーザーのログインセッションを管理
- 7日間の有効期限

## セットアップ

### 前提条件

- Node.js 20.x 以降
- npm, yarn, pnpm, または bun

### インストール

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd Next-Login-func
```

2. 依存関係をインストール:
```bash
npm install
# または
yarn install
# または
pnpm install
```

3. 環境変数を設定（オプション）:
```bash
# .env.local ファイルを作成
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. データベースを初期化:
```bash
npx prisma migrate dev
```

## 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 使用方法

### 1. ユーザー登録
- `/signup` にアクセス
- ユーザー名、メールアドレス、パスワード（8文字以上）を入力
- 登録後、検証トークンが生成されます

### 2. メール認証
- 検証URL（`/api/auth/verify?token=...`）にアクセス（ターミナルに表示されます）
- トークンが有効な場合、メールアドレスが認証されます

### 3. ログイン
- `/login` にアクセス
- メールアドレスとパスワードを入力
- ログイン成功後、セッションが作成されます

### 4. ログアウト
- ログインページまたはホームページのログアウトボタンをクリック

## API エンドポイント

### POST `/api/auth/signup`
新規ユーザーを登録

**リクエストボディ:**
```json
{
  "name": "ユーザー名",
  "email": "user@example.com",
  "password": "password123"
}
```

### POST `/api/auth/login`
ユーザーログイン

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET `/api/auth/verify?token=xxx`
メールアドレスを認証

### POST `/api/auth/logout`
ログアウト

## セキュリティ機能

- ✅ パスワードは bcryptjs でハッシュ化
- ✅ セッショントークンは暗号学的に安全な乱数生成
- ✅ 検証トークンは SHA-256 でハッシュ化
- ✅ 期限切れセッションと未検証ユーザーの自動削除
- ✅ トークンの一回限りの使用を保証

## スクリプト

```bash
# 開発サーバーを起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバーを起動
npm start

# リント
npm run lint
```

## Prisma コマンド

```bash
# マイグレーションを作成して実行
npx prisma migrate dev

# Prisma Studio でデータベースを確認
npx prisma studio

# Prisma Client を再生成
npx prisma generate
```

## デプロイ

### Vercel へのデプロイ

最も簡単な方法は [Vercel Platform](https://vercel.com/new) を使用することです。

詳細は [Next.js デプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying) を参照してください。

## ライセンス

このプロジェクトはプライベートプロジェクトです。

## リソース

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
