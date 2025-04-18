#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
/**
 * 指定されたプロジェクトIDに含まれる未完了タスクを一覧表示する
 * 使用例: ./dist/list_project_tasks.js プロジェクトID
 * 出力形式: タスクID\tタスク名
 */
function listProjectTasksMain() {
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
            return args.slice(4); // スクリプト名などをスキップ
        }
        return args;
    }
    /**
     * プロジェクトIDからプロジェクトを検索します
     * @param doc OmniFocusのドキュメント
     * @param projectId 検索対象のプロジェクトID
     * @returns 見つかったプロジェクト、見つからない場合はnull
     */
    function findProjectById(doc, projectId) {
        // トップレベルのプロジェクトを検索
        const topProjects = doc.projects();
        for (const p of topProjects) {
            if (p.id() === projectId) {
                return p;
            }
        }
        // フォルダ内のプロジェクトを再帰的に検索
        function searchFolders(folders) {
            for (const folder of folders) {
                const projects = folder.projects();
                for (const p of projects) {
                    if (p.id() === projectId) {
                        return p;
                    }
                }
                // サブフォルダを検索
                const subfolders = folder.folders();
                const found = searchFolders(subfolders);
                if (found)
                    return found;
            }
            return null;
        }
        return searchFolders(doc.folders());
    }
    /**
     * プロジェクト内の未完了タスクを収集します
     * @param project 対象プロジェクト
     * @returns タスク情報の配列
     */
    function collectIncompleteTasks(project) {
        const output = [];
        // flattenedTasksメソッドが利用可能ならそちらを使用（より効率的）
        if (typeof project.flattenedTasks === "function") {
            try {
                const tasks = project.flattenedTasks();
                for (const task of tasks) {
                    if (!task.completed()) {
                        output.push(`${task.id()}\t${task.name()}`);
                    }
                }
            }
            catch (e) {
                // 例外を無視して処理継続
            }
        }
        // 再帰的にタスクを収集
        else if (typeof project.tasks === "function") {
            function collectTasksRecursively(tasks) {
                for (const task of tasks) {
                    try {
                        if (!task.completed()) {
                            output.push(`${task.id()}\t${task.name()}`);
                            // サブタスクがあれば再帰的に処理
                            if (typeof task.tasks === "function") {
                                collectTasksRecursively(task.tasks());
                            }
                        }
                    }
                    catch (e) {
                        // 例外を無視して次のタスクへ
                    }
                }
            }
            try {
                collectTasksRecursively(project.tasks());
            }
            catch (e) {
                // 例外を無視して処理継続
            }
        }
        return output;
    }
    // メイン処理
    const args = getCommandLineArguments();
    const projectId = args[0];
    // 引数チェック
    if (!projectId || projectId.trim().length === 0) {
        console.log("Error: projectId not found or invalid");
        return null;
    }
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        // プロジェクト検索
        const project = findProjectById(doc, projectId);
        if (!project) {
            console.log("Error: project not found");
            return null;
        }
        // タスク収集
        const tasks = collectIncompleteTasks(project);
        return tasks.join("\n");
    }
    catch (e) {
        console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
        return null;
    }
}
listProjectTasksMain();
