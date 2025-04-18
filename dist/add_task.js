#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
function addTaskMain() {
    function getTaskNameFromArgs() {
        if (typeof $.NSProcessInfo === "undefined") {
            return "";
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        // スクリプト名を見つける（通常は4番目の引数）
        // スクリプト名の後の引数がユーザーの実際の引数
        const scriptNameIndex = Math.min(3, allArgs.length - 1); // 安全のため
        // スクリプト名の後の引数を返す（あれば）
        if (scriptNameIndex + 1 < allArgs.length) {
            const userArgs = allArgs.slice(scriptNameIndex + 1);
            return userArgs[userArgs.length - 1]; // 最後の引数をタスク名として返す
        }
        // ユーザー指定の引数がない場合は空文字列を返す
        return "";
    }
    function addTaskToInbox(taskName) {
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
            // JXA環境では console.error の代わりに console.log を使用
            console.log(`エラー: タスクの追加中にエラーが発生しました: ${e}`);
        }
    }
    const taskName = getTaskNameFromArgs();
    if (!taskName || taskName.trim() === "") {
        console.log("エラー: タスク名を指定してください。");
        $.exit(1);
        return;
    }
    addTaskToInbox(taskName);
}
addTaskMain();
