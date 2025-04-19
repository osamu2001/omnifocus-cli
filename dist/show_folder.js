#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
/// <reference path="./types/omnifocus.d.ts" />
/// <reference path="./types/jxa.d.ts" />
ObjC.import('stdlib');
ObjC.import('Foundation');
// ユーティリティ関数のインポート（JXAでは実際にインポートされず、コンパイル時に展開される）
// @ts-ignore
const { safeCall, formatDate, hasMethod } = (function () {
    /**
     * 安全にオブジェクトのメソッドを呼び出す
     * @param obj 対象オブジェクト
     * @param methodName メソッド名
     * @param defaultValue メソッド呼び出しに失敗した場合のデフォルト値
     * @returns メソッドの戻り値またはデフォルト値
     */
    function safeCall(obj, methodName, defaultValue = null) {
        try {
            if (obj && typeof obj[methodName] === 'function') {
                return obj[methodName]();
            }
        }
        catch (e) {
            // エラーを抑制
        }
        return defaultValue;
    }
    /**
     * 日付文字列をフォーマットする
     * @param date 日付オブジェクト
     * @returns フォーマットされた日付文字列またはnull
     */
    function formatDate(date) {
        if (!date)
            return null;
        try {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }
        catch (e) {
            return null;
        }
    }
    /**
     * オブジェクトが特定のメソッドを持っているか確認する
     * @param obj 確認するオブジェクト
     * @param methodName メソッド名
     * @returns メソッドが存在し、関数である場合はtrue
     */
    function hasMethod(obj, methodName) {
        return obj && typeof obj[methodName] === 'function';
    }
    return { safeCall, formatDate, hasMethod };
})();
/**
 * フォルダ情報を表示する
 * @returns JSON形式のフォルダ情報
 */
function showFolderMain() {
    /**
     * コマンドライン引数からフォルダIDを取得する
     * @returns フォルダID
     * @throws フォルダIDが見つからない場合にエラーメッセージを出力して終了
     */
    function getFolderIdFromArgs() {
        if (typeof $.NSProcessInfo === "undefined") {
            console.log("NSProcessInfoが利用できません");
            $.exit(1);
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        // スクリプト名を見つける（通常は4番目の引数）
        const scriptIndex = allArgs.findIndex(arg => arg.includes("show_folder"));
        if (scriptIndex === -1) {
            console.log("スクリプト名が見つかりません");
            $.exit(1);
        }
        // スクリプト名の次の引数がフォルダIDとなる
        if (scriptIndex + 1 < allArgs.length) {
            return allArgs[scriptIndex + 1];
        }
        else {
            console.log("フォルダIDが指定されていません");
            $.exit(1);
        }
        // TypeScriptのコンパイルエラーを避けるため
        return "";
    }
    /**
     * OmniFocusアプリケーションのインスタンスを取得する
     * @returns OmniFocusアプリケーションのインスタンス
     */
    function getOmniFocusApp() {
        try {
            const app = Application('OmniFocus');
            app.includeStandardAdditions = true;
            return app;
        }
        catch (e) {
            console.log("OmniFocus アプリケーションが見つかりません。");
            throw e;
        }
    }
    /**
     * フォルダのパスを取得する
     * @param folder フォルダオブジェクト
     * @param app OmniFocusアプリケーション
     * @returns パス文字列
     */
    function getFolderPath(folder, app) {
        const path = [];
        let current = folder;
        while (current) {
            path.unshift(current.name());
            try {
                const parent = current.container();
                // ルートフォルダに達したら終了
                if (!parent || parent.id === undefined || !parent.id()) {
                    break;
                }
                current = parent;
            }
            catch (e) {
                break;
            }
        }
        return path.join("/");
    }
    /**
     * フォルダ内のプロジェクト数を数える（直接の子プロジェクトのみ）
     * @param folder フォルダオブジェクト
     * @returns プロジェクト数
     */
    function countDirectProjects(folder) {
        try {
            const projects = folder.projects();
            return projects ? projects.length : 0;
        }
        catch (e) {
            console.log(`プロジェクト数の計算中にエラー: ${e}`);
            return 0;
        }
    }
    /**
     * フォルダとそのサブフォルダ内のすべてのプロジェクト数を数える
     * @param folder フォルダオブジェクト
     * @returns プロジェクト総数
     */
    function countAllProjects(folder) {
        let count = countDirectProjects(folder);
        try {
            const subfolders = folder.folders();
            if (subfolders && subfolders.length > 0) {
                for (const subfolder of subfolders) {
                    count += countAllProjects(subfolder);
                }
            }
        }
        catch (e) {
            console.log(`サブフォルダのプロジェクト数の計算中にエラー: ${e}`);
        }
        return count;
    }
    /**
     * フォルダの詳細情報を取得する
     * @param folder フォルダオブジェクト
     * @param app OmniFocusアプリケーション
     * @returns フォルダの詳細情報
     */
    function getFolderDetails(folder, app) {
        const id = folder.id();
        const name = folder.name();
        const path = getFolderPath(folder, app);
        // Note情報の取得（もし存在すれば）
        let note = null;
        try {
            if (typeof folder.note === 'function') {
                const noteText = folder.note();
                note = noteText && noteText.length > 0 ? noteText : null;
            }
        }
        catch (e) {
            console.log(`ノート情報の取得中にエラー: ${e}`);
        }
        // 日付情報の取得
        let creationDate = null;
        let modificationDate = null;
        try {
            if (typeof folder.creationDate === 'function') {
                creationDate = folder.creationDate();
            }
            if (typeof folder.modificationDate === 'function') {
                modificationDate = folder.modificationDate();
            }
        }
        catch (e) {
            console.log(`日付情報の取得中にエラー: ${e}`);
        }
        // 親フォルダ情報の取得
        let parent = null;
        try {
            const parentFolder = folder.container();
            if (parentFolder && typeof parentFolder.id === 'function' && parentFolder.id()) {
                parent = {
                    id: parentFolder.id(),
                    name: parentFolder.name()
                };
            }
        }
        catch (e) {
            console.log(`親フォルダ情報の取得中にエラー: ${e}`);
        }
        // サブフォルダ数の取得
        let childFolderCount = 0;
        try {
            const subfolders = folder.folders();
            childFolderCount = subfolders ? subfolders.length : 0;
        }
        catch (e) {
            console.log(`サブフォルダ数の取得中にエラー: ${e}`);
        }
        // プロジェクト数の取得
        const projectCount = countDirectProjects(folder);
        const effectiveProjectCount = countAllProjects(folder);
        return {
            id,
            name,
            note,
            path,
            creationDate,
            modificationDate,
            parent,
            childFolderCount,
            projectCount,
            effectiveProjectCount
        };
    }
    try {
        const folderId = getFolderIdFromArgs();
        const app = getOmniFocusApp();
        const doc = app.defaultDocument;
        // フォルダを検索
        let targetFolder = null;
        try {
            // フォルダを検索（すべてのフォルダから対象のIDを持つものを探す）
            const allFolders = doc.flattenedFolders();
            if (allFolders && allFolders.length > 0) {
                for (let i = 0; i < allFolders.length; i++) {
                    const folder = allFolders[i];
                    if (folder.id() === folderId) {
                        targetFolder = folder;
                        break;
                    }
                }
            }
        }
        catch (e) {
            console.log(`ID "${folderId}" でフォルダの検索中にエラー: ${e}`);
            $.exit(1);
        }
        if (!targetFolder) {
            console.log(`フォルダが見つかりません: "${folderId}"`);
            $.exit(1);
        }
        // フォルダの詳細情報を取得
        const folderInfo = getFolderDetails(targetFolder, app);
        // 結果をJSON形式で出力
        return JSON.stringify(folderInfo, null, 2);
    }
    catch (e) {
        console.log(`エラー: ${e}`);
        $.exit(1);
    }
    return null;
}
// メイン関数を実行して結果を出力
// @ts-ignore
const folderResult = showFolderMain();
if (folderResult) {
    console.log(folderResult);
}
