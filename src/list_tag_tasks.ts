#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * 指定されたタグIDに関連する未完了タスクを一覧表示します
 * 使用例: ./dist/list_tag_tasks.js タグID
 * タグIDなしで実行した場合はタグなしタスクを表示します
 * 
 * 出力形式: タスクID\tタスク名
 */
const listTagTasksMain = (): string => {
  const getTagIDFromArgs = (): string => {
    if (typeof $.NSProcessInfo === "undefined") {
      return "";
    }
    
    const nsArgs = $.NSProcessInfo.processInfo.arguments;
    const allArgs = Array.from({ length: nsArgs.count }, (_, i) => 
      ObjC.unwrap(nsArgs.objectAtIndex(i)) as string
    );
    
    const scriptNameIndex = Math.min(3, allArgs.length - 1);
    
    if (scriptNameIndex + 1 < allArgs.length) {
      const userArgs = allArgs.slice(scriptNameIndex + 1);
      return userArgs[0] || "";
    }
    
    return "";
  };

  const matchesTagCondition = (task: OmniFocusTask, tagId: string): boolean => {
    try {
      const tags = task.tags();
      
      if (tagId) {
        return tags.some(tag => tag.id() === tagId);
      } else {
        return tags.length === 0 && typeof task.containingProject === "function";
      }
    } catch (e) {
      return false;
    }
  };

  const isDisplayableTask = (task: OmniFocusTask, tagId: string): boolean => {
    try {
      if (task.completed()) return false;

      const deferDate = task.deferDate();
      if (deferDate && deferDate > new Date()) return false;

      if (task.blocked && task.blocked()) return false;

      return matchesTagCondition(task, tagId);
    } catch (e) {
      return false;
    }
  };

  const collectMatchingTasks = (tasks: ReadonlyArray<OmniFocusTask>, tagId: string, results: string[]): void => {
    for (const task of tasks) {
      try {
        if (isDisplayableTask(task, tagId)) {
          results.push(`${task.id()}\t${task.name()}`);
        }
      } catch (e) {
        continue;
      }
    }
  };

  try {
    const tagId = getTagIDFromArgs();

    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    const results: string[] = [];

    try {
      const inboxTasks = doc.inboxTasks();
      collectMatchingTasks(inboxTasks, tagId, results);
    } catch (e) {
      console.log(`インボックスタスク取得エラー: ${e}`);
    }

    try {
      const projects = typeof doc.flattenedProjects === "function" ? 
                      doc.flattenedProjects() : 
                      doc.projects();

      for (const project of projects) {
        try {
          const tasks = typeof project.flattenedTasks === "function" ? 
                        project.flattenedTasks() : 
                        typeof project.tasks === "function" ? 
                        project.tasks() : [];

          collectMatchingTasks(tasks, tagId, results);
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.log(`プロジェクト一覧取得エラー: ${e}`);
    }

    return results.length > 0 ? 
           results.join("\n") : 
           "指定されたタグのタスクが見つかりませんでした";
  } catch (e) {
    console.log(`実行エラー: ${e}`);
    return `エラー: ${e}`;
  }
};

listTagTasksMain();
