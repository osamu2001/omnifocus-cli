#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
const addTaskMain = () => {
    const getTaskNameFromArgs = () => {
        if (typeof $.NSProcessInfo === "undefined") {
            return "";
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        const scriptNameIndex = Math.min(3, allArgs.length - 1);
        if (scriptNameIndex + 1 < allArgs.length) {
            const userArgs = allArgs.slice(scriptNameIndex + 1);
            return userArgs[userArgs.length - 1];
        }
        return "";
    };
    const addTaskToInbox = (taskName) => {
        if (!taskName) {
            console.log("エラー: タスク名が指定されていません。");
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
            console.log(`エラー: タスクの追加中にエラーが発生しました: ${e}`);
        }
    };
    const taskName = getTaskNameFromArgs();
    if (!taskName || taskName.trim() === "") {
        console.log("エラー: タスク名を指定してください。");
        $.exit(1);
        return;
    }
    addTaskToInbox(taskName);
};
addTaskMain();
