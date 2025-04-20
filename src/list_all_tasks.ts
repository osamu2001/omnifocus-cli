#!/usr/bin/osascript -l JavaScript

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
const listAllTasksMain = (): void => {
  const getFullFolderPath = (folder: OmniFocusFolder | null): string => {
    if (!folder || typeof folder.name !== 'function') {
      return "";
    }
    
    try {
      const parent = folder.container();
      const isParentFolder = parent && typeof parent.class === 'function' && parent.class() === 'folder';
      
      if (isParentFolder) {
        const parentPath = getFullFolderPath(parent as OmniFocusFolder);
        return parentPath ? `${parentPath}/${folder.name()}` : folder.name();
      } else {
        return folder.name();
      }
    } catch (e) {
      try {
        return folder.name();
      } catch {
        return "";
      }
    }
  };

  const collectIncompleteTasksRecursive = (tasks: ReadonlyArray<OmniFocusTask>, parentPath: string, outputArray: string[]): void => {
    if (!tasks || tasks.length === 0) {
      return;
    }

    for (const task of tasks) {
      try {
        if (task && typeof task.completed === 'function' && !task.completed()) {
          const taskName = task.name();
          if (!taskName || taskName.trim() === "") continue;

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
      } catch (e) {
        continue;
      }
    }
  };

  const getOmniFocusApp = (): OmniFocusApplication => {
    try {
      const app = Application('OmniFocus') as OmniFocusApplication;
      app.includeStandardAdditions = true;
      return app;
    } catch (e) {
      console.log("Error: OmniFocus アプリケーションが見つかりません。");
      throw e;
    }
  };

  const processProject = (project: OmniFocusProject, output: string[]): boolean => {
    try {
      const status = project.status();
      const projectName = project.name();
      
      if (!projectName || projectName.trim() === "") return false;

      if (status === "completed" || status === "dropped") {
        return false;
      }
      
      // "done status"や"inactive"はOmniFocusの型定義にはないが、念のため追加チェック
      if (typeof status === "string" && (status.includes("done") || status.includes("inactive"))) {
        return false;
      }

      const folder = project.folder();
      
      let projectPath = "";
      if (folder && typeof folder.name === 'function') {
        const folderPath = getFullFolderPath(folder);
        projectPath = folderPath ? `${folderPath}/${projectName}` : projectName;
      } else {
        projectPath = projectName;
      }

      if (typeof project.tasks === 'function') {
        const rootTasks = project.tasks();
        if (rootTasks && rootTasks.length > 0) {
          collectIncompleteTasksRecursive(rootTasks, projectPath, output);
        }
      }
      
      return true;
    } catch (e) {
      const projectNameAttempt = typeof project?.name === 'function' ? project.name() : '不明なプロジェクト';
      const projectId = typeof project?.id === 'function' ? project.id() : 'N/A';
      console.log(`Error: プロジェクト "${projectNameAttempt}" (ID: ${projectId}) の情報取得中にエラー: ${e}`);
      return false;
    }
  };

  const writeOutput = (output: string[]): void => {
    try {
      const resultString = output.join("\n");

      const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
      const data = $.NSString.stringWithUTF8String(resultString).dataUsingEncoding($.NSUTF8StringEncoding);
      stdout.writeData(data);
    } catch (e) {
      console.log(`Error: 出力書き込み中にエラー: ${e}`);
    }
  };

  try {
    const app = getOmniFocusApp();
    const doc = app.defaultDocument;
    const projects = doc.flattenedProjects();
    const output: string[] = [];

    for (const project of projects) {
      processProject(project, output);
    }

    writeOutput(output);
  } catch (e) {
    try {
      const stderr = $.NSFileHandle.fileHandleWithStandardError;
      const errorData = $.NSString.stringWithUTF8String(`Error: スクリプトの実行中に予期せぬエラーが発生しました: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
      stderr.writeData(errorData);
    } catch {
    }
  }
};

listAllTasksMain();
