#!/usr/bin/osascript -l JavaScript

// @ts-nocheck
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

// @ts-ignore
const app = Application('OmniFocus');
// @ts-ignore
app.includeStandardAdditions = true;
// @ts-ignore
const doc = app.defaultDocument;
// @ts-ignore
const perspectives = doc.perspectives();
const lines: string[] = [];

// @ts-ignore
perspectives.forEach(p => {
  let id, name;
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
      const fixedName = getDefaultName(id);
      id = p.id();
      if (fixedName) {
        lines.push(`${id}\t${fixedName}`);
      }
    } catch (e2) {
      // エラー処理
    }
  }
});

lines.join("\n");
