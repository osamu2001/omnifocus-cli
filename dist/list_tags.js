#!/usr/bin/osascript -l JavaScript
"use strict";
// @ts-nocheck
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
/**
 * タグを再帰的にリストアップする関数
 * @param tag タグオブジェクト
 * @param parentPath 親タグのパス
 * @returns タグ情報の配列
 */
function listTagsRecursive(tag, parentPath) {
    const results = [];
    try {
        const currentName = tag.name();
        const currentId = tag.id();
        if (!currentName || !currentId)
            return results;
        const fullPath = parentPath ? `${parentPath}/${currentName}` : currentName;
        results.push(`${currentId}\t${fullPath}`);
        const subtags = tag.tags();
        if (subtags && subtags.length > 0) {
            for (const subtag of subtags) {
                results.push(...listTagsRecursive(subtag, fullPath));
            }
        }
    }
    catch (e) {
        // エラー処理
    }
    return results;
}
/**
 * OmniFocusアプリケーションのインスタンスを取得する
 * @returns OmniFocusアプリケーションのインスタンス
 */
function getOmniFocusApp() {
    const app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    return app;
}
// メイン処理
try {
    const app = getOmniFocusApp();
    const doc = app.defaultDocument;
    const topLevelTags = doc.tags();
    let allTagLines = [];
    if (topLevelTags && topLevelTags.length > 0) {
        for (const topTag of topLevelTags) {
            allTagLines.push(...listTagsRecursive(topTag, ""));
        }
    }
    if (allTagLines.length > 0) {
        const resultString = allTagLines.join("\n");
        const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
        const data = $.NSString.stringWithUTF8String(resultString).dataUsingEncoding($.NSUTF8StringEncoding);
        stdout.writeData(data);
    }
}
catch (e) {
    const stderr = $.NSFileHandle.fileHandleWithStandardError;
    const errorData = $.NSString.stringWithUTF8String(`スクリプトの実行中にエラー: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
    stderr.writeData(errorData);
}
