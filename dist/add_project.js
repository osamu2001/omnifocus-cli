#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
const addProjectMain = () => {
    const getProjectNameFromArgs = () => {
        if (typeof $.NSProcessInfo === "undefined") {
            return "";
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        const scriptNameIndex = Math.min(3, allArgs.length - 1);
        if (scriptNameIndex + 1 < allArgs.length) {
            const userArgs = allArgs.slice(scriptNameIndex + 1);
            return userArgs[userArgs.length - 1];
        }
        return "";
    };
    const addProject = (projectName) => {
        try {
            const app = Application('OmniFocus');
            app.includeStandardAdditions = true;
            const doc = app.defaultDocument;
            doc.projects.push(app.Project({ name: projectName }));
        }
        catch (e) {
            console.error(`プロジェクト追加中にエラー: ${e}`);
        }
    };
    const projectName = getProjectNameFromArgs();
    if (!projectName || projectName.trim() === "") {
        console.log("エラー: プロジェクト名を指定してください。");
        $.exit(1);
        return;
    }
    addProject(projectName);
};
addProjectMain();
