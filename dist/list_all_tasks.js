#!/usr/bin/osascript -l JavaScript
"use strict";
// @ts-nocheck
// TypeScriptでJXA用の型を利用
/**
 * @fileoverview OmniFocus の未完了タスクを階層的にリストアップする TypeScript/JXA スクリプト。
 * 出力形式: taskID[TAB]フォルダパス/プロジェクト名/タスク名/...
 * 完了・破棄済みプロジェクトは除外します。
 */
ObjC.import('stdlib');
/**
 * 指定されたフォルダの完全な階層パスを取得します。
 * @param folder パスを取得する OmniFocus フォルダオブジェクト
 * @returns フォルダの完全な階層パス。ルートフォルダの場合はフォルダ名のみ
 */
function getFullFolderPath(folder) {
    if (!folder || typeof folder.name !== 'function') {
        // console.warn("無効なフォルダオブジェクトが渡されました。"); // デバッグ用
        return "";
    }
    let parent;
    try {
        parent = folder.container();
    }
    catch (e) {
        // console.warn(`フォルダ "${folder.name()}" のコンテナ取得中にエラー: ${e}`); // デバッグ用
        parent = null;
    }
    let isParentFolder = false;
    try {
        // 親がドキュメントではなくフォルダかを確認
        isParentFolder = parent && typeof parent.class === 'function' && parent.class() === 'folder';
    }
    catch (e) {
        // console.warn(`フォルダ "${folder.name()}" の親タイプ確認中にエラー: ${e}`); // デバッグ用
        isParentFolder = false;
    }
    if (isParentFolder) {
        const parentPath = getFullFolderPath(parent); // 再帰的に親パスを取得
        return parentPath ? `${parentPath}/${folder.name()}` : folder.name();
    }
    else {
        // 親がフォルダでない場合（ルートフォルダなど）は自身の名前のみ返す
        return folder.name();
    }
}
/**
 * 指定されたタスクリスト内の未完了タスク（サブタスク含む）を再帰的に収集します。
 * @param tasks 処理対象のタスクの配列
 * @param parentPath 親タスクまたはプロジェクトまでの階層パス
 * @param outputArray 結果を格納する配列 (taskID\tFullPath)
 */
function collectIncompleteTasksRecursive(tasks, parentPath, outputArray) {
    if (!tasks || tasks.length === 0) {
        return;
    }
    for (const task of tasks) {
        try {
            // タスクが存在し、未完了であることを確認
            if (task && typeof task.completed === 'function' && !task.completed()) {
                const taskName = task.name();
                if (!taskName)
                    continue; // 名前がないタスクはスキップ
                const taskId = task.id();
                const fullPath = parentPath ? `${parentPath}/${taskName}` : taskName;
                outputArray.push(`${taskId}\t${fullPath}`);
                // サブタスクが存在すれば再帰的に処理
                if (typeof task.tasks === 'function') {
                    const subTasks = task.tasks();
                    collectIncompleteTasksRecursive(subTasks, fullPath, outputArray);
                }
            }
        }
        catch (e) {
            // 個々のタスク処理中のエラーはログに出力して続行
            const taskNameAttempt = typeof (task === null || task === void 0 ? void 0 : task.name) === 'function' ? task.name() : '不明なタスク';
            console.error(`タスク "${taskNameAttempt}" (ID: ${typeof (task === null || task === void 0 ? void 0 : task.id) === 'function' ? task.id() : 'N/A'}) の処理中にエラー: ${e}`);
        }
    }
}
/**
 * OmniFocus アプリケーションのインスタンスを取得します。
 * @returns OmniFocus アプリケーションオブジェクト
 * @throws OmniFocus アプリケーションが見つからない場合にエラーをスローします
 */
function getOmniFocusApp() {
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        return app;
    }
    catch (e) {
        console.error("OmniFocus アプリケーションが見つかりません。");
        throw e; // エラーを再スローしてスクリプトを停止させるか、適切に処理
    }
}
// --- メイン処理 ---
try {
    const app = getOmniFocusApp();
    const doc = app.defaultDocument;
    // プロジェクトをフラットなリストで取得 (フォルダ内のプロジェクトも含む)
    const projects = doc.flattenedProjects();
    const output = [];
    for (const project of projects) {
        let status = "";
        let projectName = "";
        let folder = null;
        try {
            // プロジェクトの状態と名前を取得
            status = project.status();
            projectName = project.name();
            if (!projectName)
                continue; // 名前がないプロジェクトはスキップ
            // プロジェクトがアクティブか確認 (完了・破棄済みは除外)
            // "done status" は古いバージョンとの互換性のため残す場合がある
            if (status === "completed" || status === "dropped" || status === "done status" || status === "inactive") {
                continue;
            }
            // プロジェクトが属するフォルダを取得
            folder = project.folder();
        }
        catch (e) {
            const projectNameAttempt = typeof (project === null || project === void 0 ? void 0 : project.name) === 'function' ? project.name() : '不明なプロジェクト';
            console.error(`プロジェクト "${projectNameAttempt}" (ID: ${typeof (project === null || project === void 0 ? void 0 : project.id) === 'function' ? project.id() : 'N/A'}) の情報取得中にエラー: ${e}`);
            continue; // エラーが発生したプロジェクトはスキップ
        }
        // プロジェクトのフルパスを構築
        let projectPath = "";
        if (folder && typeof folder.name === 'function') {
            const folderPath = getFullFolderPath(folder);
            projectPath = folderPath ? `${folderPath}/${projectName}` : projectName;
        }
        else {
            projectPath = projectName; // フォルダがない場合はプロジェクト名のみ
        }
        // プロジェクト直下の未完了タスク（とサブタスク）を収集
        if (typeof project.tasks === 'function') {
            try {
                const rootTasks = project.tasks();
                collectIncompleteTasksRecursive(rootTasks, projectPath, output);
            }
            catch (e) {
                console.error(`プロジェクト "${projectName}" 配下のタスク取得中にエラー: ${e}`);
                // このプロジェクトのタスク収集はスキップして次に進む
                continue;
            }
        }
    }
    // 結果を改行区切りで出力
    const resultString = output.join("\n");
    // ObjCのNSFileHandleを使って標準出力に書き込む
    const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
    const data = $.NSString.stringWithUTF8String(resultString).dataUsingEncoding($.NSUTF8StringEncoding);
    stdout.writeData(data);
    // return文は関数内でのみ有効なので削除
}
catch (e) {
    // ObjCのNSFileHandleを使って標準エラー出力に書き込む
    const stderr = $.NSFileHandle.fileHandleWithStandardError;
    const errorData = $.NSString.stringWithUTF8String(`スクリプトの実行中に予期せぬエラーが発生しました: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
    stderr.writeData(errorData);
    // 必要に応じて終了ステータスを設定
    // $.exit(1);
}
