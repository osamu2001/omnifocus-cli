#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

function projectAddTaskMain() {
  // コマンドライン引数を取得
  const args = [];
  if (typeof $.NSProcessInfo !== "undefined") {
    const nsArgs = $.NSProcessInfo.processInfo.arguments;
    for (let i = 0; i < nsArgs.count; i++) {
      args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
    }
  }
  
  const projectID = args[4];
  const taskName = args[5];
  
  if (!projectID || !taskName) {
    console.log("Usage: project_add_task.ts <projectID> <taskName>");
    $.exit(1);
    return null;
  }
  
  try {
    const app = Application("OmniFocus");
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    
    // プロジェクトを検索
    let targetProject = null;
    const projects = doc.projects();
    
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].id() === projectID) {
        targetProject = projects[i];
        break;
      }
    }
    
    if (!targetProject) {
      // フォルダ内も検索
      const folders = doc.folders();
      for (let i = 0; i < folders.length; i++) {
        const folderProjects = folders[i].projects();
        for (let j = 0; j < folderProjects.length; j++) {
          if (folderProjects[j].id() === projectID) {
            targetProject = folderProjects[j];
            break;
          }
        }
        if (targetProject) break;
      }
    }
    
    if (!targetProject) {
      console.log("Error: Project not found: " + projectID);
      $.exit(1);
      return null;
    }
    
    // タスクを追加
    const project = targetProject;
    project.tasks.push(app.Task({name: taskName}));
    
    // 成功
    $.exit(0);
    return null;
  } catch (e: any) {
    console.log("Error: " + e.message);
    $.exit(1);
    return null;
  }
}

projectAddTaskMain();
