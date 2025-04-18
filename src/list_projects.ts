#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのプロジェクト一覧を表示する
 * 出力形式: プロジェクトID\tフォルダパス/プロジェクト名
 */
function listProjectsMain() {
  /**
   * OmniFocusオブジェクトが有効かチェックする
   * @param obj 検証するオブジェクト
   * @returns 有効ならtrue、無効ならfalse
   */
  function isValidObject(obj: any): boolean {
    if (!obj) return false;
    
    try {
      // Objectiveベースのオブジェクト参照の検証
      if (typeof obj === 'object' && obj.toString && obj.toString() === '[object Reference]') {
        return false;
      }
      
      // unwrapしたときにundefinedになるものは無効
      if (ObjC.unwrap(obj) === undefined) {
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * フォルダの完全なパスを取得する
   * @param folder フォルダオブジェクト
   * @returns フォルダの完全なパス
   */
  function getFullFolderPath(folder: any): string {
    // フォルダが無効なら空文字を返す
    if (!isValidObject(folder) || typeof folder.name !== "function") {
      return "";
    }
    
    try {
      let folderName = folder.name();
      
      // 親フォルダを取得
      let parent: any = null;
      try {
        parent = folder.container();
      } catch (e) {
        return folderName;
      }
      
      // 親がフォルダでなければ現在のフォルダ名を返す
      if (!isValidObject(parent) || 
          typeof parent.class !== "function" || 
          parent.class() !== "folder") {
        return folderName;
      }
      
      // 親フォルダのパスを再帰的に取得
      let parentPath = getFullFolderPath(parent);
      return parentPath ? `${parentPath}/${folderName}` : folderName;
    } catch (e) {
      return "";
    }
  }

  try {
    // OmniFocusアプリケーションの取得
    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    
    // プロジェクト一覧の取得
    const projects = doc.flattenedProjects();
    const lines: string[] = [];

    // 各プロジェクトの情報を収集
    for (const project of projects) {
      try {
        // 完了・ドロップ済みのプロジェクトは除外
        const status = project.status();
        if (status === "completed" || status === "dropped" || status === "done status") {
          continue;
        }
        
        // プロジェクト名とIDを取得
        const projectName = project.name();
        const projectID = project.id();
        
        // フォルダの取得と処理
        try {
          const folder: any = project.folder();
          
          // フォルダが有効であればパスを取得
          if (isValidObject(folder)) {
            const folderPath = getFullFolderPath(folder);
            lines.push(`${projectID}\t${folderPath}/${projectName}`);
          } else {
            // フォルダがなければプロジェクト名のみ表示
            lines.push(`${projectID}\t${projectName}`);
          }
        } catch (e) {
          // フォルダ取得エラーの場合はプロジェクト名のみ表示
          lines.push(`${projectID}\t${projectName}`);
        }
      } catch (e) {
        // このプロジェクトの処理中にエラーが発生したらスキップ
        continue;
      }
    }

    return lines.join("\n");
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    return "";
  }
}

listProjectsMain();
