# why-why
会話ベースで「なぜなぜ分析」を行い、リアルタイムにツリー図として視覚化するWebアプリケーションです。

## 特徴
- **AI対話**: 困りごとをAIに相談すると、原因を深掘りする質問をしてくれます。
- **自動可視化**: 分析の過程が自動的にツリー図（なぜなぜ分析図）として生成・更新されます。
- **インタラクティブ**: 生成されたノードは直接編集可能です。
- **Docker完全対応**: コマンド一つで環境構築から起動まで完了します。

## 起動方法

### 1. 準備
`.env.example` を `.env` にリネーム（コピー）し、APIキーを設定してください。

```bash
cp .env.example .env
```

`.env`ファイル内:
```env
GOOGLE_API_KEY=your_api_key_here
# 使用するAIモデルを指定可能（デフォルト: gemini-2.5-flash）
GOOGLE_AI_MODEL=gemini-2.5-flash
```

### 2. 起動
以下のコマンドでアプリケーションを起動します。

```bash
docker compose up
```
※ 初回のみ、または設定変更時は `docker compose up --build` を推奨します。

### 3. アクセス
ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## 開発について

本環境は **ホットリロード（Hot Reloading）** に対応しています。

- **ソースコードの変更**: `web/` 以下のファイルを変更・保存すると、**ブラウザが自動的に更新されます**。Dockerの再起動は不要です。
- **Dockerの再起動が必要な場合**:
    - `package.json` に新しいライブラリを追加した時
    - `.env` ファイルを変更した時
    - `docker-compose.yml` や `Dockerfile` の設定を変更した時

## 技術スタック
- **Frontend**: Next.js 14, React, TailwindCSS
- **Visualisation**: ReactFlow
- **AI**: Google Generative AI (Gemini)
- **Infrastructure**: Docker, Docker Compose
