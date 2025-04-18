#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
/**
 * OmniFocusのインボックスにある未完了タスクを一覧表示する
 */
function listInboxTasksMain() {
    const omnifocusApp = Application('OmniFocus');
    omnifocusApp.includeStandardAdditions = true;
    const document = omnifocusApp.defaultDocument;
    const inboxTasks = document.inboxTasks();
    const result = [];
    for (const task of inboxTasks) {
        if (!task.completed()) {
            result.push(`${task.id()}\t${task.name()}`);
        }
    }
    return result.join("\n");
}
listInboxTasksMain();
