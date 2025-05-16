#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのForecast（予測）ビューで表示されるタスク情報を詳細に表示する
 * 出力形式: タスクID\t日付\t種別\tプロジェクト\tタスク名
 */
const listForecastDetailedMain = (): string => {
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
      // OmniFocusの型定義にdroppedがないため、状態をチェックする代替方法
      try {
        // @ts-ignore
        if (typeof task.dropped === 'function' && task.dropped()) continue;
      } catch (e) {
        // droppedメソッドがない場合は無視
      }
      
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
      
      // プロジェクト情報を取得
      let projectName = "—";
      try {
        const containingProject = task.containingProject();
        if (containingProject) {
          projectName = containingProject.name();
        }
      } catch (e) {
        // プロジェクト情報が取得できない場合は無視
      }
      
      // フラグ情報を取得
      const flagged = task.flagged ? task.flagged() : false;
      const flagIndicator = flagged ? "⭐" : "";
      
      dateTasks[dateStr].push({
        id: task.id(),
        name: task.name(),
        dateType: dateType,
        date: taskDate,
        project: projectName,
        flagged: flagIndicator
      });
    }
    
    // 日付順に並べ替えて出力
    const sortedDates = Object.keys(dateTasks).sort();
    
    for (const dateStr of sortedDates) {
      const tasksForDate = dateTasks[dateStr];
      
      // 日付の曜日を取得
      const date = new Date(dateStr);
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayOfWeek = dayNames[date.getDay()];
      
      // 今日と明日の日付文字列
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // タスクをソート（フラグ付きを先に、次に日付タイプ、次にプロジェクト名、最後にタスク名）
      tasksForDate.sort((a, b) => {
        if (a.flagged && !b.flagged) return -1;
        if (!a.flagged && b.flagged) return 1;
        if (a.dateType < b.dateType) return -1;
        if (a.dateType > b.dateType) return 1;
        if (a.project < b.project) return -1;
        if (a.project > b.project) return 1;
        return a.name.localeCompare(b.name);
      });
      
      for (const task of tasksForDate) {
        // 日付と時間を「YYYY-MM-DD HH:MM」形式で整形
        const taskDate = new Date(task.date);
        const year = taskDate.getFullYear();
        const month = String(taskDate.getMonth() + 1).padStart(2, '0');
        const day = String(taskDate.getDate()).padStart(2, '0');
        const hours = String(taskDate.getHours()).padStart(2, '0');
        const minutes = String(taskDate.getMinutes()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        
        // タスクID、日付、タスク種別、プロジェクト名、フラグ、タスク名を出力
        result.push(`${task.id}\t${formattedDate}\t${task.dateType}\t${task.project}\t${task.flagged}${task.name}`);
      }
    }
    
    return result.join("\n");
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    return "";
  }
};

listForecastDetailedMain();
