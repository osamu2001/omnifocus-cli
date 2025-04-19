#!/usr/bin/osascript -l JavaScript
"use strict";
/**
 * OmniFocus APIのメタデータ取得を検証するテストスクリプト
 *
 * フォルダ、プロジェクト、タスク（通常・インボックス）のメタデータ取得が
 * 正常に動作することを確認します。
 *
 * 実行方法: osascript test_metadata.js
 */
ObjC.import('stdlib');
function testMetadata() {
    try {
        console.log("===== OmniFocus メタデータ検証テスト開始 =====");
        // OmniFocusアプリを取得
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        // デフォルトドキュメントを取得
        const doc = app.defaultDocument;
        // 1. フォルダのテスト
        console.log("\n----- フォルダのメタデータテスト -----");
        testFolderMetadata(doc);
        // 2. プロジェクトのテスト
        console.log("\n----- プロジェクトのメタデータテスト -----");
        testProjectMetadata(doc);
        // 3. 通常タスクのテスト
        console.log("\n----- 通常タスクのメタデータテスト -----");
        testTaskMetadata(doc, false);
        // 4. インボックスタスクのテスト
        console.log("\n----- インボックスタスクのメタデータテスト -----");
        testTaskMetadata(doc, true);
        console.log("\n===== テスト完了 =====");
        return "全テスト完了";
    }
    catch (e) {
        console.log(`エラー: ${e}`);
        return `テスト失敗: ${e}`;
    }
}
/**
 * フォルダのメタデータをテストする
 * @param doc OmniFocusドキュメント
 */
function testFolderMetadata(doc) {
    const folders = doc.flattenedFolders();
    if (!folders || folders.length === 0) {
        console.log("フォルダが見つかりません");
        return;
    }
    const folder = folders[0];
    console.log(`テスト対象フォルダ: ${folder.name()}`);
    // 基本メタデータのテスト
    testProperty(folder, "id");
    testProperty(folder, "name");
    testProperty(folder, "note");
    testProperty(folder, "creationDate");
    testProperty(folder, "modificationDate");
    // 関連オブジェクトのテスト
    console.log("\nフォルダの関連オブジェクト:");
    testProperty(folder, "container", "親フォルダ");
    try {
        const subfolders = folder.folders();
        console.log(`サブフォルダ数: ${subfolders ? subfolders.length : 0}`);
    }
    catch (e) {
        console.log(`サブフォルダ取得エラー: ${e}`);
    }
    try {
        const projects = folder.projects();
        console.log(`プロジェクト数: ${projects ? projects.length : 0}`);
    }
    catch (e) {
        console.log(`プロジェクト取得エラー: ${e}`);
    }
}
/**
 * プロジェクトのメタデータをテストする
 * @param doc OmniFocusドキュメント
 */
function testProjectMetadata(doc) {
    const projects = doc.flattenedProjects();
    if (!projects || projects.length === 0) {
        console.log("プロジェクトが見つかりません");
        return;
    }
    const project = projects[0];
    console.log(`テスト対象プロジェクト: ${project.name()}`);
    // 基本メタデータのテスト
    testProperty(project, "id");
    testProperty(project, "name");
    testProperty(project, "note");
    testProperty(project, "completed");
    testProperty(project, "flagged");
    testProperty(project, "creationDate");
    testProperty(project, "modificationDate");
    testProperty(project, "completionDate");
    testProperty(project, "dueDate");
    testProperty(project, "deferDate");
    testProperty(project, "status");
    testProperty(project, "effectiveStatus");
    // 関連オブジェクトのテスト
    console.log("\nプロジェクトの関連オブジェクト:");
    testProperty(project, "folder", "親フォルダ");
    try {
        const tasks = project.tasks();
        console.log(`タスク数: ${tasks ? tasks.length : 0}`);
    }
    catch (e) {
        console.log(`タスク取得エラー: ${e}`);
    }
    try {
        const tags = project.tags();
        console.log(`タグ数: ${tags ? tags.length : 0}`);
    }
    catch (e) {
        console.log(`タグ取得エラー: ${e}`);
    }
}
/**
 * タスクのメタデータをテストする
 * @param doc OmniFocusドキュメント
 * @param isInbox インボックスタスクをテストするかどうか
 */
function testTaskMetadata(doc, isInbox) {
    let task;
    if (isInbox) {
        // インボックスタスクをテスト
        const inboxTasks = doc.inboxTasks();
        if (!inboxTasks || inboxTasks.length === 0) {
            console.log("インボックスタスクが見つかりません");
            return;
        }
        task = inboxTasks[0];
    }
    else {
        // 通常のタスクをテスト（プロジェクト内のタスク）
        const projects = doc.flattenedProjects();
        if (!projects || projects.length === 0) {
            console.log("プロジェクトが見つかりません");
            return;
        }
        // プロジェクト内のタスクを探す
        let taskFound = false;
        for (const project of projects) {
            try {
                const tasks = project.tasks();
                if (tasks && tasks.length > 0) {
                    task = tasks[0];
                    taskFound = true;
                    break;
                }
            }
            catch (e) { /* 次のプロジェクトを試す */ }
        }
        if (!taskFound) {
            console.log("タスクが見つかりません");
            return;
        }
    }
    console.log(`テスト対象タスク: ${task.name()}`);
    // 基本メタデータのテスト
    testProperty(task, "id");
    testProperty(task, "name");
    testProperty(task, "note");
    testProperty(task, "completed");
    testProperty(task, "flagged");
    testProperty(task, "creationDate");
    testProperty(task, "modificationDate");
    testProperty(task, "completionDate");
    testProperty(task, "dueDate");
    testProperty(task, "deferDate");
    testProperty(task, "effectiveDueDate");
    testProperty(task, "effectiveDeferDate");
    testProperty(task, "estimatedMinutes");
    // 新しく追加したメタデータのテスト
    testProperty(task, "blocked");
    testProperty(task, "isNextAction");
    // 関連オブジェクトのテスト
    console.log("\nタスクの関連オブジェクト:");
    testProperty(task, "containingProject", "親プロジェクト");
    if (!isInbox) {
        // インボックスタスクでない場合のみ親タスクをテスト
        testProperty(task, "parent", "親タスク");
    }
    else {
        console.log("インボックスタスクは親タスクをテストしません");
    }
    try {
        const subtasks = task.tasks();
        console.log(`サブタスク数: ${subtasks ? subtasks.length : 0}`);
    }
    catch (e) {
        console.log(`サブタスク取得エラー: ${e}`);
    }
    try {
        const tags = task.tags();
        console.log(`タグ数: ${tags ? tags.length : 0}`);
    }
    catch (e) {
        console.log(`タグ取得エラー: ${e}`);
    }
}
/**
 * オブジェクトのプロパティ/メソッドをテストする
 * @param obj テスト対象オブジェクト
 * @param propName プロパティ/メソッド名
 * @param displayName 表示名（省略可）
 */
function testProperty(obj, propName, displayName) {
    const name = displayName || propName;
    try {
        if (typeof obj[propName] === 'function') {
            const value = obj[propName]();
            if (value instanceof Date) {
                console.log(`${name}: ${value ? formatDate(value) : "未設定"}`);
            }
            else {
                console.log(`${name}: ${value !== undefined ? value : "未設定"}`);
            }
        }
        else {
            console.log(`${name}: プロパティとして存在（メソッドではありません）`);
        }
    }
    catch (e) {
        console.log(`${name}取得エラー: ${e}`);
    }
}
/**
 * 日付を読みやすい形式にフォーマットする
 * @param date 日付オブジェクト
 * @returns フォーマットされた日付文字列
 */
function formatDate(date) {
    if (!date)
        return "未設定";
    try {
        // JXAの環境制約に合わせてシンプルな方法で実装
        return `${date.getFullYear()}/${(date.getMonth() + 1)}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    }
    catch (e) {
        return "日付変換エラー";
    }
}
// スクリプト実行
const result = testMetadata();
console.log(`\n実行結果: ${result}`);
