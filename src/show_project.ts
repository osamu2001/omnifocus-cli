#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
/// <reference path="./types/omnifocus.d.ts" />
/// <reference path="./types/jxa.d.ts" />

ObjC.import('stdlib');
ObjC.import('Foundation');

/**
 * プロジェクト情報を表示する
 * @returns JSON形式のプロジェクト情報
 */
const showProjectMain = (): string | null => {
  interface ProjectDetailInfo {
    id: string;
    name: string;
    note: string;
    completed: boolean;
    flagged: boolean;
    creationDate: Date;
    modificationDate: Date;
    dueDate: Date | null | undefined;
    priority: number | undefined;
    parent: { id: string; name: string } | undefined;
    childProjectCount: number;
    progress: number | undefined;
    tags: Array<{ id: string; name: string }>;
  }

  const getProjectIdFromArgs = (): string => {
    if (typeof $.NSProcessInfo === "undefined") {
      console.log("NSProcessInfoが利用できません");
      $.exit(1);
    }
    
    const nsArgs = $.NSProcessInfo.processInfo.arguments;
    const allArgs = Array.from({ length: nsArgs.count }, (_, i) => 
      ObjC.unwrap(nsArgs.objectAtIndex(i)) as string
    );
    
    const scriptNameIndex = Math.min(3, allArgs.length - 1);
    
    if (scriptNameIndex + 1 < allArgs.length) {
      const userArgs = allArgs.slice(scriptNameIndex + 1);
      const projectId = userArgs[0];
      if (projectId && projectId.trim() !== "") {
        return projectId;
      }
    }
    
    console.log("使用法: show_project <projectId>");
    $.exit(1);
    return "";
  };

  const findProjectById = (doc: OmniFocusDocument, projectId: string): OmniFocusProject => {
    try {
      const projects = doc.flattenedProjects();
      
      for (let i = 0; i < projects.length; i++) {
        try {
          if (projects[i].id() === projectId) {
            return projects[i];
          }
        } catch (e) {
          continue;
        }
      }
      
      console.log(`プロジェクトが見つかりません: ${projectId}`);
      $.exit(1);
    } catch (e) {
      console.log(`プロジェクト検索中にエラー: ${e}`);
      $.exit(1);
    }
  };

  const getProjectInfo = (project: OmniFocusProject): ProjectDetailInfo => {
    const safeGetProperty = <T>(obj: any, propertyName: string, defaultValue: T): T => {
      try {
        if (typeof obj[propertyName] === 'function') {
          const result = obj[propertyName]();
          return (result !== undefined && result !== null) ? result : defaultValue;
        } else {
          return obj[propertyName] || defaultValue;
        }
      } catch (e) {
        console.log(`${propertyName}の取得中にエラーが発生しました: ${e}`);
        return defaultValue;
      }
    };

    const info: ProjectDetailInfo = {
      id: '',
      name: '',
      note: '',
      completed: false,
      flagged: false,
      creationDate: new Date(),
      modificationDate: new Date(),
      dueDate: undefined,
      priority: undefined,
      parent: undefined,
      childProjectCount: 0,
      progress: undefined,
      tags: []
    };

    try { info.id = project.id(); } catch (e) { }
    try { info.name = project.name(); } catch (e) { }
    try { info.note = project.note(); } catch (e) { }
    try { info.completed = project.completed(); } catch (e) { }
    try { info.flagged = project.flagged(); } catch (e) { }
    try { info.creationDate = project.creationDate(); } catch (e) { }
    try { info.modificationDate = project.modificationDate(); } catch (e) { }

    try {
      const tags = project.tags();
      info.tags = [];
      for (let i = 0; i < tags.length; i++) {
        info.tags.push({
          id: safeGetProperty<string>(tags[i], 'id', ''),
          name: safeGetProperty<string>(tags[i], 'name', '')
        });
      }
    } catch (e) {
    }

    try { info.dueDate = project.dueDate(); } catch (e) { }
    try { 
      const status = project.effectiveStatus();
      switch (status.toLowerCase()) {
        case 'active': info.priority = 1; break;
        case 'on hold': info.priority = 0; break;
        case 'completed': info.priority = -1; break;
        case 'dropped': info.priority = -2; break;
        default: info.priority = undefined;
      }
    } catch (e) { }

    try {
      const folder = project.folder();
      if (folder) {
        info.parent = {
          id: safeGetProperty<string>(folder, 'id', ''),
          name: safeGetProperty<string>(folder, 'name', '')
        };
      }
    } catch (e) {
    }

    try {
      const tasks = project.tasks();
      info.childProjectCount = tasks ? tasks.length : 0;
    } catch (e) {
    }

    try {
      if (typeof project.flattenedTasks === 'function') {
        const tasks = project.flattenedTasks();
        if (tasks && tasks.length > 0) {
          const totalTasks = tasks.length;
          let completedTasks = 0;
          
          for (let i = 0; i < totalTasks; i++) {
            if (safeGetProperty<boolean>(tasks[i], 'completed', false)) {
              completedTasks++;
            }
          }
          
          info.progress = totalTasks > 0 ? (completedTasks / totalTasks) : undefined;
        }
      } else {
        const tasks = project.tasks();
        if (tasks && tasks.length > 0) {
          const totalTasks = tasks.length;
          let completedTasks = 0;
          
          for (let i = 0; i < totalTasks; i++) {
            if (safeGetProperty<boolean>(tasks[i], 'completed', false)) {
              completedTasks++;
            }
          }
          
          info.progress = totalTasks > 0 ? (completedTasks / totalTasks) : undefined;
        }
      }
    } catch (e) {
    }

    return info;
  };

  const projectId = getProjectIdFromArgs();

  if (!projectId) {
    console.log(`使用法: show_project <projectId>`);
    $.exit(1);
    return null;
  }

  try {
    const app = Application('OmniFocus') as any;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;

    const project = findProjectById(doc, projectId);

    if (!project) {
      console.log(`プロジェクトが見つかりません: ${projectId}`);
      $.exit(1);
      return null;
    }

    const projectInfo = getProjectInfo(project);
    return JSON.stringify(projectInfo, null, 2);
  } catch (e) {
    console.log(`エラー: ${e}`);
    $.exit(1);
    return null;
  }
};

showProjectMain();
