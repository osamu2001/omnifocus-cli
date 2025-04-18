#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのタグを一覧表示する
 * @returns タグ一覧の文字列（ID、パス）
 */
function listTagsMain() {
  /**
   * タグを再帰的にリストアップする関数
   * @param tag タグオブジェクト
   * @param parentPath 親タグのパス
   * @returns タグ情報の配列
   */
  function listTagsRecursive(tag: any, parentPath: string): string[] {
    const results: string[] = [];
    try {
      const currentName = tag.name();
      const currentId = tag.id();
      if (!currentName || !currentId) return results;
      
      const fullPath = parentPath ? `${parentPath}/${currentName}` : currentName;
      results.push(`${currentId}\t${fullPath}`);
      
      const subtags = tag.tags();
      if (subtags && subtags.length > 0) {
        for (const subtag of subtags) {
          results.push(...listTagsRecursive(subtag, fullPath));
        }
      }
    } catch (e) {
      // エラーが発生した場合は空の結果を返す
      console.log(`タグ処理中にエラー: ${e}`);
    }
    return results;
  }

  try {
    // OmniFocusを起動し、タグ一覧を取得
    const app = Application('OmniFocus') as any;
    app.includeStandardAdditions = true;
    
    const doc = app.defaultDocument;
    const topLevelTags = doc.tags();
    let allTagLines: string[] = [];
    
    // トップレベルタグがあれば再帰的に処理
    if (topLevelTags && topLevelTags.length > 0) {
      for (const topTag of topLevelTags) {
        allTagLines.push(...listTagsRecursive(topTag, ""));
      }
    }
    
    // 結果を返す（JXAは return の値が標準出力に出力される）
    return allTagLines.join("\n");
  } catch (e) {
    // エラーメッセージを表示して終了
    console.log(`エラー: ${e}`);
    $.exit(1);
  }
}

listTagsMain();
