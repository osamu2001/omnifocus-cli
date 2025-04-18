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
function listAllTasksMain(): void {
  /**
   * 指定されたフォルダの完全な階層パスを取得します。
   * @param folder パスを取得する OmniFocus フォルダオブジェクト
   * @returns フォルダの完全な階層パス。ルートフォルダの場合はフォルダ名のみ
   */
  function getFullFolderPath(folder: OmniFocusFolder | null): string {
    if (!folder || typeof folder.name !== 'function') {
      return "";
    }
    
    try {
      const parent = folder.container();
      const isParentFolder = parent && typeof parent.class === 'function' && parent.class() === 'folder';
      
      if (isParentFolder) {
        const parentPath = getFullFolderPath(parent as OmniFocusFolder); // 再帰的に親パスを取得
        return parentPath ? `${parentPath}/${folder.name()}` : folder.name();
      } else {
        // 親がフォルダでない場合（ルートフォルダなど）は自身の名前のみ返す
        return folder.name();
      }
    } catch (e) {
      // コンテナ取得エラーの場合はフォルダ名だけを返す
      try {
        return folder.name();
      } catch {
        return "";
      }
    }
  }

  /**
   * 指定されたタスクリスト内の未完了タスク（サブタスク含む）を再帰的に収集します。
   * @param tasks 処理対象のタスクの配列
   * @param parentPath 親タスクまたはプロジェクトまでの階層パス
   * @param outputArray 結果を格納する配列 (taskID\tFullPath)
   */
  function collectIncompleteTasksRecursive(tasks: OmniFocusTask[], parentPath: string, outputArray: string[]): void {
    if (!tasks || tasks.length === 0) {
      return;
    }

    for (const task of tasks) {
      try {
        // タスクが存在し、未完了であることを確認
        if (task && typeof task.completed === 'function' && !task.completed()) {
          const taskName = task.name();
          if (!taskName || taskName.trim() === "") continue; // 名前がないタスクはスキップ

          const taskId = task.id();
          const fullPath = parentPath ? `${parentPath}/${taskName}` : taskName;
          outputArray.push(`${taskId}\t${fullPath}`);

          // サブタスクが存在すれば再帰的に処理
          if (typeof task.tasks === 'function') {
            const subTasks = task.tasks();
            if (subTasks && subTasks.length > 0) {
              collectIncompleteTasksRecursive(subTasks, fullPath, outputArray);
            }
          }
        }
      } catch (e) {
        // 個別タスク処理中のエラーは続行
        continue;
      }
    }
  }

  /**
   * OmniFocus アプリケーションのインスタンスを取得します。
   * @returns OmniFocus アプリケーションオブジェクト
   * @throws OmniFocus アプリケーションが見つからない場合にエラーをスローします
   */
  function getOmniFocusApp(): OmniFocusApplication {
    try {
      const app = Application('OmniFocus') as OmniFocusApplication;
      app.includeStandardAdditions = true;
      return app;
    } catch (e) {
      // JXA環境ではconsole.errorが未定義の場合があるためconsole.logを使用
      console.log("Error: OmniFocus アプリケーションが見つかりません。");
      throw e;
    }
  }

  /**
   * プロジェクトの処理を行い、未完了タスクを収集します。
   * @param project 処理対象のプロジェクト
   * @param output 結果を格納する配列
   * @returns 処理が成功したかどうか
   */
  function processProject(project: OmniFocusProject, output: string[]): boolean {
    try {
      // プロジェクトの状態と名前を取得
      const status = project.status();
      const projectName = project.name();
      
      if (!projectName || projectName.trim() === "") return false; // 名前がないプロジェクトはスキップ

      // プロジェクトがアクティブか確認 (完了・破棄済みは除外)
      // "done status" は古いバージョンとの互換性のため残す場合がある
      if (status === "completed" || status === "dropped" || status === "done status" || status === "inactive") {
        return false;
      }

      // プロジェクトが属するフォルダを取得
      const folder = project.folder();
      
      // プロジェクトのフルパスを構築
      let projectPath = "";
      if (folder && typeof folder.name === 'function') {
        const folderPath = getFullFolderPath(folder);
        projectPath = folderPath ? `${folderPath}/${projectName}` : projectName;
      } else {
        projectPath = projectName; // フォルダがない場合はプロジェクト名のみ
      }

      // プロジェクト直下の未完了タスク（とサブタスク）を収集
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
  }

  /**
   * 結果を標準出力に書き込みます。
   * @param output 出力する文字列の配列
   */
  function writeOutput(output: string[]): void {
    try {
      // 結果を改行区切りで出力
      const resultString = output.join("\n");

      // ObjCのNSFileHandleを使って標準出力に書き込む
      const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
      const data = $.NSString.stringWithUTF8String(resultString).dataUsingEncoding($.NSUTF8StringEncoding);
      stdout.writeData(data);
    } catch (e) {
      console.log(`Error: 出力書き込み中にエラー: ${e}`);
    }
  }

  // --- メイン処理 ---
  try {
    const app = getOmniFocusApp();
    const doc = app.defaultDocument;
    // プロジェクトをフラットなリストで取得 (フォルダ内のプロジェクトも含む)
    const projects = doc.flattenedProjects();
    const output: string[] = [];

    // 各プロジェクトを処理
    for (const project of projects) {
      processProject(project, output);
    }

    // 結果を標準出力に書き込む
    writeOutput(output);
  } catch (e) {
    // ObjCのNSFileHandleを使って標準エラー出力に書き込む
    try {
      const stderr = $.NSFileHandle.fileHandleWithStandardError;
      const errorData = $.NSString.stringWithUTF8String(`Error: スクリプトの実行中に予期せぬエラーが発生しました: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
      stderr.writeData(errorData);
    } catch {
      // 標準エラー出力にすら書き込めない場合はできることがない
    }
  }
}

// メイン関数を実行
listAllTasksMain();
