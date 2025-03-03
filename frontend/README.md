# PCafe 2025 フロントエンド

Next.js、React、TypeScriptを使用したモダンなウェブアプリケーション。Bunをパッケージマネージャーとして使用し、Node.jsランタイム上で実行します。

## Bunのインストール

このプロジェクトでは、パッケージマネージャーとしてBunを使用することを推奨しています。まだBunをインストールしていない場合は、以下のコマンドでインストールできます：

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via WSL)
curl -fsSL https://bun.sh/install | bash
```

インストール後、以下のコマンドでBunのバージョンを確認できます：

```bash
bun --version
```

## 開発環境のセットアップ

### 前提条件

- Bun 1.0.0以上
- Node.js 22.0.0以上

### 依存関係のインストール

```bash
# Bunを使用して依存関係をインストール（推奨）
bun install
```

### 開発サーバーの起動

```bash
# 開発サーバーの起動（Node.jsランタイム）
bun dev
```

開発サーバーは `http://localhost:3000` で実行されます。

### 実験的なBunランタイムの使用

一部の機能に制限がありますが、実験的にBunランタイムを使用することもできます：

```bash
# Bunランタイムを使用（実験的）
bun dev:bun
```

### ビルドと本番環境

```bash
# 本番用ビルドの作成
bun build

# ビルドしたアプリケーションの起動
bun start
```

### 品質管理

```bash
# リンターの実行
bun lint

# 型チェックの実行
bun typecheck

# テストの実行
bun test
```

## Bunを使用する利点

- **高速なパッケージインストール**: npmやyarnよりも最大80%高速
- **効率的なキャッシュ**: 依存関係のキャッシュが効率的で再インストールが高速
- **Node.jsとの互換性**: 実行時はNode.jsを使用するため互換性の問題が少ない
- **組み込みのテストランナー**: 高速なテスト実行
- **シンプルなコマンド**: 直感的で簡潔なコマンド体系

## プロジェクト構造

- `app/` - App Routerのページとレイアウト
  - `page.tsx` - ホームページ
  - `layout.tsx` - ルートレイアウト
  - `globals.css` - グローバルスタイル
  - `about/` - Aboutページ
- `components/` - 再利用可能なコンポーネント
  - `Hero/` - ヒーローセクションコンポーネント
  - `FeatureList/` - 機能リストコンポーネント
  - `Navigation/` - ナビゲーションコンポーネント
  - `Footer/` - フッターコンポーネント
- `public/` - 静的ファイル（画像など）

## 技術スタック

- **Next.js** - Reactフレームワーク（App Router）
- **React** - UIライブラリ
- **TypeScript** - 型安全な開発
- **CSS Modules** - スコープ付きCSS
- **Bun** - パッケージマネージャー
- **Node.js** - JavaScriptランタイム
