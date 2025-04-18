#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用sr/bin/env osascript -l JavaScript

// @ts-nocheck
// TypeScriptでJXA用の型を利用
function projectAddTaskMain() {
  ObjC.import('stdlib');

  /**
   * コマンドライン引数を取得します
   * @returns {string[]} コマンドライン引数の配列
   */
  function getCommandLineArguments(): string[] {
    const args: string[] = [];
    if (typeof $.NSProcessInfo !== "undefined") {
      const nsArgs = $.NSProcessInfo.processInfo.arguments;
      for (let i = 0; i < nsArgs.count; i++) {
        args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
      }
      return args.slice(4);
    }
    return args;
  }

  /**
   * プロジェクトIDが有効かどうかを検証します
   * @param projectId プロジェクトID
   * @returns プロジェクトIDが有効な場合はtrue、そうでない場合はfalse
   */
  function validateProjectId(projectId: string): boolean {
    return typeof projectId === "string" && projectId.trim().length > 0;
  }

  /**
   * プロジェクトIDからプロジェクトを検索します
   * @param doc OmniFocusのドキュメント
   * @param projectId 検索対象のプロジェクトID
   * @returns 見つかったプロジェクト、見つからない場合はnull
   */
  function findProjectById(doc: any, projectId: string): any | null {
    // トップレベルのプロジェクトを検索
    const topProjects = doc.projects();
    for (const p of topProjects) {
      if (p.id() === projectId) {
        return p;
      }
    }
    
    // フォルダ内のプロジェクトを再帰的に検索
    function searchFolders(folders: any[]): any | null {
      for (const folder of folders) {
        const projects = folder.projects();
        for (const p of projects) {
          if (p.id() === projectId) {
            return p;
          }
        }
        const subfolders = folder.folders();
        const found = searchFolders(subfolders);
        if (found) return found;
      }
      return null;
    }
    return searchFolders(doc.folders());
  }

  // メイン処理
  const args = getCommandLineArguments();
  const projectID = args[0];
  const taskName = args[1];
  let result = null;

  if (!validateProjectId(projectID) || taskName == null || typeof taskName !== "string" || taskName.trim().length === 0) {
    console.log('Error: Usage: project_add_task.ts <projectID> <taskName>');
    $.exit(1);
  } else {
    try {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      const doc = app.defaultDocument;

      const targetProject = findProjectById(doc, projectID);

      if (!targetProject) {
        console.log('Error: Project not found: ' + projectID);
        $.exit(1);
      } else {
        targetProject.tasks.push(app.Task({ name: taskName }));
        $.exit(0);
      }
    } catch (e) {
      console.log('Error: ' + (e as Error).message);
      $.exit(1);
    }
  }
  return null;
}

projectAddTaskMain();
