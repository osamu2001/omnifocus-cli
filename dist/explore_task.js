#!/usr/bin/osascript -l JavaScript
"use strict";
/**
 * OmniFocusタスクのプロパティを探索するスクリプト
 *
 * このスクリプトはデバッグおよびAPI調査目的で使用します。
 * OmniFocus APIのタスクオブジェクトが持つプロパティやメソッドを
 * 動的に探索し、型定義と実際のAPIの挙動の違いを検証するために役立ちます。
 * 特にインボックスタスクの特性や階層構造の挙動も確認できます。
 *
 * @note エンドユーザー向けではなく、開発・デバッグ用ツールです
 */
ObjC.import('stdlib');
const exploreTask = () => {
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        let task = null;
        const inboxTasks = doc.inboxTasks();
        if (inboxTasks && inboxTasks.length > 0) {
            task = inboxTasks[0];
            console.log(`インボックスタスク名: ${task.name()}`);
        }
        else {
            const allTasks = doc.flattenedTasks();
            if (allTasks && allTasks.length > 0) {
                task = allTasks[0];
                console.log(`タスク名: ${task.name()}`);
            }
            else {
                console.log("タスクが見つかりません");
                return;
            }
        }
        console.log("\n--- タスクオブジェクトの調査 ---");
        console.log(`\nid: ${task.id()}`);
        console.log(`name: ${task.name()}`);
        const methods = [
            'note', 'completed', 'flagged', 'dueDate', 'deferDate',
            'completionDate', 'creationDate', 'modificationDate',
            'effectiveDueDate', 'effectiveDeferDate', 'estimatedMinutes',
            'repetitionRule', 'blocked'
        ];
        for (const method of methods) {
            try {
                if (typeof task[method] === 'function') {
                    const result = task[method]();
                    console.log(`${method}: ${result || "空"}`);
                }
                else {
                    console.log(`${method}: メソッドではありません`);
                }
            }
            catch (e) {
                console.log(`${method}()メソッドはサポートされていません: ${e}`);
            }
        }
        console.log("\n--- 関連オブジェクト取得メソッド ---");
        try {
            const project = task.containingProject();
            console.log(`プロジェクト: ${project ? project.name() : "なし"}`);
        }
        catch (e) {
            console.log(`containingProject()メソッドはサポートされていません: ${e}`);
        }
        try {
            const parent = task.parent();
            console.log(`親タスク: ${parent ? parent.name() : "なし"}`);
        }
        catch (e) {
            console.log(`parent()メソッドはサポートされていません: ${e}`);
        }
        try {
            const children = task.children();
            console.log(`子タスク数: ${children ? children.length : 0}`);
        }
        catch (e) {
            console.log(`children()メソッドはサポートされていません: ${e}`);
        }
        try {
            const tags = task.tags();
            console.log(`タグ数: ${tags ? tags.length : 0}`);
        }
        catch (e) {
            console.log(`tags()メソッドはサポートされていません: ${e}`);
        }
        console.log("\n--- 使用可能なプロパティ/メソッド ---");
        for (const prop in task) {
            try {
                const value = task[prop];
                const type = typeof value;
                console.log(`${prop}: ${type}`);
            }
            catch (e) {
                console.log(`${prop}: アクセスできません`);
            }
        }
        return "完了";
    }
    catch (e) {
        return `エラー: ${e}`;
    }
};
// メイン実行
const taskExploreResult = exploreTask();
console.log(`\n実行結果: ${taskExploreResult}`);
