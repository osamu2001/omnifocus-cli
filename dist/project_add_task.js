#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
/**
 * 指定したプロジェクトにタスクを追加する
 */
const projectAddTaskMain = () => {
    const getArgsFromCommandLine = () => {
        if (typeof $.NSProcessInfo !== "undefined") {
            const nsArgs = $.NSProcessInfo.processInfo.arguments;
            const projectID = nsArgs.count > 4 ? ObjC.unwrap(nsArgs.objectAtIndex(4)) : '';
            const taskName = nsArgs.count > 5 ? ObjC.unwrap(nsArgs.objectAtIndex(5)) : '';
            return [projectID, taskName];
        }
        return ['', ''];
    };
    const findProjectById = (doc, projectID) => {
        const projects = doc.projects();
        for (let i = 0; i < projects.length; i++) {
            if (projects[i].id() === projectID) {
                return projects[i];
            }
        }
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
    };
    const [projectID, taskName] = getArgsFromCommandLine();
    if (!projectID || !taskName) {
        console.log(`使用法: project_add_task <projectID> <taskName>`);
        $.exit(1);
        return;
    }
    try {
        const app = Application("OmniFocus");
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        const targetProject = findProjectById(doc, projectID);
        if (!targetProject) {
            console.log(`エラー: プロジェクトが見つかりません: ${projectID}`);
            $.exit(1);
            return;
        }
        targetProject.tasks.push(app.Task({ name: taskName }));
        $.exit(0);
    }
    catch (e) {
        console.log(`エラー: ${e}`);
        $.exit(1);
    }
};
projectAddTaskMain();
