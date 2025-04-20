#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用

/**
 * OmniFocusのパースペクティブ一覧を取得して表示する
 * 出力形式：ID\t名前
 */
const listPerspectivesMain = (): string => {
  const getDefaultName = (id: string): string | null => {
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
  };

  const app = Application('OmniFocus') as OmniFocusApplication;
  app.includeStandardAdditions = true;
  const doc = app.defaultDocument;
  const perspectives = doc.perspectives();
  const lines: string[] = [];

  perspectives.forEach((p: OmniFocusPerspective) => {
    try {
      const id = p.id();
      let name = "";
      
      try {
        name = p.name();
      } catch {
        const defaultName = getDefaultName(id);
        if (defaultName) name = defaultName;
      }
      
      if (name && name !== "") {
        lines.push(`${id}\t${name}`);
      }
    } catch {
    }
  });

  return lines.join("\n");
};

listPerspectivesMain();
