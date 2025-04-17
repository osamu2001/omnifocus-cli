#!/usr/bin/osascript -l JavaScript
"use strict";
// @ts-nocheck
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
/**
 * コマンドライン引数を取得します
 */
function getCommandLineArguments() {
    const args = [];
    if (typeof $.NSProcessInfo !== "undefined") {
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        for (let i = 0; i < nsArgs.count; i++) {
            args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
        }
        return args.slice(2);
    }
    return args;
}
/**
 * 指定された名前のタスクをOmniFocusのインボックスに追加します
 * @param taskName 追加するタスクの名前
 */
function addTaskToInbox(taskName) {
    if (!taskName) {
        console.log("タスク名が指定されていません。");
        return;
    }
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        const inbox = doc.inboxTasks;
        inbox.push(app.InboxTask({ name: taskName }));
    }
    catch (e) {
        console.error(`タスクの追加中にエラーが発生しました: ${e}`);
    }
}
// メイン処理
const cliArgs = getCommandLineArguments();
const taskName = cliArgs.length > 0 ? cliArgs[cliArgs.length - 1] : "名称未設定タスク (TS)";
addTaskToInbox(taskName);
