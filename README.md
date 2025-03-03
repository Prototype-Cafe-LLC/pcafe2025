# PCafe 2025 プロジェクト

## プロジェクト構成

このリポジトリは以下のディレクトリ構造になっています：

- `frontend/` - Next.js/React/TypeScriptを使用したフロントエンドアプリケーション

## フロントエンド開発

フロントエンド開発には、パッケージマネージャーとしてBunを使用することを推奨しています。

### Bunのインストール

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (via WSL)
curl -fsSL https://bun.sh/install | bash
```

### 開発環境のセットアップ

```bash
# frontendディレクトリに移動
cd frontend

# 依存関係のインストール
bun install

# 開発サーバーの起動
bun dev
```

開発サーバーは `http://localhost:3000` で実行されます。

詳細な手順については、[frontend/README.md](frontend/README.md)を参照してください。

## 技術スタック

### フロントエンド

- Next.js (App Router)
- React
- TypeScript
- CSS Modules
- Bun (パッケージマネージャー)
- Node.js (ランタイム)

## Node.jsバージョン

このプロジェクトはNode.js 22を使用しています。`.nvmrc`ファイルが設定されているため、nvmを使用している場合は自動的に正しいバージョンが選択されます。

```bash
# nvmを使用してNode.jsバージョンを設定
nvm use
```
