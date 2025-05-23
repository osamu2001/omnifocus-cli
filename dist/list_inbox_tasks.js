#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
/**
 * OmniFocusのインボックスにある未完了タスクを一覧表示する
 */
const listInboxTasksMain = () => {
    const app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    const inboxTasks = app.defaultDocument.inboxTasks();
    const result = [];
    for (const task of inboxTasks) {
        if (!task.completed()) {
            result.push(`${task.id()}\t${task.name()}`);
        }
    }
    return result.join("\n");
};
listInboxTasksMain();
