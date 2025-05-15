#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのForecast（予測）ビューで表示されるタスク情報を取得する
 * 出力形式: 日付\tバッジカウント\t空かどうか
 */
const listForecastDaysMain = (): string => {
  try {
    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    
    // アプリケーションをアクティブ化
    app.activate();
    
    // Forecastビューを開く
    const windows = app.windows();
    if (windows.length === 0) {
      return getForecastTasksByDate();
    }
    
    const docWindow = windows[0];
    // @ts-ignore - OmniFocusの型定義に完全に合わせるのが難しいため無視
    docWindow.selectedSidebarTab = "forecast tab";
    
    // サイドバーからForecast情報を取得
    const sidebar = docWindow.sidebar();
    
    if (sidebar && typeof sidebar.forecastDays === "function") {
      const forecastDays = sidebar.forecastDays();
      const result: string[] = [];
      
      // 各日付の情報を取得
      for (const day of forecastDays) {
        const name = day.name();
        const badgeCount = day.badgeCount();
        const isEmpty = day.empty();
        
        result.push(`${name}\t${badgeCount}\t${isEmpty ? 'true' : 'false'}`);
      }
      
      return result.join("\n");
    } else {
      // Forecast情報を取得できない場合は、前のスクリプトと同様の方法で情報を表示
      return getForecastTasksByDate();
    }
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    // エラーが発生した場合は、代替手段で情報を表示
    return getForecastTasksByDate();
  }
};

/**
 * 別の方法でForecast情報を収集する
 * dueDate または deferDateを使ってタスクをフィルタリング
 */
const getForecastTasksByDate = (): string => {
  const app = Application('OmniFocus') as OmniFocusApplication;
  app.includeStandardAdditions = true;
  const doc = app.defaultDocument;
  
  // 現在の日付から7日間の範囲でタスクを取得
  const today = new Date();
  const result: string[] = [];
  
  // 今日から7日間の日付を生成
  const dateMap: { [dateStr: string]: { tasks: number, isEmpty: boolean } } = {};
  
  for (let i = -1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 曜日を取得
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = dayNames[date.getDay()];
    
    // 日付の表示形式を整える (YYYY-MM-DD -> MM/DD (曜))
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let displayName = '';
    
    if (i === -1) {
      displayName = '延期';
    } else if (i === 0) {
      displayName = '今日';
    } else if (i === 1) {
      displayName = '明日';
    } else {
      displayName = `${month}/${day} (${dayOfWeek})`;
    }
    
    dateMap[dateStr] = { 
      tasks: 0, 
      isEmpty: true,
      displayName: displayName
    };
  }
  
  // flattenedTasksを使って、すべてのタスクを取得
  const tasks = doc.flattenedTasks();
  
  // タスクをフィルタリングして、日付ごとにカウント
  for (const task of tasks) {
    if (task.completed()) continue;
    
    let taskDate = null;
    
    // 期日が設定されているタスクを取得
    if (task.dueDate()) {
      taskDate = task.dueDate();
    } 
    // 開始日が設定されているタスクを取得
    else if (task.deferDate()) {
      taskDate = task.deferDate();
    }
    
    // 日付が設定されていないタスクはスキップ
    if (!taskDate) continue;
    
    // 日付が今日から7日以内かチェック
    const taskDay = new Date(taskDate);
    const daysDiff = Math.floor((taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // 日付をYYYY-MM-DD形式に変換
    const dateStr = taskDay.toISOString().split('T')[0];
    
    // 対象の日付範囲内かチェック
    if (dateMap[dateStr]) {
      dateMap[dateStr].tasks++;
      dateMap[dateStr].isEmpty = false;
    } else if (daysDiff < -1) {
      // 延期タスク（昨日以前のタスク）
      dateMap[Object.keys(dateMap)[0]].tasks++;
      dateMap[Object.keys(dateMap)[0]].isEmpty = false;
    }
  }
  
  // 日付順に表示
  for (const dateStr of Object.keys(dateMap)) {
    const { tasks, isEmpty, displayName } = dateMap[dateStr];
    result.push(`${displayName}\t${tasks}\t${isEmpty}`);
  }
  
  return result.join("\n");
};

listForecastDaysMain();
