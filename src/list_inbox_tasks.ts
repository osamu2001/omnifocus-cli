#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用

/**
 * OmniFocusのインボックスにある未完了タスクを一覧表示する
 */

function listInboxTasksMain() {
  const app = Application('OmniFocus') as OmniFocusApplication;
  app.includeStandardAdditions = true;

  const inboxTasks = app.defaultDocument.inboxTasks();
  const result: string[] = [];

  for (const task of inboxTasks) {
    if (!task.completed()) {
      result.push(`${task.id()}\t${task.name()}`);
    }
  }

  return result.join("\n");
}

listInboxTasksMain();
