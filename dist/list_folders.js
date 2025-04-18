#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
function listFoldersMain() {
    /**
     * フォルダを再帰的にリストアップする関数
     * @param folder フォルダオブジェクト
     * @param parentPath 親フォルダのパス
     * @returns フォルダ情報の配列
     */
    function listFoldersRecursive(folder, parentPath) {
        const results = [];
        try {
            const currentName = folder.name();
            const currentId = folder.id();
            if (!currentName || !currentId) {
                console.log("名前またはIDが取得できないフォルダが見つかりました。スキップします。");
                return results;
            }
            const fullPath = parentPath ? `${parentPath}/${currentName}` : currentName;
            results.push(`${currentId}\t${fullPath}`);
            const subfolders = folder.folders();
            if (subfolders && subfolders.length > 0) {
                for (const subfolder of subfolders) {
                    results.push(...listFoldersRecursive(subfolder, fullPath));
                }
            }
        }
        catch (e) {
            // JXA環境ではconsole.errorが未定義の場合があるため、console.logを使用
            const folderNameAttempt = typeof (folder === null || folder === void 0 ? void 0 : folder.name) === 'function' ? folder.name() : '不明なフォルダ';
            console.log(`フォルダ "${folderNameAttempt}" の処理中にエラー: ${e}`);
        }
        return results;
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
     * 結果を標準出力に書き込む
     * @param content 出力する内容
     */
    function writeToStdout(content) {
        try {
            const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
            const data = $.NSString.stringWithUTF8String(content).dataUsingEncoding($.NSUTF8StringEncoding);
            stdout.writeData(data);
        }
        catch (e) {
            console.log(`標準出力への書き込み中にエラーが発生しました: ${e}`);
            $.exit(1);
        }
    }
    /**
     * エラーメッセージを標準エラー出力に書き込む
     * @param errorMessage エラーメッセージ
     */
    function writeErrorToStderr(errorMessage) {
        try {
            const stderr = $.NSFileHandle.fileHandleWithStandardError;
            const errorData = $.NSString.stringWithUTF8String(`${errorMessage}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
            stderr.writeData(errorData);
        }
        catch (e) {
            // 標準エラー出力への書き込みに失敗した場合は最後の手段としてconsole.logを使用
            console.log(`エラー: ${errorMessage}`);
            console.log(`標準エラー出力への書き込みにも失敗: ${e}`);
        }
    }
    // メイン処理
    try {
        const app = getOmniFocusApp();
        const doc = app.defaultDocument;
        const topLevelFolders = doc.folders();
        let allFolderLines = [];
        if (topLevelFolders && topLevelFolders.length > 0) {
            for (const topFolder of topLevelFolders) {
                allFolderLines.push(...listFoldersRecursive(topFolder, ""));
            }
        }
        else {
            console.log("トップレベルフォルダが見つかりません。");
        }
        if (allFolderLines.length > 0) {
            writeToStdout(allFolderLines.join("\n"));
        }
        else {
            console.log("処理対象のフォルダがありませんでした。");
        }
    }
    catch (e) {
        writeErrorToStderr(`スクリプトの実行中に予期せぬエラーが発生しました: ${e}`);
        $.exit(1);
    }
}
listFoldersMain();
