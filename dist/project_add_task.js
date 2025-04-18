#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
/**
 * 指定したプロジェクトにタスクを追加する
 * @returns 処理結果（JXAは戻り値が標準出力に出力される）
 */
function projectAddTaskMain() {
    var _a;
    /**
     * コマンドライン引数を取得する
     * @returns 引数の配列
     */
    function getArgsFromCommandLine() {
        const args = [];
        if (typeof $.NSProcessInfo !== "undefined") {
            const nsArgs = $.NSProcessInfo.processInfo.arguments;
            for (let i = 0; i < nsArgs.count; i++) {
                args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
            }
        }
        return args;
    }
    /**
     * プロジェクトIDからプロジェクトを検索する
     * @param doc OmniFocusドキュメント
     * @param projectID 検索するプロジェクトID
     * @returns 見つかったプロジェクト、または null
     */
    function findProjectById(doc, projectID) {
        // 最上位のプロジェクトから検索
        const projects = doc.projects();
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].id() === projectID) {
                return projects[i];
            }
        }
        // フォルダ内のプロジェクトも検索
        const folders = doc.folders();
        for (let i = 0; i < folders.length; i++) {
            const folderProjects = folders[i].projects();
            for (let j = 0; j < folderProjects.length; j++) {
                if (folderProjects[j].id() === projectID) {
                    return folderProjects[j];
                }
            }
        }
        return null;
    }
    // メイン処理開始
    // コマンドライン引数を取得
    const args = getArgsFromCommandLine();
    const scriptName = ((_a = args[0]) === null || _a === void 0 ? void 0 : _a.split('/').pop()) || 'project_add_task.ts';
    // 4番目と5番目の引数を使用（osascriptの仕様上、最初の引数はスクリプト自体）
    const projectID = args[4];
    const taskName = args[5];
    if (!projectID || !taskName) {
        console.log(`使用法: ${scriptName} <projectID> <taskName>`);
        $.exit(1);
        return null;
    }
    try {
        // OmniFocusアプリケーションを起動
        const app = Application("OmniFocus");
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        // ID指定でプロジェクトを検索
        const targetProject = findProjectById(doc, projectID);
        if (!targetProject) {
            console.log(`エラー: プロジェクトが見つかりません: ${projectID}`);
            $.exit(1);
            return null;
        }
        // タスクを追加
        targetProject.tasks.push(app.Task({ name: taskName }));
        // 成功時には何も表示しない
        $.exit(0);
        // returnステートメントを書かないことで出力を抑制
    }
    catch (e) {
        console.log(`エラー: ${e}`);
        $.exit(1);
    }
}
projectAddTaskMain();
