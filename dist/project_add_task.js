#!/usr/bin/env osascript -l JavaScript
"use strict";
// @ts-nocheck
// TypeScriptでJXA用の型を利用
function projectAddTaskMain() {
    ObjC.import('stdlib');
    /**
     * コマンドライン引数を取得します
     * @returns {string[]} コマンドライン引数の配列
     */
    function getCommandLineArguments() {
        const args = [];
        // @ts-ignore
        if (typeof $.NSProcessInfo !== "undefined") {
            // @ts-ignore
            const nsArgs = $.NSProcessInfo.processInfo.arguments;
            for (let i = 0; i < nsArgs.count; i++) {
                // @ts-ignore
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
    const projectID = args[0];
    const taskName = args[1];
    let result = null;
    if (!validateProjectId(projectID) || taskName == null || typeof taskName !== "string" || taskName.trim().length === 0) {
        console.log('Error: Usage: project_add_task.ts <projectID> <taskName>');
        // @ts-ignore
        $.exit(1);
    }
    else {
        try {
            // @ts-ignore
            const app = Application('OmniFocus');
            // @ts-ignore
            app.includeStandardAdditions = true;
            // @ts-ignore
            const doc = app.defaultDocument;
            const targetProject = findProjectById(doc, projectID);
            if (!targetProject) {
                console.log('Error: Project not found: ' + projectID);
                // @ts-ignore
                $.exit(1);
            }
            else {
                // @ts-ignore
                targetProject.tasks.push(app.Task({ name: taskName }));
                // @ts-ignore
                $.exit(0);
            }
        }
        catch (e) {
            console.log('Error: ' + e.message);
            // @ts-ignore
            $.exit(1);
        }
    }
    return null;
}
projectAddTaskMain();
