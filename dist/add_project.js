#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
function addProjectMain() {
    /**
     * コマンドライン引数を取得します
     */
    function getCommandLineArguments() {
        const args = [];
        if (typeof $.NSProcessInfo !== "undefined") {
            const nsArgs = $.NSProcessInfo.processInfo.arguments;
            for (let i = 0; i < nsArgs.count; i++) {
                args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
            }
            return args.slice(2);
        }
        return args;
    }
    /**
     * 指定されたIDのプロジェクトを追加します
     * @param projectID 追加するプロジェクトのID
     */
    function addProject(projectID) {
        if (!projectID) {
            console.log("プロジェクトIDが指定されていません。");
            return;
        }
        try {
            const app = Application('OmniFocus');
            app.includeStandardAdditions = true;
            const doc = app.defaultDocument;
            doc.projects.push(app.Project({ name: projectID }));
        }
        catch (e) {
            console.error(`プロジェクト追加中にエラー: ${e}`);
        }
    }
    // メイン処理
    const cliArgs = getCommandLineArguments();
    const projectID = cliArgs.length > 0 ? cliArgs[cliArgs.length - 1] : "名称未設定プロジェクト (TS)";
    addProject(projectID);
}
addProjectMain();
