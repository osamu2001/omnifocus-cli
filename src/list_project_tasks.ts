#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * 指定されたプロジェクトIDに含まれる未完了タスクを一覧表示する
 * 使用例: ./dist/list_project_tasks.js プロジェクトID
 * 出力形式: タスクID\tタスク名
 */
const listProjectTasksMain = (): string | null => {
  const getCommandLineArguments = (): string[] => {
    const args: string[] = [];
    if (typeof $.NSProcessInfo !== "undefined") {
      const nsArgs = $.NSProcessInfo.processInfo.arguments;
      for (let i = 0; i < nsArgs.count; i++) {
        args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
      }
      return args.slice(4);
    }
    return args;
  };

  const findProjectById = (doc: OmniFocusDocument, projectId: string): OmniFocusProject | null => {
    const topProjects = doc.projects();
    for (const p of topProjects) {
      if (p.id() === projectId) {
        return p;
      }
    }
    
    const searchFolders = (folders: OmniFocusFolder[]): OmniFocusProject | null => {
      for (const folder of folders) {
        const projects = folder.projects();
        for (const p of projects) {
          if (p.id() === projectId) {
            return p;
          }
        }
        
        const subfolders = folder.folders();
        const found = searchFolders(subfolders);
        if (found) return found;
      }
      return null;
    };
    
    return searchFolders(doc.folders());
  };

  const collectIncompleteTasks = (project: OmniFocusProject): string[] => {
    const output: string[] = [];
    
    if (typeof project.flattenedTasks === "function") {
      try {
        const tasks = project.flattenedTasks();
        for (const task of tasks) {
          if (!task.completed()) {
            output.push(`${task.id()}\t${task.name()}`);
          }
        }
      } catch (e) {
      }
    } else if (typeof project.tasks === "function") {
      const collectTasksRecursively = (tasks: OmniFocusTask[]): void => {
        for (const task of tasks) {
          try {
            if (!task.completed()) {
              output.push(`${task.id()}\t${task.name()}`);
              
              if (typeof task.tasks === "function") {
                collectTasksRecursively(task.tasks());
              }
            }
          } catch (e) {
          }
        }
      };
      
      try {
        collectTasksRecursively(project.tasks());
      } catch (e) {
      }
    }
    
    return output;
  };

  const args = getCommandLineArguments();
  const projectId = args[0];
  
  if (!projectId || projectId.trim().length === 0) {
    console.log("Error: projectId not found or invalid");
    return null;
  }
  
  try {
    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;

    const project = findProjectById(doc, projectId);
    if (!project) {
      console.log("Error: project not found");
      return null;
    }
    
    const tasks = collectIncompleteTasks(project);
    return tasks.join("\n");
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
};

listProjectTasksMain();
