#!/usr/bin/osascript -l JavaScript
"use strict";
/**
 * @fileoverview OmniFocus の未完了タスクを階層的にリストアップする TypeScript/JXA スクリプト。
 * 出力形式: taskID[TAB]フォルダパス/プロジェクト名/タスク名/...
 * 完了・破棄済みプロジェクトは除外します。
 */
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
// Utils から共通関数をインポート (ビルド時に解決されるコメント)
// import { getOmniFocusApp } from './utils/app-utils';
/**
 * OmniFocus の未完了タスクを階層的にリストアップします
 */
const listAllTasksMain = () => {
    const getFullFolderPath = (folder) => {
        if (!folder || typeof folder.name !== 'function') {
            return "";
        }
        try {
            const parent = folder.container();
            const isParentFolder = parent && typeof parent.class === 'function' && parent.class() === 'folder';
            if (isParentFolder) {
                const parentPath = getFullFolderPath(parent);
                return parentPath ? `${parentPath}/${folder.name()}` : folder.name();
            }
            else {
                return folder.name();
            }
        }
        catch (e) {
            try {
                return folder.name();
            }
            catch (_a) {
                return "";
            }
        }
    };
    const collectIncompleteTasksRecursive = (tasks, parentPath, outputArray) => {
        if (!tasks || tasks.length === 0) {
            return;
        }
        for (const task of tasks) {
            try {
                if (task && typeof task.completed === 'function' && !task.completed()) {
                    const taskName = task.name();
                    if (!taskName || taskName.trim() === "")
                        continue;
                    const taskId = task.id();
                    const fullPath = parentPath ? `${parentPath}/${taskName}` : taskName;
                    outputArray.push(`${taskId}\t${fullPath}`);
                    if (typeof task.tasks === 'function') {
                        const subTasks = task.tasks();
                        if (subTasks && subTasks.length > 0) {
                            collectIncompleteTasksRecursive(subTasks, fullPath, outputArray);
                        }
                    }
                }
            }
            catch (e) {
                continue;
            }
        }
    };
    const getOmniFocusApp = () => {
        try {
            const app = Application('OmniFocus');
            app.includeStandardAdditions = true;
            return app;
        }
        catch (e) {
            console.log("Error: OmniFocus アプリケーションが見つかりません。");
            throw e;
        }
    };
    const processProject = (project, output) => {
        try {
            const status = project.status();
            const projectName = project.name();
            if (!projectName || projectName.trim() === "")
                return false;
            if (status === "completed" || status === "dropped" || status === "done status" || status === "inactive") {
                return false;
            }
            const folder = project.folder();
            let projectPath = "";
            if (folder && typeof folder.name === 'function') {
                const folderPath = getFullFolderPath(folder);
                projectPath = folderPath ? `${folderPath}/${projectName}` : projectName;
            }
            else {
                projectPath = projectName;
            }
            if (typeof project.tasks === 'function') {
                const rootTasks = project.tasks();
                if (rootTasks && rootTasks.length > 0) {
                    collectIncompleteTasksRecursive(rootTasks, projectPath, output);
                }
            }
            return true;
        }
        catch (e) {
            const projectNameAttempt = typeof (project === null || project === void 0 ? void 0 : project.name) === 'function' ? project.name() : '不明なプロジェクト';
            const projectId = typeof (project === null || project === void 0 ? void 0 : project.id) === 'function' ? project.id() : 'N/A';
            console.log(`Error: プロジェクト "${projectNameAttempt}" (ID: ${projectId}) の情報取得中にエラー: ${e}`);
            return false;
        }
    };
    const writeOutput = (output) => {
        try {
            const resultString = output.join("\n");
            const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
            const data = $.NSString.stringWithUTF8String(resultString).dataUsingEncoding($.NSUTF8StringEncoding);
            stdout.writeData(data);
        }
        catch (e) {
            console.log(`Error: 出力書き込み中にエラー: ${e}`);
        }
    };
    try {
        const app = getOmniFocusApp();
        const doc = app.defaultDocument;
        const projects = doc.flattenedProjects();
        const output = [];
        for (const project of projects) {
            processProject(project, output);
        }
        writeOutput(output);
    }
    catch (e) {
        try {
            const stderr = $.NSFileHandle.fileHandleWithStandardError;
            const errorData = $.NSString.stringWithUTF8String(`Error: スクリプトの実行中に予期せぬエラーが発生しました: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
            stderr.writeData(errorData);
        }
        catch (_a) {
        }
    }
};
listAllTasksMain();
