#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * 指定されたタグIDに関連する未完了タスクを一覧表示します
 * 使用例: ./dist/list_tag_tasks.js タグID
 * タグIDなしで実行した場合はタグなしタスクを表示します
 * 
 * 出力形式: タスクID\tタスク名
 */
function listTagTasksMain() {
  /**
   * コマンドライン引数からタグIDを取得します
   * @returns タグID（指定がない場合は空文字列）
   */
  function getTagIDFromArgs(): string {
    if (typeof $.NSProcessInfo === "undefined") {
      return "";
    }
    
    const nsArgs = $.NSProcessInfo.processInfo.arguments;
    const allArgs = Array.from({ length: nsArgs.count }, (_, i) => 
      ObjC.unwrap(nsArgs.objectAtIndex(i)) as string
    );
    
    // スクリプト名を見つける（通常は4番目の引数）
    // スクリプト名の後の引数がユーザーの実際の引数
    const scriptNameIndex = Math.min(3, allArgs.length - 1); // 安全のため
    
    // スクリプト名の後の引数を返す（あれば）
    if (scriptNameIndex + 1 < allArgs.length) {
      const userArgs = allArgs.slice(scriptNameIndex + 1);
      return userArgs[0] || ""; // 最初の引数をタグIDとして返す
    }
    
    // ユーザー指定の引数がない場合は空文字列を返す
    return "";
  }

  /**
   * タスクが指定されたタグ条件に一致するか確認します
   * @param task 確認対象のタスク
   * @param tagId 検索するタグID（空文字列の場合はタグなしタスクを検索）
   * @returns 条件に一致する場合はtrue
   */
  function matchesTagCondition(task: OmniFocusTask, tagId: string): boolean {
    try {
      // タグの取得
      const tags = task.tags();
      
      if (tagId) {
        // 特定のタグIDを持つタスクをフィルタリング
        return tags.some(tag => tag.id() === tagId);
      } else {
        // タグがないタスクをフィルタリング（プロジェクトに属しているもののみ）
        return tags.length === 0 && typeof task.containingProject === "function";
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * タスクが表示条件に一致するか確認します
   * @param task 確認対象のタスク
   * @param tagId 検索するタグID
   * @returns 表示条件に一致する場合はtrue
   */
  function isDisplayableTask(task: OmniFocusTask, tagId: string): boolean {
    try {
      // 完了済みのタスクは除外
      if (task.completed()) return false;

      // 延期されているタスクは除外
      const deferDate = task.deferDate();
      if (deferDate && deferDate > new Date()) return false;

      // ブロックされているタスクは除外（オプショナルプロパティのため条件分岐）
      if (task.blocked && task.blocked()) return false;

      // タグ条件のチェック
      return matchesTagCondition(task, tagId);
    } catch (e) {
      return false;
    }
  }

  /**
   * タスクのコレクションから条件に一致するタスクを収集します
   * @param tasks タスクのコレクション
   * @param tagId 検索するタグID
   * @param results 結果を格納する配列
   */
  function collectMatchingTasks(tasks: OmniFocusTask[], tagId: string, results: string[]): void {
    for (const task of tasks) {
      try {
        if (isDisplayableTask(task, tagId)) {
          results.push(`${task.id()}\t${task.name()}`);
        }
      } catch (e) {
        // 個別タスクの処理エラーは無視して次へ
        continue;
      }
    }
  }

  // メイン処理
  try {
    const tagId = getTagIDFromArgs();

    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    const results: string[] = [];

    // インボックスタスクを処理
    try {
      const inboxTasks = doc.inboxTasks();
      collectMatchingTasks(inboxTasks, tagId, results);
    } catch (e) {
      console.log(`インボックスタスク取得エラー: ${e}`);
    }

    // プロジェクトタスクを処理
    try {
      // 利用可能なメソッドを使用してプロジェクト一覧を取得
      const projects = typeof doc.flattenedProjects === "function" ? 
                      doc.flattenedProjects() : 
                      doc.projects();

      for (const project of projects) {
        try {
          // 利用可能なメソッドを使用してタスク一覧を取得
          const tasks = typeof project.flattenedTasks === "function" ? 
                        project.flattenedTasks() : 
                        typeof project.tasks === "function" ? 
                        project.tasks() : [];

          collectMatchingTasks(tasks, tagId, results);
        } catch (e) {
          // 個々のプロジェクト処理エラーは無視
          continue;
        }
      }
    } catch (e) {
      console.log(`プロジェクト一覧取得エラー: ${e}`);
    }

    // 結果を返す（JXAスクリプトとして実行される場合は自動的に出力される）
    return results.length > 0 ? 
           results.join("\n") : 
           "指定されたタグのタスクが見つかりませんでした";
  } catch (e) {
    console.log(`実行エラー: ${e}`);
    return `エラー: ${e}`;
  }
}

listTagTasksMain();
