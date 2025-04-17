#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');
ObjC.import('Foundation');

/**
 * プロジェクトの詳細情報を取得する
 * @param project プロジェクトオブジェクト
 * @returns プロジェクト情報のオブジェクト
 */
function getProjectInfo(project: any): any {
  if (!project) return null;

  const info: {
    id?: string;
    name?: string;
    note?: string;
    completed?: boolean;
    flagged?: boolean;
    creationDate?: Date;
    modificationDate?: Date;
    tags?: Array<{id: string; name: string}>;
    dueDate?: Date | null;
    priority?: number | null;
    parent?: {id: string | null; name: string | null} | null;
    childProjectCount?: number;
    progress?: number | null;
  } = {};

  try { info.id = project.id(); } catch (e) {}
  try { info.name = project.name(); } catch (e) {}
  try { info.note = project.note(); } catch (e) {}
  try { info.completed = project.completed(); } catch (e) {}
  try { info.flagged = project.flagged(); } catch (e) {}

  try { info.creationDate = project.creationDate(); } catch (e) {}
  try { info.modificationDate = project.modificationDate(); } catch (e) {}

  try {
    const tags = project.tags();
    info.tags = [];
    for (let i = 0; i < tags.length; i++) {
      try {
        info.tags.push({
          id: tags[i].id(),
          name: tags[i].name()
        });
      } catch (e) {}
    }
  } catch (e) {}

  try { info.dueDate = project.dueDate ? project.dueDate() : null; } catch (e) {}
  try { info.priority = project.effectivePriority ? project.effectivePriority() : null; } catch (e) {}
  try {
    const parent = project.parent ? project.parent() : null;
    if (parent) {
      info.parent = {
        id: parent.id ? parent.id() : null,
        name: parent.name ? parent.name() : null
      };
    } else {
      info.parent = null;
    }
  } catch (e) {}
  try {
    const children = project.projects ? project.projects() : [];
    info.childProjectCount = children.length;
  } catch (e) {
    info.childProjectCount = 0;
  }

  try {
    const tasks = project.flattenedTasks ? project.flattenedTasks() : [];
    const totalTasks = tasks.length;
    let completedTasks = 0;
    for (let i = 0; i < totalTasks; i++) {
      try {
        if (tasks[i].completed && tasks[i].completed()) {
          completedTasks++;
        }
      } catch (e) {}
    }
    info.progress = totalTasks > 0 ? (completedTasks / totalTasks) : null;
  } catch (e) {
    info.progress = null;
  }

  return info;
}

// メイン処理
const args: string[] = [];
if (typeof $.NSProcessInfo !== "undefined") {
  const nsArgs = $.NSProcessInfo.processInfo.arguments;
  for (let i = 0; i < nsArgs.count; i++) {
    args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
  }
}

const projectId = args[4] || null;
let resultValue = null;

if (!projectId) {
  console.log("Usage: show_project.jxa [projectId]");
} else {
  const app = Application('OmniFocus');
  app.includeStandardAdditions = true;

  const doc = app.defaultDocument;
  const projects = doc.flattenedProjects();
  let project = null;
  
  for (let i = 0; i < projects.length; i++) {
    try {
      if (projects[i].id() === projectId) {
        project = projects[i];
        break;
      }
    } catch (e) {}
  }

  if (!project) {
    console.log("Project not found: " + projectId);
  } else {
    const projectInfo = getProjectInfo(project);
    resultValue = JSON.stringify(projectInfo, null, 2);
  }
}

resultValue;
