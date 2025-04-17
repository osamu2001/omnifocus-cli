#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
/**
 * オブジェクトが欠損値かどうかを判定します
 * @param obj 判定対象のオブジェクト
 * @returns 欠損値であればtrue、そうでなければfalse
 */
function isMissingValue(obj) {
    try {
        if (ObjC.unwrap(obj) === undefined)
            return true;
    }
    catch (e) { }
    if (!obj)
        return true;
    if (typeof obj === 'object' && obj.toString && obj.toString() === '[object Reference]')
        return true;
    return false;
}
/**
 * フォルダの完全なパスを取得します
 * @param folder フォルダオブジェクト
 * @returns フォルダの完全なパス
 */
function getFullFolderPath(folder) {
    if (!folder || typeof folder.name !== "function" || isMissingValue(folder))
        return "";
    let parent = null;
    try {
        parent = folder.container();
        if (isMissingValue(parent))
            parent = null;
    }
    catch (e) {
        parent = null;
    }
    let isParentFolder = false;
    try {
        isParentFolder = parent && typeof parent.class === "function" && parent.class() === "folder";
    }
    catch (e) {
        isParentFolder = false;
    }
    if (isParentFolder) {
        let parentPath = getFullFolderPath(parent);
        try {
            return parentPath ? `${parentPath}/${folder.name()}` : folder.name();
        }
        catch (e) {
            return "";
        }
    }
    else {
        try {
            return folder.name();
        }
        catch (e) {
            return "";
        }
    }
}
// メイン処理
function main() {
    const omnifocusApp = Application('OmniFocus');
    omnifocusApp.includeStandardAdditions = true;
    const document = omnifocusApp.defaultDocument;
    const projects = document.flattenedProjects();
    const lines = [];
    for (const p of projects) {
        let status = "";
        try {
            status = p.status();
        }
        catch (e) {
            continue;
        }
        if (status !== "completed" && status !== "dropped" && status !== "done status") {
            let projectName = "";
            let projectID = "";
            try {
                projectName = p.name();
                projectID = p.id();
            }
            catch (e) {
                continue;
            }
            let folder = null;
            try {
                folder = p.folder();
                if (isMissingValue(folder) || !folder || typeof folder.name !== "function") {
                    folder = null;
                }
            }
            catch (e) {
                folder = null;
            }
            let folderPath = "";
            if (folder) {
                folderPath = getFullFolderPath(folder);
                lines.push(`${projectID}\t${folderPath}/${projectName}`);
            }
            else {
                lines.push(`${projectID}\t${projectName}`);
            }
        }
    }
    return lines.join("\n");
}
main();
