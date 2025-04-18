#!/usr/bin/osascript -l JavaScript
"use strict";
// @ts-nocheck
// TypeScriptでJXA用の型を利用
/**
 * OmniFocusのインボックスにある未完了タスクを一覧表示する
 */
// @ts-ignore
const app = Application('OmniFocus');
// @ts-ignore
app.includeStandardAdditions = true;
// @ts-ignore
const inboxTasks = app.defaultDocument.inboxTasks();
const result = [];
// @ts-ignore
for (const task of inboxTasks) {
    if (!task.completed()) {
        result.push(`${task.id()}\t${task.name()}`);
    }
}
result.join("\n");
