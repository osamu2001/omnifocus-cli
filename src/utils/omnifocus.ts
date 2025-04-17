/**
 * OmniFocusアプリケーションインスタンスを取得します
 */
export function getOmniFocusApp(): ApplicationObject {
  const app = Application('OmniFocus');
  app.includeStandardAdditions = true;
  return app;
}

/**
 * OmniFocusのデフォルトドキュメントを取得します
 */
export function getDefaultDocument(): DocumentObject {
  return getOmniFocusApp().defaultDocument;
}

/**
 * プロジェクトをIDで検索します
 */
export function findProjectById(id: string): ProjectObject | null {
  const doc = getDefaultDocument();
  for (const project of doc.projects) {
    if (project.id === id) {
      return project;
    }
  }
  return null;
}

/**
 * タスクをIDで検索します
 */
export function findTaskById(id: string): TaskObject | null {
  const doc = getDefaultDocument();
  for (const task of doc.tasks) {
    if (task.id === id) {
      return task;
    }
  }
  return null;
}

// 他の共通機能をここに追加可能
