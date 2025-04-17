#!/usr/bin/osascript -l JavaScript
"use strict";
// @ts-nocheck
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
(function () {
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
    /**
     * プロジェクトIDが有効かどうかを検証します
     * @param projectId プロジェクトID
     * @returns プロジェクトIDが有効な場合はtrue、そうでない場合はfalse
     */
    function validateProjectId(projectId) {
        return typeof projectId === "string" && projectId.trim().length > 0;
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
                const subfolders = folder.folders();
                const found = searchFolders(subfolders);
                if (found)
                    return found;
            }
            return null;
        }
        return searchFolders(doc.folders());
    }
    // メイン処理
    const args = getCommandLineArguments();
    const projectId = args[0];
    let result = null;
    if (!validateProjectId(projectId)) {
        console.log("Error: projectId not found or invalid");
    }
    else {
        try {
            const app = Application('OmniFocus');
            app.includeStandardAdditions = true;
            const doc = app.defaultDocument;
            const project = findProjectById(doc, projectId);
            if (!project) {
                console.log("Error: project not found");
            }
            else {
                const output = [];
                try {
                    if (typeof project.flattenedTasks === "function") {
                        const tasks = project.flattenedTasks();
                        for (const t of tasks) {
                            try {
                                if (!t.completed()) {
                                    output.push(`${t.id()}\t${t.name()}`);
                                }
                            }
                            catch (e) { }
                        }
                    }
                    else if (typeof project.tasks === "function") {
                        /**
                         * タスクを再帰的に収集します
                         * @param tasks タスクの配列
                         * @param output 出力用の配列
                         */
                        function collectIncompleteTasks(tasks, output) {
                            for (const t of tasks) {
                                try {
                                    if (!t.completed()) {
                                        output.push(`${t.id()}\t${t.name()}`);
                                        if (typeof t.tasks === "function") {
                                            collectIncompleteTasks(t.tasks(), output);
                                        }
                                    }
                                }
                                catch (e) { }
                            }
                        }
                        collectIncompleteTasks(project.tasks(), output);
                    }
                }
                catch (e) { }
                result = output.join("\n");
            }
        }
        catch (e) {
            console.log("Error: " + e.message);
        }
    }
    return result;
})();
