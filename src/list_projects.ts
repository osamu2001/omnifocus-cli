#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのプロジェクト一覧を表示する
 * 出力形式: プロジェクトID\tフォルダパス/プロジェクト名
 */
const listProjectsMain = (): string => {
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
    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    
    const projects = doc.flattenedProjects();
    const lines: string[] = [];

    for (const project of projects) {
      try {
        const status = project.status();
        if (status === "completed" || status === "dropped") {
          continue;
        }
        
        // "done status"はOmniFocusの型定義にはないが、念のため追加チェック
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

    return lines.join("\n");
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    return "";
  }
};

listProjectsMain();
