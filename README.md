# OmniFocus CLI

TypeScriptで書かれたOmniFocus操作のためのコマンドラインインターフェース（CLI）ツール集です。

## 概要

このプロジェクトはOmniFocusをJavaScript for Automation (JXA) を使って操作するCLIツール群です。TypeScriptで開発し、ビルド時にJXA互換のJavaScriptに変換しています。

## 機能

- プロジェクトの追加・表示
- タスクの追加・表示
- フォルダ・タグ・パースペクティブの一覧表示
- その他OmniFocus管理機能

## 必要環境

- Node.js (v14以上)
- npm または yarn
- macOS (JXAを使用するため)
- OmniFocus

## セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/osamu2001/omnifocus-cli.git
cd omnifocus-cli

# 依存パッケージのインストール
npm install
```

## ビルド方法

TypeScriptのソースコードからJXA互換のJavaScriptファイルを生成するには以下のコマンドを実行します：

```bash
# ビルド実行
npm run build

# 開発中の自動ビルド（ファイル変更を監視）
npm run watch
```

ビルド後のファイルは `dist` ディレクトリに生成されます。生成されたJSファイルに実行権限を付与することを忘れないでください：

```bash
# 実行権限の付与
chmod +x dist/*.js
```

## 使用方法

生成されたスクリプトは以下のように実行できます：

```bash
# プロジェクトの追加
./dist/add_project.js "プロジェクト名"

# タスクの追加
./dist/add_task.js "タスク名"
```

## 開発

### ファイル構成

- `src/` - TypeScriptのソースコード
- `dist/` - ビルドされたJXAファイル（自動生成）
- `original/` - 元のJXAファイル（参照用）

### 新規スクリプト追加の流れ

1. `src/` ディレクトリに `.ts` ファイルを作成
2. TypeScriptで実装（必要に応じて `@ts-ignore` や `@ts-nocheck` を使用）
3. `npm run build` でコンパイル
4. `chmod +x dist/新ファイル.js` で実行権限を付与

## ライセンス

ISC
