#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
function addProjectMain() {
    function getCommandLineArguments() {
        if (typeof $.NSProcessInfo === "undefined") {
            return [];
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        // スクリプト名を見つける（通常は4番目の引数）
        // スクリプト名の後の引数がユーザーの実際の引数
        const scriptNameIndex = Math.min(3, allArgs.length - 1); // 安全のため
        // スクリプト名の後の引数を返す（あれば）
        if (scriptNameIndex + 1 < allArgs.length) {
            return allArgs.slice(scriptNameIndex + 1);
        }
        // ユーザー指定の引数がない場合は空配列を返す
        return [];
    }
    function addProject(projectName) {
        try {
            const app = Application('OmniFocus');
            app.includeStandardAdditions = true;
            const doc = app.defaultDocument;
            doc.projects.push(app.Project({ name: projectName }));
        }
        catch (e) {
            console.error(`プロジェクト追加中にエラー: ${e}`);
        }
    }
    const cliArgs = getCommandLineArguments();
    // 引数の最後の要素をプロジェクト名として使用
    if (cliArgs.length === 0) {
        // JXA環境では console.error の代わりに console.log を使用
        console.log("エラー: プロジェクト名を指定してください。");
        $.exit(1);
        return;
    }
    const projectName = cliArgs[cliArgs.length - 1];
    if (!projectName || projectName.trim() === "") {
        console.log("エラー: プロジェクト名が空です。");
        $.exit(1);
        return;
    }
    addProject(projectName);
}
addProjectMain();
