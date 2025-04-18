#!/usr/bin/osascript -l JavaScript

// OmniFocusの型をインポート
/// <reference path="./types/omnifocus.d.ts" />

// JXA環境のセットアップ
ObjC.import('stdlib');
ObjC.import('Foundation');

function showTaskMain(): string | null {
  /**
   * タスクの詳細情報を取得する
   * @param task タスクオブジェクト
   * @returns タスク情報のオブジェクト
   */
  function getTaskInfo(task: OmniFocusTask): TaskInfo | null {
    if (!task) return null;

    try {
      // 基本的なプロパティを一括で取得
      const info: TaskInfo = {
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
        containingTask: null
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
   * コマンドライン引数を取得する
   * @returns 引数の配列
   */
  function getCommandLineArguments(): string[] {
    const args: string[] = [];
    if (typeof $.NSProcessInfo !== "undefined") {
      const nsArgs = $.NSProcessInfo.processInfo.arguments;
      for (let i = 0; i < nsArgs.count; i++) {
        args.push(ObjC.unwrap<string>(nsArgs.objectAtIndex(i)));
      }
    }
    return args;
  }

  // メイン処理
  const args = getCommandLineArguments();
  const taskId = args[4] || null;
  
  if (!taskId) {
    console.log("Usage: show_task.ts [taskId]");
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
      console.log(`タスクが見つかりません: ${taskId}`);
      return null;
    }

    // タスク情報の取得
    const taskInfo = getTaskInfo(targetTask);
    if (!taskInfo) {
      console.log("タスク情報の取得に失敗しました");
      return null;
    }
    
    return JSON.stringify(taskInfo, null, 2);
  } catch (e) {
    console.log(`実行エラー: ${e}`);
    return null;
  }
}

// メイン関数を実行
showTaskMain();
