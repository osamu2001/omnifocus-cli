#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * 指定したプロジェクトにタスクを追加する
 */
function projectAddTaskMain() {
  /**
   * コマンドライン引数を取得する
   * @returns 必要な引数 [projectID, taskName]
   */
  function getArgsFromCommandLine(): [string, string] {
    if (typeof $.NSProcessInfo !== "undefined") {
      const nsArgs = $.NSProcessInfo.processInfo.arguments;
      // osascriptの仕様上、最初の数個の引数は無視して、4番目と5番目の引数を取得
      const projectID = nsArgs.count > 4 ? ObjC.unwrap(nsArgs.objectAtIndex(4)) as string : '';
      const taskName = nsArgs.count > 5 ? ObjC.unwrap(nsArgs.objectAtIndex(5)) as string : '';
      return [projectID, taskName];
    }
    return ['', ''];
  }

  /**
   * プロジェクトIDからプロジェクトを検索する
   * @param doc OmniFocusドキュメント
   * @param projectID 検索するプロジェクトID
   * @returns 見つかったプロジェクト、または null
   */
  function findProjectById(doc: any, projectID: string): any {
    // 最上位のプロジェクトから検索
    const projects = doc.projects();
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].id() === projectID) {
        return projects[i];
      }
    }
    
    // フォルダ内のプロジェクトも検索
    const folders = doc.folders();
    for (let i = 0; i < folders.length; i++) {
      const folderProjects = folders[i].projects();
      for (let j = 0; j < folderProjects.length; j++) {
        if (folderProjects[j].id() === projectID) {
          return folderProjects[j];
        }
      }
    }
    
    return null;
  }

  // メイン処理開始
  // コマンドライン引数を取得（分割代入を使用）
  const [projectID, taskName] = getArgsFromCommandLine();
  if (!projectID || !taskName) {
    console.log(`使用法: project_add_task <projectID> <taskName>`);
    $.exit(1);
    return null;
  }
  
  try {
    // OmniFocusアプリケーションを起動
    const app = Application("OmniFocus") as any;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    
    // ID指定でプロジェクトを検索
    const targetProject = findProjectById(doc, projectID);
    
    if (!targetProject) {
      console.log(`エラー: プロジェクトが見つかりません: ${projectID}`);
      $.exit(1);
      return null;
    }
    
    // タスクを追加
    targetProject.tasks.push(app.Task({name: taskName}));
    
    // 成功時には何も表示しない
    $.exit(0);
    // returnステートメントを書かないことで出力を抑制
  } catch (e) {
    console.log(`エラー: ${e}`);
    $.exit(1);
  }
}

projectAddTaskMain();
