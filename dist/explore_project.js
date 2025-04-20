#!/usr/bin/osascript -l JavaScript
"use strict";
/**
 * OmniFocusプロジェクトのプロパティを探索するスクリプト
 *
 * このスクリプトはデバッグおよびAPI調査目的で使用します。
 * OmniFocus APIのプロジェクトオブジェクトが持つプロパティやメソッドを
 * 動的に探索し、型定義と実際のAPIの挙動の違いを検証するために役立ちます。
 *
 * @note エンドユーザー向けではなく、開発・デバッグ用ツールです
 */
ObjC.import('stdlib');
const exploreProject = () => {
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        const projects = doc.flattenedProjects();
        if (!projects || projects.length === 0) {
            console.log("プロジェクトが見つかりません");
            return;
        }
        const project = projects[0];
        console.log(`プロジェクト名: ${project.name()}`);
        console.log("\n--- プロジェクトオブジェクトの調査 ---");
        console.log(`\nid: ${project.id()}`);
        console.log(`name: ${project.name()}`);
        const methods = [
            'note', 'completed', 'flagged', 'dueDate', 'deferDate',
            'completionDate', 'creationDate', 'modificationDate',
            'status', 'effectiveStatus', 'repetitionRule'
        ];
        for (const method of methods) {
            try {
                if (typeof project[method] === 'function') {
                    const result = project[method]();
                    console.log(`${method}: ${result || "空"}`);
                }
                else {
                    console.log(`${method}: メソッドではありません`);
                }
            }
            catch (e) {
                console.log(`${method}()メソッドはサポートされていません: ${e}`);
            }
        }
        console.log("\n--- 関連オブジェクト取得メソッド ---");
        try {
            const tasks = project.tasks();
            console.log(`タスク数: ${tasks ? tasks.length : 0}`);
        }
        catch (e) {
            console.log(`tasks()メソッドはサポートされていません: ${e}`);
        }
        try {
            const folder = project.folder();
            console.log(`フォルダ: ${folder ? folder.name() : "なし"}`);
        }
        catch (e) {
            console.log(`folder()メソッドはサポートされていません: ${e}`);
        }
        try {
            const tags = project.tags();
            console.log(`タグ数: ${tags ? tags.length : 0}`);
        }
        catch (e) {
            console.log(`tags()メソッドはサポートされていません: ${e}`);
        }
        console.log("\n--- 使用可能なプロパティ/メソッド ---");
        for (const prop in project) {
            try {
                const value = project[prop];
                const type = typeof value;
                console.log(`${prop}: ${type}`);
            }
            catch (e) {
                console.log(`${prop}: アクセスできません`);
            }
        }
        return "完了";
    }
    catch (e) {
        return `エラー: ${e}`;
    }
};
// メイン実行
const projectExploreResult = exploreProject();
console.log(`\n実行結果: ${projectExploreResult}`);
