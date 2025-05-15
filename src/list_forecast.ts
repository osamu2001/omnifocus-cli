#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのForecast（予測）ビューで表示されるタスク情報を表示する
 * 出力形式: タスクID\t日付\tタスク名
 */
const listForecastMain = (): string => {
  try {
    const app = Application('OmniFocus') as OmniFocusApplication;
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    
    // 現在の日付から7日間の範囲でタスクを取得
    const today = new Date();
    const result: string[] = [];
    
    // flattenedTasksを使って、すべてのタスクを取得
    const tasks = doc.flattenedTasks();
    
    // タスクをフィルタリングして、日付で整理
    const dateTasks: { [date: string]: any[] } = {};
    
    for (const task of tasks) {
      if (task.completed()) continue;
      
      let taskDate = null;
      let dateType = '';
      
      // 期日が設定されているタスクを取得
      if (task.dueDate()) {
        taskDate = task.dueDate();
        dateType = '期日';
      } 
      // 開始日が設定されているタスクを取得
      else if (task.deferDate()) {
        taskDate = task.deferDate();
        dateType = '開始日';
      }
      
      // 日付が設定されていないタスクはスキップ
      if (!taskDate) continue;
      
      // 日付が今日から7日以内かチェック
      const taskDay = new Date(taskDate);
      const daysDiff = Math.floor((taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // 7日以内のタスクのみ対象とする (-1は昨日のタスク、これも含める)
      if (daysDiff < -1 || daysDiff > 7) continue;
      
      // 日付をYYYY-MM-DD形式に変換
      const dateStr = taskDay.toISOString().split('T')[0];
      
      // 日付ごとにタスクを整理
      if (!dateTasks[dateStr]) {
        dateTasks[dateStr] = [];
      }
      
      dateTasks[dateStr].push({
        id: task.id(),
        name: task.name(),
        dateType: dateType,
        date: taskDate
      });
    }
    
    // 日付順に並べ替えて出力
    const sortedDates = Object.keys(dateTasks).sort();
    
    for (const dateStr of sortedDates) {
      const tasksForDate = dateTasks[dateStr];
      // 日付の表示形式を整える (YYYY-MM-DD -> YYYY/MM/DD)
      const formattedDate = dateStr.replace(/-/g, '/');
      
      for (const task of tasksForDate) {
        // タスクID、日付、タスク種別、タスク名を出力
        result.push(`${task.id}\t${formattedDate}\t${task.dateType}\t${task.name}`);
      }
    }
    
    return result.join("\n");
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    return "";
  }
};

listForecastMain();
