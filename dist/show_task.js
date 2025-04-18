#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
ObjC.import('Foundation');
function showTaskMain() {
    /**
     * タスクの詳細情報を取得する
     * @param task タスクオブジェクト
     * @returns タスク情報のオブジェクト
     */
    function getTaskInfo(task) {
        if (!task)
            return null;
        const info = {};
        try {
            info.id = task.id();
        }
        catch (e) {
            console.log(`ID取得エラー: ${e.message}`);
        }
        try {
            info.name = task.name();
        }
        catch (e) {
            console.log(`名前取得エラー: ${e.message}`);
        }
        try {
            info.note = task.note();
        }
        catch (e) {
            console.log(`メモ取得エラー: ${e.message}`);
        }
        try {
            info.completed = task.completed();
        }
        catch (e) {
            console.log(`完了状態取得エラー: ${e.message}`);
        }
        try {
            info.flagged = task.flagged();
        }
        catch (e) {
            console.log(`フラグ状態取得エラー: ${e.message}`);
        }
        try {
            info.deferDate = task.deferDate();
        }
        catch (e) {
            console.log(`開始日取得エラー: ${e.message}`);
        }
        try {
            info.dueDate = task.dueDate();
        }
        catch (e) {
            console.log(`期限取得エラー: ${e.message}`);
        }
        try {
            info.creationDate = task.creationDate();
        }
        catch (e) {
            console.log(`作成日取得エラー: ${e.message}`);
        }
        try {
            info.modificationDate = task.modificationDate();
        }
        catch (e) {
            console.log(`更新日取得エラー: ${e.message}`);
        }
        try {
            info.completionDate = task.completionDate();
        }
        catch (e) {
            console.log(`完了日取得エラー: ${e.message}`);
        }
        try {
            info.estimatedMinutes = task.estimatedMinutes();
        }
        catch (e) {
            console.log(`予定時間取得エラー: ${e.message}`);
        }
        try {
            info.repetitionRule = task.repetitionRule();
        }
        catch (e) {
            console.log(`繰り返しルール取得エラー: ${e.message}`);
        }
        try {
            // タイプ変換エラーが発生するため、containingTaskの取得をスキップ
            // コンソールにメッセージを出力せず、静かに処理する
            info.containingTask = null;
        }
        catch (e) {
            // エラーも静かに処理する
        }
        try {
            const containingProject = task.containingProject();
            info.containingProject = containingProject ? {
                id: containingProject.id(),
                name: containingProject.name()
            } : null;
        }
        catch (e) {
            console.log(`親プロジェクト取得エラー: ${e.message}`);
        }
        try {
            const tags = task.tags();
            info.tags = [];
            for (let i = 0; i < tags.length; i++) {
                try {
                    info.tags.push({
                        id: tags[i].id(),
                        name: tags[i].name()
                    });
                }
                catch (e) {
                    console.log(`タグ情報取得エラー: ${e.message}`);
                }
            }
        }
        catch (e) {
            console.log(`タグ一覧取得エラー: ${e.message}`);
        }
        try {
            const subtasks = task.tasks();
            info.subtasks = [];
            for (let i = 0; i < subtasks.length; i++) {
                try {
                    info.subtasks.push({
                        id: subtasks[i].id(),
                        name: subtasks[i].name()
                    });
                }
                catch (e) {
                    console.log(`サブタスク情報取得エラー: ${e.message}`);
                }
            }
        }
        catch (e) {
            console.log(`サブタスク一覧取得エラー: ${e.message}`);
        }
        return info;
    }
    // メイン処理
    const args = [];
    if (typeof $.NSProcessInfo !== "undefined") {
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        for (let i = 0; i < nsArgs.count; i++) {
            args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
        }
    }
    const taskId = args[4] || null;
    let result = null;
    if (!taskId) {
        console.log("Usage: show_task.ts [taskId]");
    }
    else {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        const tasks = doc.flattenedTasks();
        let task = null;
        for (let i = 0; i < tasks.length; i++) {
            try {
                if (tasks[i].id() === taskId) {
                    task = tasks[i];
                    break;
                }
            }
            catch (e) {
                console.log(`タスクID比較エラー: ${e.message}`);
            }
        }
        if (!task) {
            console.log("Task not found: " + taskId);
        }
        else {
            const taskInfo = getTaskInfo(task);
            result = JSON.stringify(taskInfo, null, 2);
        }
    }
    return result;
}
// メイン関数を実行
showTaskMain();
