#!/usr/bin/osascript -l JavaScript
"use strict";
// TypeScriptでJXA用の型を利用
/**
 * OmniFocusのパースペクティブ一覧を取得して表示する
 * 出力形式：ID\t名前
 */
function listPerspectivesMain() {
    /**
     * パースペクティブIDからデフォルト名を取得します
     * @param id パースペクティブID
     * @returns デフォルト名、見つからない場合はnull
     */
    function getDefaultName(id) {
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
    const lines = [];
    // 各パースペクティブの情報を取得して整形
    perspectives.forEach((p) => {
        try {
            const id = p.id();
            let name = "";
            // 名前を取得（エラーが発生する可能性がある）
            try {
                name = p.name();
            }
            catch (_a) {
                // 名前が取得できない場合はデフォルト名を使用
                const defaultName = getDefaultName(id);
                if (defaultName)
                    name = defaultName;
            }
            // 名前が取得できた場合のみ出力に追加
            if (name && name !== "") {
                lines.push(`${id}\t${name}`);
            }
        }
        catch (_b) {
            // このパースペクティブはスキップ
        }
    });
    return lines.join("\n");
}
listPerspectivesMain();
