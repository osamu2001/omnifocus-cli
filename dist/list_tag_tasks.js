#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
function listTagTasksMain() {
    /**
     * コマンドライン引数を取得します
     * @returns {string[]} コマンドライン引数の配列
     */
    function getCommandLineArguments() {
        const args = [];
        if (typeof $.NSProcessInfo !== "undefined") {
            const nsArgs = $.NSProcessInfo.processInfo.arguments;
            for (let i = 0; i < nsArgs.count; i++) {
                args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
            }
            return args.slice(4);
        }
        return args;
    }
    // メイン処理
    const args = getCommandLineArguments();
    const tagId = args[0];
    let result = null;
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        const output = [];
        // インボックスタスクを処理
        for (const t of doc.inboxTasks()) {
            try {
                const tags = (typeof t.tags === "function" && t.tags()) ? t.tags() : [];
                const deferDate = (typeof t.deferDate === "function") ? t.deferDate() : null;
                if (!t.completed() &&
                    (!deferDate || deferDate <= new Date()) &&
                    (!t.blocked || !t.blocked()) &&
                    ((tagId && Array.isArray(tags) && tags.some(tag => tag.id() === tagId)) ||
                        (!tagId &&
                            Array.isArray(tags) && tags.length === 0 &&
                            (typeof t.containingProject === "function")))) {
                    output.push(`${t.id()}\t${t.name()}`);
                }
            }
            catch (e) { }
        }
        // プロジェクトタスクを処理
        const projects = doc.flattenedProjects ? doc.flattenedProjects() : doc.projects();
        for (const project of projects) {
            let tasks = [];
            if (typeof project.flattenedTasks === "function") {
                tasks = project.flattenedTasks();
            }
            else if (typeof project.tasks === "function") {
                tasks = project.tasks();
            }
            for (const t of tasks) {
                try {
                    const tags = (typeof t.tags === "function" && t.tags()) ? t.tags() : [];
                    const deferDate = (typeof t.deferDate === "function") ? t.deferDate() : null;
                    if (!t.completed() &&
                        (!deferDate || deferDate <= new Date()) &&
                        (!t.blocked || !t.blocked()) &&
                        ((tagId && Array.isArray(tags) && tags.some(tag => tag.id() === tagId)) ||
                            (!tagId && Array.isArray(tags) && tags.length === 0 && typeof t.containingProject === "function"))) {
                        output.push(`${t.id()}\t${t.name()}`);
                    }
                }
                catch (e) { }
            }
        }
        // 結果の出力
        const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
        if (output.length === 0) {
            const data = $.NSString.stringWithUTF8String("No incomplete tasks found for this tag.\n").dataUsingEncoding($.NSUTF8StringEncoding);
            stdout.writeData(data);
        }
        else {
            const data = $.NSString.stringWithUTF8String(output.join("\n") + "\n").dataUsingEncoding($.NSUTF8StringEncoding);
            stdout.writeData(data);
        }
    }
    catch (e) {
        const stderr = $.NSFileHandle.fileHandleWithStandardError;
        const errorData = $.NSString.stringWithUTF8String(`スクリプトの実行中にエラー: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
        stderr.writeData(errorData);
    }
}
listTagTasksMain();
