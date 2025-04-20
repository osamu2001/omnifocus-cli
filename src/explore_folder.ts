#!/usr/bin/osascript -l JavaScript

/**
 * OmniFocusフォルダのプロパティを探索するスクリプト
 * 
 * このスクリプトはデバッグおよびAPI調査目的で使用します。
 * OmniFocus APIのフォルダオブジェクトが持つプロパティやメソッドを
 * 動的に探索し、型定義と実際のAPIの挙動の違いを検証するために役立ちます。
 * 
 * @note エンドユーザー向けではなく、開発・デバッグ用ツールです
 */
ObjC.import('stdlib');

const exploreFolder = () => {
  try {
    const app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    
    const doc = app.defaultDocument;
    
    const folders = doc.flattenedFolders();
    if (!folders || folders.length === 0) {
      console.log("フォルダが見つかりません");
      return;
    }
    
    const folder = folders[0];
    console.log(`フォルダ名: ${folder.name()}`);
    
    console.log("\n--- フォルダオブジェクトの調査 ---");
    
    console.log(`\nid: ${folder.id()}`);
    console.log(`name: ${folder.name()}`);
    
    try {
      const note = folder.note();
      console.log(`note: ${note || "空"}`);
    } catch (e) {
      console.log(`note()メソッドはサポートされていません: ${e}`);
    }
    
    try {
      const creationDate = folder.creationDate();
      console.log(`creationDate: ${creationDate}`);
    } catch (e) {
      console.log(`creationDate()メソッドはサポートされていません: ${e}`);
    }
    
    try {
      const modificationDate = folder.modificationDate();
      console.log(`modificationDate: ${modificationDate}`);
    } catch (e) {
      console.log(`modificationDate()メソッドはサポートされていません: ${e}`);
    }
    
    console.log("\n--- 使用可能なプロパティ/メソッド ---");
    for (const prop in folder) {
      try {
        const value = (folder as any)[prop];
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
};

// メイン実行
const folderExploreResult = exploreFolder();
console.log(`\n実行結果: ${folderExploreResult}`);
