#!/usr/bin/osascript -l JavaScript

// @ts-nocheck
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * コマンドパターンを使用したOmniFocus CLI統合ツール
 * 使用例: dist/of.js add_task "新しいタスク"
 */

// =============================================================================
// 共通ヘルパー関数
// =============================================================================

const getOmniFocusApp = () => {
  const app = Application('OmniFocus');
  app.includeStandardAdditions = true;
  return app;
};

const getDefaultDocument = () => {
  return getOmniFocusApp().defaultDocument;
};

const isValidObject = (obj: any): boolean => {
  if (!obj) return false;
  
  try {
    if (typeof obj === 'object' && obj.toString && obj.toString() === '[object Reference]') {
      return false;
    }
    
    if (ObjC.unwrap(obj) === undefined) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

// =============================================================================
// 引数解析
// =============================================================================

const parseArgs = () => {
  if (typeof $.NSProcessInfo === "undefined") {
    return { command: "", args: [] };
  }
  
  const nsArgs = $.NSProcessInfo.processInfo.arguments;
  const allArgs = Array.from({ length: nsArgs.count }, (_, i) => 
    ObjC.unwrap(nsArgs.objectAtIndex(i)) as string
  );
  
  // スクリプト名以降の引数を取得
  const scriptNameIndex = Math.min(3, allArgs.length - 1);
  
  if (scriptNameIndex + 1 < allArgs.length) {
    const userArgs = allArgs.slice(scriptNameIndex + 1);
    return {
      command: userArgs[0] || "",
      args: userArgs.slice(1)
    };
  }
  
  return { command: "", args: [] };
};

// =============================================================================
// コマンド実装
// =============================================================================

const commands = {
  add_task: (args: string[]) => {
    const taskName = args.join(" ");
    
    if (!taskName || taskName.trim() === "") {
      console.log("エラー: タスク名を指定してください。");
      $.exit(1);
      return;
    }
    
    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      const inbox = doc.inboxTasks;
      inbox.push(app.InboxTask({ name: taskName }));
      console.log(`タスク「${taskName}」をインボックスに追加しました。`);
    } catch (e: any) {
      console.log(`エラー: タスクの追加中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  add_project: (args: string[]) => {
    const projectName = args.join(" ");
    
    if (!projectName || projectName.trim() === "") {
      console.log("エラー: プロジェクト名を指定してください。");
      $.exit(1);
      return;
    }
    
    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      doc.projects.push(app.Project({ name: projectName }));
      console.log(`プロジェクト「${projectName}」を追加しました。`);
    } catch (e: any) {
      console.log(`エラー: プロジェクトの追加中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  add_task_with_due: (args: string[]) => {
    if (args.length < 2) {
      console.log("エラー: 第一引数に分数、第二引数にタスク名を指定してください。");
      $.exit(1);
      return;
    }
    
    const minutes = parseInt(args[0], 10);
    const taskName = args.slice(1).join(" ");
    
    if (isNaN(minutes) || !taskName) {
      console.log("エラー: 有効な分数とタスク名を指定してください。");
      $.exit(1);
      return;
    }
    
    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      const inbox = doc.inboxTasks;
      
      const now = new Date();
      now.setMinutes(now.getMinutes() + minutes);
      
      inbox.push(app.InboxTask({ 
        name: taskName, 
        dueDate: now, 
        deferDate: now, 
        flagged: true 
      }));
      
      console.log(`タスク「${taskName}」を${minutes}分後の期限で追加しました。`);
    } catch (e: any) {
      console.log(`エラー: タスクの追加中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  project_add_task: (args: string[]) => {
    if (args.length < 2) {
      console.log("使用法: of project_add_task <projectID> <taskName>");
      $.exit(1);
      return;
    }
    
    const projectID = args[0];
    const taskName = args.slice(1).join(" ");
    
    const findProjectById = (doc: any, projectID: string): any => {
      const projects = doc.projects();
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].id() === projectID) {
          return projects[i];
        }
      }
      
      const folders = doc.folders();
      for (let i = 0; i < folders.length; i++) {
        const folderProjects = folders[i].projects();
        for (let j = 0; j < folderProjects.length; j++) {
          if (folderProjects[j].id() === projectID) {
            return folderProjects[j];
          }
        }
      }
      
      return null;
    };
    
    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      
      const targetProject = findProjectById(doc, projectID);
      
      if (!targetProject) {
        console.log(`エラー: プロジェクトが見つかりません: ${projectID}`);
        $.exit(1);
        return;
      }
      
      targetProject.tasks.push(app.Task({name: taskName}));
      console.log(`タスク「${taskName}」をプロジェクトに追加しました。`);
    } catch (e: any) {
      console.log(`エラー: ${e}`);
      $.exit(1);
    }
  },

  list_inbox_tasks: (args: string[]) => {
    try {
      const app = getOmniFocusApp();
      const inboxTasks = app.defaultDocument.inboxTasks();
      const result: string[] = [];

      for (const task of inboxTasks) {
        if (!task.completed()) {
          result.push(`${task.id()}\t${task.name()}`);
        }
      }

      console.log(result.join("\n"));
    } catch (e: any) {
      console.log(`エラー: インボックスタスクの取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  list_projects: (args: string[]) => {
    const getFullFolderPath = (folder: any): string => {
      if (!isValidObject(folder) || typeof folder.name !== "function") {
        return "";
      }
      
      try {
        let folderName = folder.name();
        
        let parent: any = null;
        try {
          parent = folder.container();
        } catch (e) {
          return folderName;
        }
        
        if (!isValidObject(parent) || 
            typeof parent.class !== "function" || 
            parent.class() !== "folder") {
          return folderName;
        }
        
        let parentPath = getFullFolderPath(parent);
        return parentPath ? `${parentPath}/${folderName}` : folderName;
      } catch (e) {
        return "";
      }
    };

    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      
      const projects = doc.flattenedProjects();
      const lines: string[] = [];

      for (const project of projects) {
        try {
          const status = project.status();
          if (status === "completed" || status === "dropped") {
            continue;
          }
          
          if (typeof status === "string" && status.includes("done")) {
            continue;
          }
          
          const projectName = project.name();
          const projectID = project.id();
          
          try {
            const folder: any = project.folder();
            
            if (isValidObject(folder)) {
              const folderPath = getFullFolderPath(folder);
              lines.push(`${projectID}\t${folderPath}/${projectName}`);
            } else {
              lines.push(`${projectID}\t${projectName}`);
            }
          } catch (e) {
            lines.push(`${projectID}\t${projectName}`);
          }
        } catch (e) {
          continue;
        }
      }

      console.log(lines.join("\n"));
    } catch (e: any) {
      console.log(`エラー: プロジェクト一覧の取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  list_tags: (args: string[]) => {
    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      const tags = doc.flattenedTags();
      const result: string[] = [];

      for (const tag of tags) {
        result.push(`${tag.id()}\t${tag.name()}`);
      }

      console.log(result.join("\n"));
    } catch (e: any) {
      console.log(`エラー: タグ一覧の取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  list_folders: (args: string[]) => {
    const listFoldersRecursive = (folder: any, parentPath: string): string[] => {
      const results: string[] = [];
      try {
        const currentName = folder.name();
        const currentId = folder.id();
        if (!currentName || !currentId) {
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
      } catch (e) {
        // スキップ
      }
      return results;
    };

    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      const topLevelFolders = doc.folders();

      let allFolderLines: string[] = [];

      if (topLevelFolders && topLevelFolders.length > 0) {
        for (const topFolder of topLevelFolders) {
          allFolderLines.push(...listFoldersRecursive(topFolder, ""));
        }
      }

      if (allFolderLines.length > 0) {
        console.log(allFolderLines.join("\n"));
      } else {
        console.log("フォルダが見つかりませんでした。");
      }
    } catch (e: any) {
      console.log(`エラー: フォルダ一覧の取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  list_all_tasks: (args: string[]) => {
    const getFullFolderPath = (folder: any): string => {
      if (!folder || typeof folder.name !== 'function') {
        return "";
      }
      
      try {
        const parent = folder.container();
        const isParentFolder = parent && typeof parent.class === 'function' && parent.class() === 'folder';
        
        if (isParentFolder) {
          const parentPath = getFullFolderPath(parent);
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

    const collectIncompleteTasksRecursive = (tasks: any[], parentPath: string, outputArray: string[]): void => {
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

    const processProject = (project: any, output: string[]): boolean => {
      try {
        const status = project.status();
        const projectName = project.name();
        
        if (!projectName || projectName.trim() === "") return false;

        if (status === "completed" || status === "dropped") {
          return false;
        }
        
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
        return false;
      }
    };

    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      const projects = doc.flattenedProjects();
      const output: string[] = [];

      for (const project of projects) {
        processProject(project, output);
      }

      console.log(output.join("\n"));
    } catch (e: any) {
      console.log(`エラー: 全タスク一覧の取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  list_tag_tasks: (args: string[]) => {
    const tagId = args[0] || "";

    const matchesTagCondition = (task: any, tagId: string): boolean => {
      try {
        const tags = task.tags();
        
        if (tagId) {
          return tags.some((tag: any) => tag.id() === tagId);
        } else {
          return tags.length === 0 && typeof task.containingProject === "function";
        }
      } catch (e) {
        return false;
      }
    };

    const isDisplayableTask = (task: any, tagId: string): boolean => {
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

    const collectMatchingTasks = (tasks: any[], tagId: string, results: string[]): void => {
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
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      const results: string[] = [];

      try {
        const inboxTasks = doc.inboxTasks();
        collectMatchingTasks(inboxTasks, tagId, results);
      } catch (e) {
        // インボックスタスク取得エラーは無視
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
        // プロジェクト一覧取得エラーは無視
      }

      if (results.length > 0) {
        console.log(results.join("\n"));
      } else {
        console.log("指定されたタグのタスクが見つかりませんでした");
      }
    } catch (e: any) {
      console.log(`エラー: タグタスク一覧の取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  list_project_tasks: (args: string[]) => {
    const projectId = args[0];
    
    if (!projectId || projectId.trim().length === 0) {
      console.log("エラー: プロジェクトIDを指定してください");
      $.exit(1);
      return;
    }

    const findProjectById = (doc: any, projectId: string): any => {
      const topProjects = doc.projects();
      for (const p of topProjects) {
        if (p.id() === projectId) {
          return p;
        }
      }
      
      const searchFolders = (folders: any[]): any => {
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

    const collectIncompleteTasks = (project: any): string[] => {
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
          // エラー無視
        }
      } else if (typeof project.tasks === "function") {
        const collectTasksRecursively = (tasks: any[]): void => {
          for (const task of tasks) {
            try {
              if (!task.completed()) {
                output.push(`${task.id()}\t${task.name()}`);
                
                if (typeof task.tasks === "function") {
                  collectTasksRecursively(task.tasks());
                }
              }
            } catch (e) {
              // エラー無視
            }
          }
        };
        
        try {
          collectTasksRecursively(project.tasks());
        } catch (e) {
          // エラー無視
        }
      }
      
      return output;
    };

    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();

      const project = findProjectById(doc, projectId);
      if (!project) {
        console.log("エラー: プロジェクトが見つかりません");
        $.exit(1);
        return;
      }
      
      const tasks = collectIncompleteTasks(project);
      console.log(tasks.join("\n"));
    } catch (e: any) {
      console.log(`エラー: プロジェクトタスク一覧の取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  list_forecast: (args: string[]) => {
    try {
      const app = getOmniFocusApp();
      const doc = getDefaultDocument();
      
      const today = new Date();
      const result: string[] = [];
      
      const tasks = doc.flattenedTasks();
      
      const dateTasks: { [date: string]: any[] } = {};
      
      for (const task of tasks) {
        if (task.completed()) continue;
        
        let taskDate = null;
        let dateType = '';
        
        if (task.dueDate()) {
          taskDate = task.dueDate();
          dateType = '期日';
        } else if (task.deferDate()) {
          taskDate = task.deferDate();
          dateType = '開始日';
        }
        
        if (!taskDate) continue;
        
        const taskDay = new Date(taskDate);
        const daysDiff = Math.floor((taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < -1 || daysDiff > 7) continue;
        
        const dateStr = taskDay.toISOString().split('T')[0];
        
        if (!dateTasks[dateStr]) {
          dateTasks[dateStr] = [];
        }
        
        dateTasks[dateStr].push({
          id: task.id(),
          name: task.name(),
          dateType: dateType,
          date: taskDate
        });
      }
      
      const sortedDates = Object.keys(dateTasks).sort();
      
      for (const dateStr of sortedDates) {
        const tasksForDate = dateTasks[dateStr];
        
        for (const task of tasksForDate) {
          const taskDate = new Date(task.date);
          const year = taskDate.getFullYear();
          const month = String(taskDate.getMonth() + 1).padStart(2, '0');
          const day = String(taskDate.getDate()).padStart(2, '0');
          const hours = String(taskDate.getHours()).padStart(2, '0');
          const minutes = String(taskDate.getMinutes()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
          
          result.push(`${task.id}\t${formattedDate}\t${task.dateType}\t${task.name}`);
        }
      }
      
      console.log(result.join("\n"));
    } catch (e: any) {
      console.log(`エラー: 予測ビューの取得中にエラーが発生しました: ${e}`);
      $.exit(1);
    }
  },

  help: (args: string[]) => {
    console.log("OmniFocus CLI Tool");
    console.log("");
    console.log("使用方法:");
    console.log("  of <コマンド> [引数...]");
    console.log("");
    console.log("利用可能なコマンド:");
    console.log("  【タスク追加】");
    console.log("  add_task <タスク名>               - インボックスにタスクを追加");
    console.log("  add_task_with_due <分数> <タスク名> - 指定分後期限のタスクを追加");
    console.log("  project_add_task <ID> <タスク名>    - プロジェクトにタスクを追加");
    console.log("");
    console.log("  【プロジェクト管理】");
    console.log("  add_project <プロジェクト名>       - プロジェクトを追加");
    console.log("  list_projects                    - プロジェクト一覧を表示");
    console.log("  list_project_tasks <ID>          - プロジェクトのタスク一覧");
    console.log("");
    console.log("  【タスク一覧表示】");
    console.log("  list_inbox_tasks                 - インボックスのタスク一覧");
    console.log("  list_all_tasks                   - 全ての未完了タスク一覧");
    console.log("  list_tag_tasks [タグID]           - タグ別タスク一覧");
    console.log("  list_forecast                    - 予測ビュー（7日間）");
    console.log("");
    console.log("  【その他】");
    console.log("  list_folders                     - フォルダ一覧を表示");
    console.log("  list_tags                        - タグ一覧を表示");
    console.log("  help                             - このヘルプを表示");
    console.log("");
    console.log("例:");
    console.log("  of add_task '今日のミーティング準備'");
    console.log("  of add_task_with_due 60 '1時間後のタスク'");
    console.log("  of list_all_tasks");
    console.log("  of list_forecast");
  }
};

// =============================================================================
// メイン実行部分
// =============================================================================

const main = () => {
  const { command, args } = parseArgs();
  
  if (!command) {
    console.log("エラー: コマンドを指定してください。");
    console.log("使用方法: of <コマンド> [引数...]");
    console.log("ヘルプを表示するには: of help");
    $.exit(1);
    return;
  }
  
  const commandFunction = commands[command];
  
  if (!commandFunction) {
    console.log(`エラー: 不明なコマンド「${command}」です。`);
    console.log("利用可能なコマンドを確認するには: of help");
    $.exit(1);
    return;
  }
  
  try {
    commandFunction(args);
  } catch (e: any) {
    console.log(`エラー: コマンド実行中にエラーが発生しました: ${e}`);
    $.exit(1);
  }
};

// 実行
main();