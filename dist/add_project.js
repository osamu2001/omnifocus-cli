#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
function addProjectMain() {
    function getProjectNameFromArgs() {
        if (typeof $.NSProcessInfo === "undefined") {
            return "";
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        // スクリプト名を見つける（通常は4番目の引数）
        // スクリプト名の後の引数がユーザーの実際の引数
        const scriptNameIndex = Math.min(3, allArgs.length - 1); // 安全のため
        // スクリプト名の後の引数を返す（あれば）
        if (scriptNameIndex + 1 < allArgs.length) {
            const userArgs = allArgs.slice(scriptNameIndex + 1);
            return userArgs[userArgs.length - 1]; // 最後の引数をプロジェクト名として返す
        }
        // ユーザー指定の引数がない場合は空文字列を返す
        return "";
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
    const projectName = getProjectNameFromArgs();
    // プロジェクト名が空または空白文字のみの場合はエラー
    if (!projectName || projectName.trim() === "") {
        console.log("エラー: プロジェクト名を指定してください。");
        $.exit(1);
        return;
    }
    addProject(projectName);
}
addProjectMain();
