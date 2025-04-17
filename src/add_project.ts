#!/usr/bin/osascript -l JavaScript

import { getCommandLineArguments } from './utils/cli';
import { getOmniFocusApp, getDefaultDocument } from './utils/omnifocus';

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
    const app = getOmniFocusApp();
    const doc = getDefaultDocument();
    doc.projects.push(app.Project({ name: projectName }));
    console.log(`プロジェクト「${projectName}」を追加しました。`);
  } catch (e) {
    console.error(`プロジェクト追加中にエラー: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// メイン処理
declare const require: any;
declare const module: any;

if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  const cliArgs = getCommandLineArguments();
  const projectName = cliArgs.length > 0 ? cliArgs[cliArgs.length - 1] : "名称未設定プロジェクト";
  addProject(projectName);
}

// テスト/再利用のためにexport
export { addProject };
