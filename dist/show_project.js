#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
/// <reference path="./types/omnifocus.d.ts" />
/// <reference path="./types/jxa.d.ts" />
ObjC.import('stdlib');
ObjC.import('Foundation');
/**
 * プロジェクト情報を表示する
 * @returns JSON形式のプロジェクト情報
 */
function showProjectMain() {
    /**
     * コマンドライン引数からプロジェクトIDを取得する
     * @returns プロジェクトID
     * @throws プロジェクトIDが見つからない場合にエラーメッセージを出力して終了
     */
    function getProjectIdFromArgs() {
        if (typeof $.NSProcessInfo === "undefined") {
            console.log("NSProcessInfoが利用できません");
            $.exit(1);
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        // スクリプト名を見つける（通常は4番目の引数）
        // スクリプト名の後の引数がユーザーの実際の引数
        const scriptNameIndex = Math.min(3, allArgs.length - 1); // 安全のため
        // スクリプト名の後の引数を返す（あれば）
        if (scriptNameIndex + 1 < allArgs.length) {
            const userArgs = allArgs.slice(scriptNameIndex + 1);
            const projectId = userArgs[0];
            if (projectId && projectId.trim() !== "") {
                return projectId;
            }
        }
        // プロジェクトIDが指定されていない場合はエラーメッセージを表示して終了
        console.log("使用法: show_project <projectId>");
        $.exit(1);
    }
    /**
     * IDからプロジェクトを検索する
     * @param doc OmniFocusドキュメント
     * @param projectId 検索するプロジェクトID
     * @returns 見つかったプロジェクト
     * @throws プロジェクトが見つからない場合にエラーメッセージを出力して終了
     */
    function findProjectById(doc, projectId) {
        try {
            // flattenedProjectsを使用することで、すべての階層のプロジェクトを一度に取得
            const projects = doc.flattenedProjects();
            for (let i = 0; i < projects.length; i++) {
                try {
                    if (projects[i].id() === projectId) {
                        return projects[i];
                    }
                }
                catch (e) {
                    // このプロジェクトの処理中にエラーが発生したら次へ
                    continue;
                }
            }
            // プロジェクトが見つからなかった場合
            console.log(`プロジェクトが見つかりません: ${projectId}`);
            $.exit(1);
        }
        catch (e) {
            // プロジェクト取得時にエラーが発生した場合
            console.log(`プロジェクト検索中にエラー: ${e}`);
            $.exit(1);
        }
    }
    /**
     * プロジェクトの詳細情報を取得する
     * @param project プロジェクトオブジェクト
     * @returns プロジェクト情報のオブジェクト
     */
    function getProjectInfo(project) {
        // プロパティの安全な取得（エラーが発生しても処理を継続）
        const safeGetProperty = (obj, propertyName, defaultValue) => {
            try {
                if (typeof obj[propertyName] === 'function') {
                    return obj[propertyName]() || defaultValue;
                }
                else {
                    return obj[propertyName] || defaultValue;
                }
            }
            catch (e) {
                return defaultValue;
            }
        };
        // 基本情報の初期値を設定（エラー時のデフォルト値を含む）
        const info = {
            id: '',
            name: '',
            note: '',
            completed: false,
            flagged: false,
            creationDate: new Date(),
            modificationDate: new Date(),
            dueDate: undefined,
            priority: undefined,
            parent: undefined,
            childProjectCount: 0,
            progress: undefined,
            tags: []
        };
        // 基本的なプロジェクト情報
        try {
            info.id = project.id();
        }
        catch (e) { /* デフォルト値を使用 */ }
        try {
            info.name = project.name();
        }
        catch (e) { /* デフォルト値を使用 */ }
        try {
            info.note = project.note();
        }
        catch (e) { /* デフォルト値を使用 */ }
        try {
            info.completed = project.completed();
        }
        catch (e) { /* デフォルト値を使用 */ }
        try {
            info.flagged = project.flagged();
        }
        catch (e) { /* デフォルト値を使用 */ }
        try {
            info.creationDate = project.creationDate();
        }
        catch (e) { /* デフォルト値を使用 */ }
        try {
            info.modificationDate = project.modificationDate();
        }
        catch (e) { /* デフォルト値を使用 */ }
        // タグ情報
        try {
            const tags = project.tags();
            info.tags = [];
            for (let i = 0; i < tags.length; i++) {
                info.tags.push({
                    id: safeGetProperty(tags[i], 'id', ''),
                    name: safeGetProperty(tags[i], 'name', '')
                });
            }
        }
        catch (e) {
            // デフォルト値を使用
        }
        // 期日と優先度
        try {
            info.dueDate = project.dueDate();
        }
        catch (e) { /* デフォルト値を使用 */ }
        try {
            // 型定義にeffectivePriorityがないので、effectiveStatusから優先度を推定
            const status = project.effectiveStatus();
            // ステータスから優先度を推定（例：'active'→1, 'on hold'→0 など）
            switch (status.toLowerCase()) {
                case 'active':
                    info.priority = 1;
                    break;
                case 'on hold':
                    info.priority = 0;
                    break;
                case 'completed':
                    info.priority = -1;
                    break;
                case 'dropped':
                    info.priority = -2;
                    break;
                default: info.priority = undefined;
            }
        }
        catch (e) { /* デフォルト値を使用 */ }
        // 親プロジェクト情報
        try {
            const folder = project.folder();
            if (folder) {
                info.parent = {
                    id: safeGetProperty(folder, 'id', ''),
                    name: safeGetProperty(folder, 'name', '')
                };
            }
        }
        catch (e) {
            // デフォルト値を使用
        }
        // 子タスク数をchildProjectCountとして使用
        try {
            const tasks = project.tasks();
            info.childProjectCount = tasks ? tasks.length : 0;
        }
        catch (e) {
            // デフォルト値を使用
        }
        // プロジェクトの進捗状況（完了タスク / 全タスク）
        try {
            // flattenedTasksメソッドが存在するか確認してから呼び出す
            if (typeof project.flattenedTasks === 'function') {
                const tasks = project.flattenedTasks();
                if (tasks && tasks.length > 0) {
                    const totalTasks = tasks.length;
                    let completedTasks = 0;
                    for (let i = 0; i < totalTasks; i++) {
                        if (safeGetProperty(tasks[i], 'completed', false)) {
                            completedTasks++;
                        }
                    }
                    info.progress = totalTasks > 0 ? (completedTasks / totalTasks) : undefined;
                }
            }
            else {
                // flattenedTasksが使用できない場合はtasksメソッドで代用
                const tasks = project.tasks();
                if (tasks && tasks.length > 0) {
                    const totalTasks = tasks.length;
                    let completedTasks = 0;
                    for (let i = 0; i < totalTasks; i++) {
                        if (safeGetProperty(tasks[i], 'completed', false)) {
                            completedTasks++;
                        }
                    }
                    info.progress = totalTasks > 0 ? (completedTasks / totalTasks) : undefined;
                }
            }
        }
        catch (e) {
            // デフォルト値を使用
        }
        return info;
    }
    // メイン処理開始
    const projectId = getProjectIdFromArgs();
    if (!projectId) {
        console.log(`使用法: show_project <projectId>`);
        $.exit(1);
        return;
    }
    try {
        // OmniFocusアプリケーションを起動
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        // プロジェクトをIDで検索
        const project = findProjectById(doc, projectId);
        if (!project) {
            console.log(`プロジェクトが見つかりません: ${projectId}`);
            $.exit(1);
            return;
        }
        // プロジェクト情報を取得して返す
        const projectInfo = getProjectInfo(project);
        return JSON.stringify(projectInfo, null, 2);
    }
    catch (e) {
        console.log(`エラー: ${e}`);
        $.exit(1);
        return;
    }
}
showProjectMain();
