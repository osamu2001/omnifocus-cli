#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
ObjC.import('Foundation');

/**
 * プロジェクト情報を表示する
 * @returns JSON形式のプロジェクト情報
 */
function showProjectMain() {
  /**
   * コマンドライン引数からプロジェクトIDを取得する
   * @returns プロジェクトID
   */
  function getProjectIdFromArgs(): string {
    if (typeof $.NSProcessInfo !== "undefined") {
      const nsArgs = $.NSProcessInfo.processInfo.arguments;
      // osascriptの仕様上、4番目の引数がプロジェクトID
      return nsArgs.count > 4 ? ObjC.unwrap(nsArgs.objectAtIndex(4)) as string : '';
    }
    return '';
  }

  /**
   * IDからプロジェクトを検索する
   * @param doc OmniFocusドキュメント
   * @param projectId 検索するプロジェクトID
   * @returns 見つかったプロジェクト、または null
   */
  function findProjectById(doc: any, projectId: string): any {
    try {
      // flattenedProjectsを使用することで、すべての階層のプロジェクトを一度に取得
      const projects = doc.flattenedProjects();
      
      for (let i = 0; i < projects.length; i++) {
        try {
          if (projects[i].id() === projectId) {
            return projects[i];
          }
        } catch (e) {
          // このプロジェクトの処理中にエラーが発生したら次へ
          continue;
        }
      }
    } catch (e) {
      // プロジェクト取得時にエラーが発生した場合
      console.log(`プロジェクト検索中にエラー: ${e}`);
    }
    return null;
  }

  /**
   * プロジェクトの詳細情報を取得する
   * @param project プロジェクトオブジェクト
   * @returns プロジェクト情報のオブジェクト
   */
  function getProjectInfo(project: any): any {
    if (!project) return null;

    // プロジェクト情報の型定義
    const info: {
      id?: string;
      name?: string;
      note?: string;
      completed?: boolean;
      flagged?: boolean;
      creationDate?: Date;
      modificationDate?: Date;
      tags?: Array<{id: string; name: string}>;
      dueDate?: Date | null;
      priority?: number | null;
      parent?: {id: string | null; name: string | null} | null;
      childProjectCount?: number;
      progress?: number | null;
    } = {};

    // プロパティの安全な取得（エラーが発生しても処理を継続）
    const safeGetProperty = (obj: any, propertyName: string, defaultValue: any = undefined) => {
      try {
        if (typeof obj[propertyName] === 'function') {
          return obj[propertyName]();
        } else {
          return obj[propertyName] || defaultValue;
        }
      } catch (e) {
        return defaultValue;
      }
    };

    // 基本的なプロジェクト情報
    try { info.id = project.id(); } catch (e) {}
    try { info.name = project.name(); } catch (e) {}
    try { info.note = project.note(); } catch (e) {}
    try { info.completed = project.completed(); } catch (e) {}
    try { info.flagged = project.flagged(); } catch (e) {}
    try { info.creationDate = project.creationDate(); } catch (e) {}
    try { info.modificationDate = project.modificationDate(); } catch (e) {}

    // タグ情報
    try {
      const tags = project.tags();
      info.tags = [];
      for (let i = 0; i < tags.length; i++) {
        info.tags.push({
          id: safeGetProperty(tags[i], 'id'),
          name: safeGetProperty(tags[i], 'name')
        });
      }
    } catch (e) {
      info.tags = [];
    }

    // 期日と優先度
    info.dueDate = safeGetProperty(project, 'dueDate', null);
    info.priority = safeGetProperty(project, 'effectivePriority', null);

    // 親プロジェクト情報
    try {
      const parent = safeGetProperty(project, 'parent', null);
      if (parent) {
        info.parent = {
          id: safeGetProperty(parent, 'id', null),
          name: safeGetProperty(parent, 'name', null)
        };
      } else {
        info.parent = null;
      }
    } catch (e) {
      info.parent = null;
    }

    // 子プロジェクト数
    try {
      const children = safeGetProperty(project, 'projects', []) || [];
      info.childProjectCount = children.length;
    } catch (e) {
      info.childProjectCount = 0;
    }

    // プロジェクトの進捗状況（完了タスク / 全タスク）
    try {
      const tasks = safeGetProperty(project, 'flattenedTasks', []) || [];
      const totalTasks = tasks.length;
      let completedTasks = 0;
      
      for (let i = 0; i < totalTasks; i++) {
        if (safeGetProperty(tasks[i], 'completed', false)) {
          completedTasks++;
        }
      }
      
      info.progress = totalTasks > 0 ? (completedTasks / totalTasks) : null;
    } catch (e) {
      info.progress = null;
    }

    return info;
  }

  // メイン処理開始
  const projectId = getProjectIdFromArgs();

  if (!projectId) {
    console.log(`使用法: show_project <projectId>`);
    $.exit(1);
    return;
  }

  try {
    // OmniFocusアプリケーションを起動
    const app = Application('OmniFocus') as any;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;

    // プロジェクトをIDで検索
    const project = findProjectById(doc, projectId);

    if (!project) {
      console.log(`プロジェクトが見つかりません: ${projectId}`);
      $.exit(1);
      return;
    }

    // プロジェクト情報を取得して返す
    const projectInfo = getProjectInfo(project);
    return JSON.stringify(projectInfo, null, 2);
  } catch (e) {
    console.log(`エラー: ${e}`);
    $.exit(1);
    return;
  }
}

showProjectMain();
