#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

function addProjectMain() {
  function getCommandLineArguments(): string[] {
    const args: string[] = [];
    if (typeof $.NSProcessInfo !== "undefined") {
      const nsArgs = $.NSProcessInfo.processInfo.arguments;
      for (let i = 0; i < nsArgs.count; i++) {
        args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
      }
      return args.slice(2);
    }
    return args;
  }

  function addProject(projectName: string): void {
    try {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      const doc = app.defaultDocument;
      doc.projects.push(app.Project({ name: projectName }));
    } catch (e) {
      console.error(`プロジェクト追加中にエラー: ${e}`);
    }
  }

  const cliArgs = getCommandLineArguments();
  if (cliArgs.length === 0) {
    console.error("エラー: プロジェクト名を指定してください。");
    $.exit(1);
    return;
  }
  
  const projectName = cliArgs[cliArgs.length - 1];
  if (!projectName || projectName.trim() === "") {
    console.error("エラー: プロジェクト名が空です。");
    $.exit(1);
    return;
  }
  
  addProject(projectName);
}

addProjectMain();
