#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのタグを一覧表示する
 * @returns タグ一覧の文字列（ID、パス）
 */
const listTagsMain = (): string => {
  const listTagsRecursive = (tag: any, parentPath: string): string[] => {
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
      console.log(`タグ処理中にエラー: ${e}`);
    }
    return results;
  };

  try {
    const app = Application('OmniFocus') as any;
    app.includeStandardAdditions = true;
    
    const doc = app.defaultDocument;
    const topLevelTags = doc.tags();
    let allTagLines: string[] = [];
    
    if (topLevelTags && topLevelTags.length > 0) {
      for (const topTag of topLevelTags) {
        allTagLines.push(...listTagsRecursive(topTag, ""));
      }
    }
    
    return allTagLines.join("\n");
  } catch (e) {
    console.log(`エラー: ${e}`);
    $.exit(1);
  }
};

listTagsMain();
