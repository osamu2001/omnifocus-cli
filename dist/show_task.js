#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
ObjC.import('Foundation');
function showTaskMain() {
    /**
     * タスクの詳細情報を取得する
     * @param task タスクオブジェクト
     * @returns タスク情報のオブジェクト
     */
    function getTaskInfo(task) {
        if (!task)
            return null;
        const info = {};
        try {
            info.id = task.id();
        }
        catch (e) { }
        try {
            info.name = task.name();
        }
        catch (e) { }
        try {
            info.note = task.note();
        }
        catch (e) { }
        try {
            info.completed = task.completed();
        }
        catch (e) { }
        try {
            info.flagged = task.flagged();
        }
        catch (e) { }
        try {
            info.deferDate = task.deferDate();
        }
        catch (e) { }
        try {
            info.dueDate = task.dueDate();
        }
        catch (e) { }
        try {
            info.creationDate = task.creationDate();
        }
        catch (e) { }
        try {
            info.modificationDate = task.modificationDate();
        }
        catch (e) { }
        try {
            info.completionDate = task.completionDate();
        }
        catch (e) { }
        try {
            info.estimatedMinutes = task.estimatedMinutes();
        }
        catch (e) { }
        try {
            info.repetitionRule = task.repetitionRule();
        }
        catch (e) { }
        try {
            const containingTask = task.containingTask();
            info.containingTask = containingTask ? containingTask.id() : null;
        }
        catch (e) { }
        try {
            const containingProject = task.containingProject();
            info.containingProject = containingProject ? {
                id: containingProject.id(),
                name: containingProject.name()
            } : null;
        }
        catch (e) { }
        try {
            const tags = task.tags();
            info.tags = [];
            for (let i = 0; i < tags.length; i++) {
                try {
                    info.tags.push({
                        id: tags[i].id(),
                        name: tags[i].name()
                    });
                }
                catch (e) { }
            }
        }
        catch (e) { }
        try {
            const subtasks = task.tasks();
            info.subtasks = [];
            for (let i = 0; i < subtasks.length; i++) {
                try {
                    info.subtasks.push({
                        id: subtasks[i].id(),
                        name: subtasks[i].name()
                    });
                }
                catch (e) { }
            }
        }
        catch (e) { }
        return info;
    }
    // メイン処理
    const args = [];
    if (typeof $.NSProcessInfo !== "undefined") {
        const nsArgs = $.NSProcessInfo.processInfo.arguments;
        for (let i = 0; i < nsArgs.count; i++) {
            args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
        }
    }
    const taskId = args[4] || null;
    let result = null;
    if (!taskId) {
        console.log("Usage: show_task.ts [taskId]");
    }
    else {
        const app = Application('OmniFocus');
        app.includeStandardAdditions = true;
        const doc = app.defaultDocument;
        const tasks = doc.flattenedTasks();
        let task = null;
        for (let i = 0; i < tasks.length; i++) {
            try {
                if (tasks[i].id() === taskId) {
                    task = tasks[i];
                    break;
                }
            }
            catch (e) { }
        }
        if (!task) {
            console.log("Task not found: " + taskId);
        }
        else {
            const taskInfo = getTaskInfo(task);
            result = JSON.stringify(taskInfo, null, 2);
        }
    }
    return result;
}
showTaskMain();
