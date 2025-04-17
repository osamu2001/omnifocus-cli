#!/usr/bin/osascript -l JavaScript

// @ts-nocheck
// TypeScriptでJXA用の型を利用

/**
 * OmniFocusのインボックスにある未完了タスクを一覧表示する
 */

const app = Application('OmniFocus');
app.includeStandardAdditions = true;

const inboxTasks = app.defaultDocument.inboxTasks();
const result: string[] = [];

for (const task of inboxTasks) {
  if (!task.completed()) {
    result.push(`${task.id()}\t${task.name()}`);
  }
}

result.join("\n");
