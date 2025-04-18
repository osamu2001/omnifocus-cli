#!/usr/bin/osascript -l JavaScript

// @ts-nocheck
// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

function listFoldersMain() {
  /**
   * フォルダを再帰的にリストアップする関数
   * @param folder フォルダオブジェクト
   * @param parentPath 親フォルダのパス
   * @returns フォルダ情報の配列
   */
  function listFoldersRecursive(folder: any, parentPath: string): string[] {
    const results: string[] = [];
    try {
      const currentName = folder.name();
      const currentId = folder.id();
      if (!currentName || !currentId) {
        console.warn("名前またはIDが取得できないフォルダが見つかりました。スキップします。");
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
      const folderNameAttempt = typeof folder?.name === 'function' ? folder.name() : '不明なフォルダ';
      console.error(`フォルダ "${folderNameAttempt}" の処理中にエラー: ${e}`);
    }
    return results;
  }

  /**
   * OmniFocusアプリケーションのインスタンスを取得する
   * @returns OmniFocusアプリケーションのインスタンス
   */
  function getOmniFocusApp(): any {
      try {
          // @ts-ignore
          const app = Application('OmniFocus');
          // @ts-ignore
          app.includeStandardAdditions = true;
          return app;
      } catch (e) {
          console.error("OmniFocus アプリケーションが見つかりません。");
          throw e;
      }
  }

  // メイン処理
  try {
    const app = getOmniFocusApp();
    // @ts-ignore
    const doc = app.defaultDocument;
    // @ts-ignore
    const topLevelFolders = doc.folders();

    let allFolderLines: string[] = [];

    if (topLevelFolders && topLevelFolders.length > 0) {
      for (const topFolder of topLevelFolders) {
        allFolderLines.push(...listFoldersRecursive(topFolder, ""));
      }
    } else {
      console.log("トップレベルフォルダが見つかりません。");
    }

    if (allFolderLines.length > 0) {
      const resultString = allFolderLines.join("\n");

      // @ts-ignore
      const stdout = $.NSFileHandle.fileHandleWithStandardOutput;
      // @ts-ignore
      const data = $.NSString.stringWithUTF8String(resultString).dataUsingEncoding($.NSUTF8StringEncoding);
      // @ts-ignore
      stdout.writeData(data);
    } else {
      console.log("処理対象のフォルダがありませんでした。");
    }
  } catch (e) {
    // @ts-ignore
    const stderr = $.NSFileHandle.fileHandleWithStandardError;
    // @ts-ignore
    const errorData = $.NSString.stringWithUTF8String(`スクリプトの実行中に予期せぬエラーが発生しました: ${e}\n`).dataUsingEncoding($.NSUTF8StringEncoding);
    // @ts-ignore
    stderr.writeData(errorData);
  }
}

listFoldersMain();
