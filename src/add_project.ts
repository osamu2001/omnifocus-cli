#!/usr/bin/osascript -l JavaScript

// @ts-nocheck
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

function addProjectMain() {
  /**
   * コマンドライン引数を取得します
   */
  function getCommandLineArguments(): string[] {
    const args: string[] = [];
    // @ts-ignore
    if (typeof $.NSProcessInfo !== "undefined") {
      // @ts-ignore
      const nsArgs = $.NSProcessInfo.processInfo.arguments;
      for (let i = 0; i < nsArgs.count; i++) {
        // @ts-ignore
        args.push(ObjC.unwrap(nsArgs.objectAtIndex(i)));
      }
      return args.slice(2);
    }
    return args;
  }

  /**
   * 指定された名前のプロジェクトを追加します
   * @param projectName 追加するプロジェクトの名前
   */
  function addProject(projectName: string): void {
    if (!projectName) {
      console.log("プロジェクト名が指定されていません。");
      return;
    }
    try {
      // @ts-ignore
      const app = Application('OmniFocus');
      // @ts-ignore
      app.includeStandardAdditions = true;
      // @ts-ignore
      const doc = app.defaultDocument;
      // @ts-ignore
      doc.projects.push(app.Project({ name: projectName }));
    } catch (e) {
      console.error(`プロジェクト追加中にエラー: ${e}`);
    }
  }

  // メイン処理
  const cliArgs = getCommandLineArguments();
  const projectName = cliArgs.length > 0 ? cliArgs[cliArgs.length - 1] : "名称未設定プロジェクト (TS)";
  addProject(projectName);
}

addProjectMain();
