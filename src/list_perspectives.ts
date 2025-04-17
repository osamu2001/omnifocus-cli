#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用

/**
 * パースペクティブIDからデフォルト名を取得します
 * @param id パースペクティブID
 * @returns デフォルト名、見つからない場合はnull
 */
function getDefaultName(id: string): string | null {
  switch (id) {
  case "ProcessInbox.v2": return "Inbox";
  case "ProcessProjects.v2": return "Projects";
  case "ProcessReview.v2": return "Review";
  case "ProcessTags.v3": return "Tags";
  case "ProcessForecast.v2": return "Forecast";
  case "ProcessNearby.v4": return "Nearby";
  case "ProcessFlaggedItems.v2": return "Flagged";
  default: return null;
  }
}

function listPerspectivesMain(): string {
  const omnifocusApp = Application('OmniFocus');
  omnifocusApp.includeStandardAdditions = true;
  const document = omnifocusApp.defaultDocument;
  const perspectives = document.perspectives();
  const lines: string[] = [];

  perspectives.forEach(p => {
    let id: string = "";
    let name: string = "";
    try {
      id = p.id();
      name = p.name();
      if (name && name !== "") {
        lines.push(`${id}\t${name}`);
      } else {
        const fixedName = getDefaultName(id);
        if (fixedName) {
          lines.push(`${id}\t${fixedName}`);
        }
      }
    } catch (e) {
      try {
        id = p.id();
        const fixedName = getDefaultName(id);
        if (fixedName) {
          lines.push(`${id}\t${fixedName}`);
        }
      } catch (e2) {
        // エラー処理
      }
    }
  });

  return lines.join("\n");
}

listPerspectivesMain();
