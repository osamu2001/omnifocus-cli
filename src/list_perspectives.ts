#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用

function listPerspectivesMain() {
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

  const app = Application('OmniFocus');
  app.includeStandardAdditions = true;
  const doc = app.defaultDocument;
  const perspectives = doc.perspectives();
  const lines: string[] = [];

  perspectives.forEach((p: any) => {
    let id: string | undefined, name: string | undefined;
    try {
      id = p.id();
      name = p.name();
      if (name && name !== "") {
        lines.push(`${id}\t${name}`);
      } else {
        const fixedName = id ? getDefaultName(id) : null;
        if (fixedName) {
          lines.push(`${id}\t${fixedName}`);
        }
      }
    } catch (e: any) {
      try {
        const fixedName = id ? getDefaultName(id) : null;
        id = p.id();
        if (fixedName) {
          lines.push(`${id}\t${fixedName}`);
        }
      } catch (e2: any) {
        // エラー処理
      }
    }
  });

  return lines.join("\n");
}

listPerspectivesMain();
