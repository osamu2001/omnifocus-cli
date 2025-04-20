#!/usr/bin/osascript -l JavaScript
"use strict";
// OmniFocusの型をインポート
/// <reference path="./types/omnifocus.d.ts" />
/// <reference path="./types/jxa.d.ts" />
// JXA環境のセットアップ
ObjC.import('stdlib');
ObjC.import('Foundation');
const showTaskMain = () => {
    const DEBUG = false;
    const logError = (message) => {
        if (DEBUG) {
            console.log(message);
        }
    };
    const getTaskInfo = (task, app, doc) => {
        if (!task)
            return null;
        let isInboxTask = false;
        try {
            const inboxTasks = doc.inboxTasks();
            if (inboxTasks && inboxTasks.length > 0) {
                for (const inboxTask of inboxTasks) {
                    if (inboxTask.id() === task.id()) {
                        isInboxTask = true;
                        break;
                    }
                }
            }
        }
        catch (e) {
            logError(`インボックスタスク判定エラー: ${e}`);
        }
        try {
            const info = {
                id: task.id(),
                name: task.name(),
                note: task.note(),
                completed: task.completed(),
                flagged: task.flagged(),
                deferDate: task.deferDate(),
                dueDate: task.dueDate(),
                creationDate: task.creationDate(),
                modificationDate: task.modificationDate(),
                completionDate: task.completionDate(),
                estimatedMinutes: task.estimatedMinutes(),
                repetitionRule: task.repetitionRule(),
                containingTask: null,
                containingProject: null,
                tags: [],
                subtasks: [],
                blocked: false,
                isNextAction: false,
                effectiveDueDate: null
            };
            try {
                const containingProject = task.containingProject();
                info.containingProject = containingProject ? {
                    id: containingProject.id(),
                    name: containingProject.name()
                } : null;
            }
            catch (e) {
                logError(`親プロジェクト情報取得エラー: ${e}`);
                info.containingProject = null;
            }
            try {
                if (isInboxTask) {
                    info.containingTask = null;
                }
                else {
                    try {
                        const parent = task.parent();
                        if (parent) {
                            info.containingTask = {
                                id: parent.id(),
                                name: parent.name()
                            };
                        }
                        else {
                            info.containingTask = null;
                            let parentTaskFound = false;
                            const allTasks = doc.flattenedTasks();
                            const taskId = task.id();
                            for (const potentialParent of allTasks) {
                                try {
                                    const subtasks = potentialParent.tasks();
                                    for (const subtask of subtasks) {
                                        try {
                                            if (subtask.id() === taskId) {
                                                info.containingTask = {
                                                    id: potentialParent.id(),
                                                    name: potentialParent.name()
                                                };
                                                parentTaskFound = true;
                                                break;
                                            }
                                        }
                                        catch (e) { }
                                    }
                                    if (parentTaskFound)
                                        break;
                                }
                                catch (e) { }
                            }
                        }
                    }
                    catch (e) {
                        logError(`親タスク直接取得エラー: ${e}`);
                        let parentTaskFound = false;
                        const allTasks = doc.flattenedTasks();
                        const taskId = task.id();
                        for (const potentialParent of allTasks) {
                            try {
                                const subtasks = potentialParent.tasks();
                                for (const subtask of subtasks) {
                                    try {
                                        if (subtask.id() === taskId) {
                                            info.containingTask = {
                                                id: potentialParent.id(),
                                                name: potentialParent.name()
                                            };
                                            parentTaskFound = true;
                                            break;
                                        }
                                    }
                                    catch (e) { }
                                }
                                if (parentTaskFound)
                                    break;
                            }
                            catch (e) { }
                        }
                        if (!parentTaskFound) {
                            info.containingTask = null;
                        }
                    }
                }
            }
            catch (e) {
                logError(`親タスク情報取得エラー: ${e}`);
                info.containingTask = null;
            }
            try {
                const tags = task.tags();
                info.tags = [];
                for (const tag of tags) {
                    info.tags.push({
                        id: tag.id(),
                        name: tag.name()
                    });
                }
            }
            catch (e) {
                logError(`タグ情報取得エラー: ${e}`);
                info.tags = [];
            }
            try {
                if (isInboxTask) {
                    info.subtasks = [];
                }
                else {
                    const subtasks = task.tasks();
                    info.subtasks = [];
                    if (subtasks && subtasks.length > 0) {
                        for (const subtask of subtasks) {
                            try {
                                info.subtasks.push({
                                    id: subtask.id(),
                                    name: subtask.name()
                                });
                            }
                            catch (e) {
                                logError(`個別のサブタスク情報取得エラー: ${e}`);
                            }
                        }
                    }
                }
            }
            catch (e) {
                logError(`サブタスク情報取得エラー: ${e}`);
                info.subtasks = [];
            }
            try {
                if (typeof task.blocked === 'function') {
                    info.blocked = task.blocked();
                }
                else {
                    info.blocked = false;
                }
            }
            catch (e) {
                logError(`ブロック状態取得エラー: ${e}`);
                info.blocked = false;
            }
            try {
                if (typeof task.isNextAction === 'function') {
                    info.isNextAction = task.isNextAction();
                }
                else {
                    info.isNextAction = false;
                }
            }
            catch (e) {
                logError(`次のアクション状態取得エラー: ${e}`);
                info.isNextAction = false;
            }
            try {
                if (typeof task.effectiveDueDate === 'function') {
                    info.effectiveDueDate = task.effectiveDueDate();
                }
                else {
                    info.effectiveDueDate = task.dueDate();
                }
            }
            catch (e) {
                logError(`有効期限取得エラー: ${e}`);
                info.effectiveDueDate = null;
            }
            return info;
        }
        catch (e) {
            logError(`タスク基本情報取得エラー: ${e}`);
            return null;
        }
    };
    function getTaskIdFromArgs() {
        if (typeof $.NSProcessInfo === "undefined") {
            return null;
        }
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        const allArgs = Array.from({ length: nsArgs.count }, (_, i) => ObjC.unwrap(nsArgs.objectAtIndex(i)));
        const scriptNameIndex = Math.min(3, allArgs.length - 1);
        if (scriptNameIndex + 1 < allArgs.length) {
            const userArgs = allArgs.slice(scriptNameIndex + 1);
            return userArgs[0] || null;
        }
        return null;
    }
    const taskId = getTaskIdFromArgs();
    if (!taskId) {
        console.log("エラー: タスクIDを指定してください。");
        console.log("使用方法: show_task.ts <taskId>");
        $.exit(1);
        return null;
    }
    try {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        let targetTask = null;
        try {
            // @ts-ignore
            if (doc.taskWithID && typeof doc.taskWithID === 'function') {
                try {
                    // @ts-ignore
                    targetTask = doc.taskWithID(taskId);
                }
                catch (e) {
                    logError(`直接IDでのタスク検索に失敗: ${e}`);
                }
            }
            if (!targetTask) {
                const tasks = doc.flattenedTasks();
                for (const task of tasks) {
                    try {
                        if (task.id() === taskId) {
                            targetTask = task;
                            break;
                        }
                    }
                    catch (e) {
                    }
                }
            }
        }
        catch (e) {
            logError(`タスク検索中にエラーが発生しました: ${e}`);
        }
        if (!targetTask) {
            console.log(`エラー: タスクが見つかりません: ${taskId}`);
            $.exit(1);
            return null;
        }
        const taskInfo = getTaskInfo(targetTask, app, doc);
        if (!taskInfo) {
            console.log("エラー: タスク情報の取得に失敗しました");
            $.exit(1);
            return null;
        }
        return JSON.stringify(taskInfo, null, 2);
    }
    catch (e) {
        console.error(`実行エラー: ${e}`);
        $.exit(1);
        return null;
    }
};
showTaskMain();
