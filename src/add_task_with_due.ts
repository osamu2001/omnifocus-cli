#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

const addTaskWithDueMain = () => {
  // 引数から分数とタスク名を取得
  const getArgs = (): { minutes: number; taskName: string } | null => {
    if (typeof $.NSProcessInfo === "undefined") {
      return null;
    }
    const nsArgs = $.NSProcessInfo.processInfo.arguments;
    const allArgs = Array.from({ length: nsArgs.count }, (_, i) => 
      ObjC.unwrap(nsArgs.objectAtIndex(i)) as string
    );
    // スクリプト名の後ろから2つを取得
    const scriptNameIndex = Math.min(3, allArgs.length - 1);
    if (scriptNameIndex + 2 < allArgs.length) {
      const userArgs = allArgs.slice(scriptNameIndex + 1);
      const minutes = parseInt(userArgs[0], 10);
      const taskName = userArgs.slice(1).join(" ");
      if (isNaN(minutes) || !taskName) return null;
      return { minutes, taskName };
    }
    return null;
  };

  // 指定分後のDateを返す
  const getDueDate = (minutes: number): Date => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
  };

  // タスクを追加
  const addTaskToInboxWithDue = (taskName: string, dueDate: Date): void => {
    try {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      const doc = app.defaultDocument;
      const inbox = doc.inboxTasks;
      // dueDateとdeferDate（延期）を同じ日時に設定し、フラグも立てる
      inbox.push(app.InboxTask({ name: taskName, dueDate: dueDate, deferDate: dueDate, flagged: true }));
    } catch (e) {
      console.log(`エラー: タスクの追加中にエラーが発生しました: ${e}`);
    }
  };

  const args = getArgs();
  if (!args) {
    console.log("エラー: 第一引数に分数、第二引数にタスク名を指定してください。");
    $.exit(1);
    return;
  }
  const dueDate = getDueDate(args.minutes);
  addTaskToInboxWithDue(args.taskName, dueDate);
};

addTaskWithDueMain();
