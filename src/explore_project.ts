#!/usr/bin/osascript -l JavaScript

/**
 * OmniFocusプロジェクトのプロパティを探索するスクリプト
 * 
 * このスクリプトはデバッグおよびAPI調査目的で使用します。
 * OmniFocus APIのプロジェクトオブジェクトが持つプロパティやメソッドを
 * 動的に探索し、型定義と実際のAPIの挙動の違いを検証するために役立ちます。
 * 
 * @note エンドユーザー向けではなく、開発・デバッグ用ツールです
 */
ObjC.import('stdlib');

function exploreProject() {
  try {
    // OmniFocusアプリを取得
    const app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    
    // デフォルトドキュメントを取得
    const doc = app.defaultDocument;
    
    // プロジェクトを取得（最初のプロジェクトを使用）
    const projects = doc.flattenedProjects();
    if (!projects || projects.length === 0) {
      console.log("プロジェクトが見つかりません");
      return;
    }
    
    const project = projects[0];
    console.log(`プロジェクト名: ${project.name()}`);
    
    // プロジェクトのプロパティとメソッドを調査
    console.log("\n--- プロジェクトオブジェクトの調査 ---");
    
    // プロジェクトオブジェクトの基本メソッド
    console.log(`\nid: ${project.id()}`);
    console.log(`name: ${project.name()}`);
    
    // 標準的なメソッドの確認
    const methods = [
      'note', 'completed', 'flagged', 'dueDate', 'deferDate', 
      'completionDate', 'creationDate', 'modificationDate', 
      'status', 'effectiveStatus', 'repetitionRule'
    ];
    
    for (const method of methods) {
      try {
        // TypeScriptではanyを明示的に使用して型安全性の警告を回避
        if (typeof (project as any)[method] === 'function') {
          const result = (project as any)[method]();
          console.log(`${method}: ${result || "空"}`);
        } else {
          console.log(`${method}: メソッドではありません`);
        }
      } catch (e) {
        console.log(`${method}()メソッドはサポートされていません: ${e}`);
      }
    }
    
    // 関連オブジェクトを取得するメソッドの確認
    console.log("\n--- 関連オブジェクト取得メソッド ---");
    
    // タスク数
    try {
      const tasks = project.tasks();
      console.log(`タスク数: ${tasks ? tasks.length : 0}`);
    } catch (e) {
      console.log(`tasks()メソッドはサポートされていません: ${e}`);
    }
    
    // フォルダ
    try {
      const folder = project.folder();
      console.log(`フォルダ: ${folder ? folder.name() : "なし"}`);
    } catch (e) {
      console.log(`folder()メソッドはサポートされていません: ${e}`);
    }
    
    // タグ
    try {
      const tags = project.tags();
      console.log(`タグ数: ${tags ? tags.length : 0}`);
    } catch (e) {
      console.log(`tags()メソッドはサポートされていません: ${e}`);
    }
    
    // プロパティ探索
    console.log("\n--- 使用可能なプロパティ/メソッド ---");
    // JavaScriptのリフレクションでプロパティやメソッドを探索
    for (const prop in project) {
      try {
        // TypeScriptではanyを明示的に使用して型安全性の警告を回避
        const value = (project as any)[prop];
        const type = typeof value;
        console.log(`${prop}: ${type}`);
      } catch (e) {
        console.log(`${prop}: アクセスできません`);
      }
    }
    
    return "完了";
  } catch (e) {
    return `エラー: ${e}`;
  }
}

// メイン実行
const projectExploreResult = exploreProject();
console.log(`\n実行結果: ${projectExploreResult}`);
