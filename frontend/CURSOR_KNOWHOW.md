# Cursor Project Rules と MCP {#cursor-project-rules-and-mcp}

## Cursor エディタの Project Rule とは？ {#what-is-project-rule}

### Project Rulesの概要 {#project-rules-overview}

- **目的**: Project Rulesは、プロジェクトごとにカスタマイズされた指示やガイドラインをAIに与えるための仕組みです。これにより、AIがプロジェクトの背景やルールを理解し、それに基づいた適切なサポートを提供します。
- **保存形式**: Cursorのバージョン0.45以降では、プロジェクトフォルダ内に`.cursor/rules/`というディレクトリが作成され、その中に`.mdc`形式のファイルとしてルールが保存されます。これにより、フォルダやファイルの種類ごとに細かくルールを指定できます。
- **適用範囲**: Project Rulesは、特定のプロジェクト内でのみ適用されるルールであり、プロジェクトのルートディレクトリ以下で動作します。これに対して、Cursor全体に適用される「Rules for AI」とは異なります。

### 主な特徴 {#project-rules-features}

#### 柔軟な条件指定 {#flexible-conditions}

- `globs`という設定を使い、適用するファイルの種類や場所（例: `**/*.tsx`や`pages/**/*.js`）を指定できます。これにより、特定のファイルタイプやディレクトリに限定してルールを適用可能です。

#### 記述内容 {#rule-content}

- ルールファイルには、プロジェクトのコーディング規約、推奨されるライブラリ、使用するフレームワークのバージョン、テストのガイドラインなどを記述します。
- 例: 「Next.js 14以上を使用し、App Routerを採用する」「ESLintとPrettierを必須とする」など。

#### AIのコンテキスト強化 {#ai-context-enhancement}

- AIがプロジェクトの構造や規約を把握するため、より適切で具体的なコード補完や修正提案が可能になります。

#### 自動適用 {#automatic-application}

- 記述したルールは、チャットやコード生成時にAIが自動で判断して適用します。ユーザーが毎回指示を繰り返す必要がありません。

### 旧方式との違い {#comparison-with-old-method}

- **.cursorrulesとの比較**: 以前のCursorでは、プロジェクトのルートに単一の`.cursorrulesファイル`を配置する方法が使われていました。しかし、この方式は1ファイルに全てのルールをまとめるため、細かな管理が難しく、現在は非推奨とされています。Project Rulesへの移行が推奨されています。

### 設定方法 {#project-rules-setup}

1. Cursorの設定画面（Cursor > Settings > General > Project Rules）またはショートカット（Cmd + Shift + Pで「File: New Cursor Rule」）から新しいルールを作成。
2. ルール名を指定すると、`.cursor/rules/`内に`.mdc`ファイルが生成されます。
3. ファイル内に`description`（ルールの説明）と`globs`（適用対象）を記述し、具体的な指示を追加します。

### 具体例 {#project-rules-examples}

以下は、Next.jsプロジェクト向けのProject Rulesのサンプルです：

```plain/text
description: "Next.jsの規約に基づくスタイルガイド"
globs: "pages/**/*.tsx"
eslint-config-nextを使用し、不要なimportを警告
ページコンポーネントはデフォルトエクスポートを必須とする
CSS Modulesを推奨
```

このように設定することで、AIは`pages`ディレクトリ内の`.tsx`ファイルに対して、上記のルールを適用した提案を行います。

### メリット {#project-rules-benefits}

- **一貫性**: チーム開発でのコードスタイルや規約を統一。
- **効率化**: プロジェクト固有のコンテキストをAIが把握するため、手動での説明が減り、開発スピードが向上。
- **カスタマイズ性**: プロジェクトごとに異なる要件を柔軟に反映可能。

CursorのProject Rulesは、特に大規模なプロジェクトやチーム開発において、AIをより効果的に活用するための強力なツールです。これを活用することで、開発者は繰り返し作業を減らし、創造的なタスクに集中できるようになります。

## Cursor の MCP機能とは？ {#what-is-mcp}

### MCP機能の概要 {#mcp-overview}

MCPは、「Model Context Protocol（モデルコンテキストプロトコル）」の略で、Cursorエディタ内でAIエージェント（特にComposerモードのAgent）が外部ツールやリソースと連携するための仕組みです。この機能を使うことで、AIが開発者の作業環境やプロジェクト固有のデータを活用し、より高度でコンテキストに応じたタスク実行を可能にします。

MCPは、Anthropicが提唱したオープンなプロトコルで、AIモデルにカスタムツールを提供するための標準化された方法です。Cursorでは、このプロトコルを採用することで、ユーザーが自分で作成したツールや外部サービスをAIに接続し、シームレスに利用できます。例えば、データベースへのアクセス、ファイル操作、Web検索、またはサードパーティAPIの呼び出しなどをAIが自律的に行えるようになります。

CursorにおけるMCPの主な目的は、AIの機能を拡張し、単なるコード補完やチャットを超えた「実践的な作業支援」を実現することです。これにより、開発者は手動で情報をAIに渡す手間を省き、ワークフローを効率化できます。

### 主な特徴 {#mcp-features}

#### 外部ツールとの統合 {#external-tool-integration}

- MCPサーバーを介して、AIがローカルファイル、データベース、クラウドサービス（例: GitHub、Slack、Jira）などにアクセス可能。
- 例: 「プロジェクトのSQLiteデータベースを調べて、最新のエントリを教えて」と指示すると、AIが直接DBに接続して回答。

#### プロジェクト固有の設定 {#project-specific-settings}

- Cursorでは、プロジェクトごとにMCPサーバーを設定できます（`.cursor/mcp.json`ファイルを使用）。これにより、プロジェクトに応じた専用ツールをAIに提供可能。

#### 柔軟な実装 {#flexible-implementation}

- MCPサーバーはTypeScriptやPythonなどで作成でき、開発者が自由にカスタマイズ可能。公式ドキュメントやオープンソースのサンプルも利用できます。
- 例: 天気情報を取得するツール、Git操作を自動化するツールなど。

#### エージェントモードでの活用 {#agent-mode-utilization}

- Composer内のAgentがMCPツールを自動的に認識し、必要に応じて使用。ユーザーは自然言語で指示を出すだけで、ツールの呼び出しを意識する必要がありません。
- 例: 「最新のGitHubイシューを作成して」と言うと、AgentがMCP経由でGitHub CLIを操作。

#### 承認と安全性 {#approval-and-safety}

- デフォルトでは、AgentがMCPツールを使用する際にユーザー承認を求めます（「Yoloモード」を有効にすると自動実行も可能）。

### 設定方法 {#mcp-setup}

#### MCPサーバーの準備 {#mcp-server-preparation}

- MCPサーバーを自分で作成するか、既存のオープンソースサーバー（例: Web検索用、データベース操作用）をダウンロード。
- サーバーはstdio（標準入出力）またはSSE（サーバー送信イベント）のトランスポートで動作。

#### Cursorへの追加 {#adding-to-cursor}

- Cursorの設定画面（Settings > Features > MCP）を開き、「Add New MCP Server」をクリック。
- サーバーの種類（stdio or SSE）、名前、実行コマンド（例: `node ~/mcp-server/index.js`）またはURLを入力。

#### 動作確認 {#operation-check}

- 追加後、MCP設定画面でツール一覧が表示されれば成功。Composerで「〜をして」と指示すると、AIがツールを利用。

### 具体例 {#mcp-examples}

#### サンプルシナリオ: Web検索ツール {#web-search-tool}

1. MCPサーバーを設定してWeb検索機能を追加。
2. Composerで「最新のReactのリリースノートを教えて」と質問。
3. AgentがMCP経由でWebを検索し、結果を自然言語で返答。

#### サンプルシナリオ: データベース操作 {#database-operation}

1. SQLite用のMCPサーバーを接続。
2. 「データベースからユーザー数をカウントして」と指示。
3. AIがDBにクエリを実行し、「現在のユーザー数は50人です」と回答。

### メリット {#mcp-benefits}

- **効率化**: 外部リソースへのアクセスをAIが代行するため、手動操作が減少。
- **拡張性**: 必要な機能を自由に追加でき、プロジェクトやチームのニーズに柔軟対応。
- **生産性向上**: 単純作業を自動化し、開発者がクリエイティブな作業に集中可能。

### 注意点 {#mcp-cautions}

- **技術的知識が必要**: MCPサーバーの設定や作成には、ある程度のプログラミングスキルが求められる。
- **バージョン依存**: Cursorのアップデート（例: v0.45以降でMCPサポート開始）で機能が改善されているため、最新バージョンを使うのが推奨。
- **セキュリティ**: 外部ツールを利用する際は、アクセス権限やデータの扱いに注意が必要。

CursorのMCP機能は、AIエディタを単なるコード補完ツールから、開発環境全体を支援する「インテリジェントなアシスタント」に進化させる強力な機能です。特に、カスタムツールを活用したい中級以上の開発者や、チームでの生産性を高めたい場合に大きな価値を発揮します。

## MCPのセキュリティ対策 {#mcp-security-measures}

CursorエディタのMCP（Model Context Protocol）機能におけるセキュリティ対策は、外部ツールやリソースとAIを統合する際に重要な考慮事項です。MCPを通じてAIがローカルファイルや外部サービスにアクセスする能力を持つため、不適切な設定や管理がセキュリティリスクを引き起こす可能性があります。

### MCPのセキュリティリスクの概要 {#security-risks-overview}

#### 不正アクセス {#unauthorized-access}

- AIが意図しないファイルやリソースにアクセスする可能性。
- 外部サーバー（MCPサーバー）が悪意あるコードを実行するリスク。

#### データ漏洩 {#data-leakage}

- 機密情報（APIキー、個人データなど）が外部に送信される可能性。

#### 過剰な権限 {#excessive-permissions}

- AIやMCPサーバーに必要以上の権限が与えられ、システム全体に影響を及ぼす恐れ。

#### ユーザー承認の欠如 {#lack-of-user-approval}

- 意図しないツールの実行や操作が自動で行われる可能性。

これらのリスクを軽減するため、CursorやMCPの設計にはいくつかの対策が組み込まれていますが、ユーザー側でも適切な設定と運用が求められます。

### Cursorが提供するMCPのセキュリティ対策 {#cursor-provided-security-measures}

#### ユーザー承認フローのデフォルト設定 {#default-user-approval-flow}

- MCPツールが実行される際、ComposerのAgentはデフォルトでユーザーに確認を求めます。例えば、「このツールを実行しますか？」というダイアログが表示され、許可しない限り動作しません。
- 「Yoloモード」（承認なしで自動実行）を有効にしない限り、安全性が保たれます。

#### ローカルスコープの制限 {#local-scope-restriction}

- MCPサーバーは通常、プロジェクトフォルダ内（`.cursor/mcp.json`で定義された範囲）でのみ動作するよう設計されており、全システムへのアクセスは制限されています。

#### ログと透明性 {#logging-and-transparency}

- MCPサーバーの動作ログが確認可能で、AIが何を実行したかを追跡できます（設定画面やデバッグモードで利用可能）。

#### オープンソースの利用 {#open-source-usage}

- CursorはMCPサーバーのサンプルやドキュメントを公開しており、信頼できるコードベースから始めることが推奨されています。

### ユーザー側で実践すべきセキュリティ対策 {#user-side-security-measures}

#### 1. MCPサーバーの設計と設定 {#server-design-and-configuration}

##### 最小権限の原則（Least Privilege） {#least-privilege-principle}

- MCPサーバーに与える権限を必要最低限に制限。例えば、ファイル操作ツールなら特定のディレクトリのみにアクセス可能にする。
- 例: `fs.readFile`を使用する場合、フルパスではなくプロジェクトルートからの相対パスに限定。

##### 入力バリデーション {#input-validation}

- AIからのリクエストを検証し、不正なコマンド（例: `rm -rf /`）をブロックするロジックを実装。

##### 暗号化 {#encryption}

- MCPサーバーが外部APIと通信する場合、HTTPSや暗号化されたトークンを使用し、データ送信を保護。

##### ソースコードのレビュー {#code-review}

- オープンソースや他者が作成したMCPサーバーを利用する場合は、コードを精査してバックドアや悪意ある動作がないか確認。

#### 2. プロジェクト環境の管理 {#project-environment-management}

##### 機密情報の分離 {#sensitive-info-separation}

- `.env`ファイルやAPIキーなどの機密データをMCPサーバーが直接扱わないようにする。必要なら環境変数を介して間接的に渡す。
- Cursorの`.gitignore`に`.cursor/mcp.json`やログファイルを追加し、機密情報がGitリポジトリにコミットされないようにする。

##### サンドボックス化 {#sandboxing}

- MCPサーバーをDockerコンテナや仮想環境内で動作させ、ローカルシステムへの影響を最小化。
- 例: `docker run --rm -v $(pwd)/project:/app mcp-server`でプロジェクトフォルダだけをマウント。

#### 3. 運用時の注意 {#operational-considerations}

##### 承認プロセスの活用 {#approval-process-utilization}

- 「Yoloモード」をオフにし、毎回ツール実行を承認する運用を維持。特に新しいMCPサーバーを試す際は慎重に。

##### ログ監視 {#log-monitoring}

- MCPサーバーの動作ログを定期的に確認し、異常なリクエストやアクセスがないかチェック。

##### アップデートの適用 {#applying-updates}

- Cursor本体やMCPサーバーの依存ライブラリを最新に保ち、セキュリティパッチを適用。

#### 4. 外部サービスとの連携時 {#external-service-integration}

##### 認証とトークン管理 {#authentication-token-management}

- GitHubやSlackのような外部サービスに接続する場合、短期有効トークン（OAuthなど）を使用し、漏洩リスクを低減。
- APIキーをハードコードせず、環境変数やセキュアな保管庫（例: AWS Secrets Manager）に保存。

##### レート制限 {#rate-limiting}

- MCPサーバーにリクエスト制限を設け、過剰な呼び出しやDoS攻撃を防止。

### 具体的な設定例 {#configuration-examples}

#### MCPサーバーの安全な実装（TypeScript） {#safe-implementation-typescript}

```typescript
import { createMcpServer } from '@cursor/mcp-utils';

// ツール定義
const safeTool = {
  name: 'read_file',
  description: '指定されたプロジェクト内のファイルを読む',
  execute: async (params: { path: string }) => {
    // 入力検証
    if (!params.path || params.path.includes('..')) {
      throw new Error('不正なパス指定');
    }
    // プロジェクトフォルダ内のみ許可
    const safePath = path.join(process.cwd(), params.path);
    return fs.readFileSync(safePath, 'utf-8');
  },
};

// サーバー起動
createMcpServer({
  tools: [safeTool],
  transport: 'stdio',
}).start();
```

#### .cursor/mcp.jsonでの制限 {#mcp-json-restrictions}

```json
{
  "server": {
    "command": "node ./mcp-server.js",
    "transport": "stdio"
  },
  "allowedPaths": ["src/**/*", "docs/**/*"],
  "deniedPaths": ["node_modules/**/*", ".env"]
}
```

この設定では、`src`と`docs`ディレクトリのみアクセスを許可し、機密性の高い`node_modules`や`.env`へのアクセスをブロックします。

### 結論と推奨事項 {#conclusion-recommendations}

CursorのMCP機能は強力ですが、セキュリティを確保するには設計と運用の両方で注意が必要です。以下を常に意識してください：

- **信頼性**: 自分で作成するか、信頼できるソースからのMCPサーバーのみ使用。
- **最小化**: 必要以上の権限やアクセスを避ける。
- **監視**: 動作を定期的に確認し、不審な挙動に即座に対応。

これらの対策を実施することで、MCPを安全かつ効果的に活用し、開発効率を高めつつリスクを最小限に抑えられます。特にチーム開発や機密性の高いプロジェクトでは、セキュリティポリシーを事前に策定し、全員で共有することが重要です。
