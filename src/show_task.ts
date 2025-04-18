#!/usr/bin/osascript -l JavaScript

// OmniFocusの型をインポート
/// <reference path="./types/omnifocus.d.ts" />
/// <reference path="./types/jxa.d.ts" />

// JXA環境のセットアップ
ObjC.import('stdlib');
ObjC.import('Foundation');

function showTaskMain(): string | null {
  /**
   * タスク詳細情報を表すインターフェース（拡張版）
   */
  interface TaskDetailInfo {
    id: string;
    name: string;
    note: string;
    completed: boolean;
    flagged: boolean;
    deferDate: Date | null;
    dueDate: Date | null;
    creationDate: Date;
    modificationDate: Date;
    completionDate: Date | null;
    estimatedMinutes: number | null;
    repetitionRule: any | null;
    containingProject: { id: string; name: string } | null;
    containingTask: { id: string; name: string } | null;
    tags: Array<{ id: string; name: string }>;
    subtasks: Array<{ id: string; name: string }>;
  }

  /**
   * タスクの詳細情報を取得する
   * @param task タスクオブジェクト
   * @returns タスク情報のオブジェクト
   */
  function getTaskInfo(task: OmniFocusTask): TaskDetailInfo | null {
    if (!task) return null;

    try {
      // 基本的なプロパティを一括で取得
      const info: TaskDetailInfo = {
        id: task.id(),
        name: task.name(),
        note: task.note(),
        completed: task.completed(),
        flagged: task.flagged(),
        deferDate: task.deferDate(),
        dueDate: task.dueDate(),
        creationDate: task.creationDate(),
        modificationDate: task.modificationDate(),
        completionDate: task.completionDate(),
        estimatedMinutes: task.estimatedMinutes(),
        repetitionRule: task.repetitionRule(),
        // containingTaskはstring型として定義されているが、実際にはOmniFocusTaskオブジェクトが返されるため、
        // 型の不整合を避けるため直接nullを設定
        containingTask: null,
        containingProject: null,
        tags: [],
        subtasks: []
      };

      // 親プロジェクト情報の取得
      try {
        const containingProject = task.containingProject();
        info.containingProject = containingProject ? {
          id: containingProject.id(),
          name: containingProject.name()
        } : null;
      } catch (e) {
        console.log(`親プロジェクト情報取得エラー: ${e}`);
        info.containingProject = null;
      }

      // タグ情報の取得
      try {
        const tags = task.tags();
        info.tags = [];
        for (const tag of tags) {
          info.tags.push({
            id: tag.id(),
            name: tag.name()
          });
        }
      } catch (e) {
        console.log(`タグ情報取得エラー: ${e}`);
        info.tags = [];
      }

      // サブタスク情報の取得
      try {
        const subtasks = task.tasks();
        info.subtasks = [];
        for (const subtask of subtasks) {
          info.subtasks.push({
            id: subtask.id(),
            name: subtask.name()
          });
        }
      } catch (e) {
        console.log(`サブタスク情報取得エラー: ${e}`);
        info.subtasks = [];
      }

      return info;
    } catch (e) {
      console.log(`タスク基本情報取得エラー: ${e}`);
      return null;
    }
  }

  /**
   * コマンドライン引数からタスクIDを取得する
   * @returns タスクID
   */
  function getTaskIdFromArgs(): string | null {
    if (typeof $.NSProcessInfo === "undefined") {
      return null;
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
      return userArgs[0] || null; // 最初の引数をタスクIDとして返す
    }
    
    return null;
  }

  // メイン処理
  const taskId = getTaskIdFromArgs();
  
  if (!taskId) {
    console.log("エラー: タスクIDを指定してください。");
    console.log("使用方法: show_task.ts <taskId>");
    $.exit(1);
    return null;
  }

  try {
    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    
    // タスクをIDで検索
    const tasks = doc.flattenedTasks();
    let targetTask: OmniFocusTask | null = null;
    
    // for...of構文に変更
    for (const task of tasks) {
      try {
        if (task.id() === taskId) {
          targetTask = task;
          break;
        }
      } catch (e) {
        // 重要なエラーではないため、ログは非表示にする
      }
    }

    if (!targetTask) {
      console.log(`エラー: タスクが見つかりません: ${taskId}`);
      $.exit(1);
      return null;
    }

    // タスク情報の取得
    const taskInfo = getTaskInfo(targetTask);
    if (!taskInfo) {
      console.log("エラー: タスク情報の取得に失敗しました");
      $.exit(1);
      return null;
    }
    
    return JSON.stringify(taskInfo, null, 2);
  } catch (e) {
    console.error(`実行エラー: ${e}`);
    $.exit(1);
    return null;
  }
}

// メイン関数を実行
showTaskMain();
