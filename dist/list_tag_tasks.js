#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
/**
 * 指定されたタグIDに関連するタスクを一覧表示します
 */
function listTagTasksMain() {
    /**
     * コマンドライン引数を取得します
     * @returns コマンドライン引数の配列
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
    /**
     * タスクがタグ条件に一致するか確認します
     */
    function matchesTagCondition(task, tagId) {
        try {
            // タグの取得
            const tags = task.tags();
            if (tagId) {
                // 特定のタグIDを持つタスクをフィルタリング
                return tags.some(tag => tag.id() === tagId);
            }
            else {
                // タグがないタスクをフィルタリング
                return tags.length === 0 && typeof task.containingProject === "function";
            }
        }
        catch (e) {
            // タグ情報が取得できない場合は条件に一致しないとみなす
            return false;
        }
    }
    /**
     * タスクが表示条件に一致するか確認します
     */
    function isDisplayableTask(task, tagId) {
        try {
            // 完了済みのタスクは除外
            if (task.completed())
                return false;
            // 延期されているタスクは除外
            const deferDate = task.deferDate();
            if (deferDate && deferDate > new Date())
                return false;
            // ブロックされているタスクは除外（オプショナルプロパティのため条件分岐）
            if (task.blocked && task.blocked())
                return false;
            // タグ条件のチェック
            return matchesTagCondition(task, tagId);
        }
        catch (e) {
            // エラーが発生した場合は安全のためfalseを返す
            return false;
        }
    }
    // メイン処理
    const args = getCommandLineArguments();
    const tagId = args[0];
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        const output = [];
        // インボックスタスクを処理
        try {
            const inboxTasks = doc.inboxTasks();
            for (const task of inboxTasks) {
                if (isDisplayableTask(task, tagId)) {
                    output.push(`${task.id()}\t${task.name()}`);
                }
            }
        }
        catch (e) {
            console.log(`インボックスタスク取得エラー: ${e}`);
        }
        // プロジェクトタスクを処理
        try {
            // flattenedProjectsがない場合はprojectsにフォールバック
            const projects = doc.flattenedProjects ? doc.flattenedProjects() : doc.projects();
            for (const project of projects) {
                try {
                    // flattenedTasksがない場合はtasksにフォールバック
                    const tasks = typeof project.flattenedTasks === "function" ?
                        project.flattenedTasks() :
                        typeof project.tasks === "function" ?
                            project.tasks() : [];
                    for (const task of tasks) {
                        if (isDisplayableTask(task, tagId)) {
                            output.push(`${task.id()}\t${task.name()}`);
                        }
                    }
                }
                catch (e) {
                    // 個々のプロジェクト処理エラーは無視して次へ
                    continue;
                }
            }
        }
        catch (e) {
            console.log(`プロジェクト一覧取得エラー: ${e}`);
        }
        // 結果の出力
        const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
        if (output.length === 0) {
            const data = $.NSString.stringWithUTF8String("指定されたタグのタスクが見つかりませんでした\n").dataUsingEncoding($.NSUTF8StringEncoding);
            stdout.writeData(data);
        }
        else {
            const data = $.NSString.stringWithUTF8String(output.join("\n") + "\n").dataUsingEncoding($.NSUTF8StringEncoding);
            stdout.writeData(data);
        }
    }
    catch (e) {
        const stderr = $.NSFileHandle.fileHandleWithStandardError;
        const errorData = $.NSString.stringWithUTF8String(`実行エラー: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
        stderr.writeData(errorData);
    }
}
listTagTasksMain();
