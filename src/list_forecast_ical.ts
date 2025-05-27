#!/usr/bin/osascript -l JavaScript

// TypeScriptでJXA用の型を利用
ObjC.import('stdlib');

/**
 * OmniFocusのForecast（予測）ビューで表示されるタスク情報をiCalendar(ics)形式で出力する
 * 出力形式: 標準iCalendar（.ics）
 */
const listForecastIcalMain = (): string => {
  try {
    const app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    const doc = app.defaultDocument;
    const today = new Date();
    const tasks = doc.flattenedTasks();
    const events: string[] = [];

    // iCalendarヘッダー
    events.push('BEGIN:VCALENDAR');
    events.push('VERSION:2.0');
    events.push('PRODID:-//omnifocus-cli//Forecast//EN');

    for (const task of tasks) {
      if (task.completed()) continue;
      let taskDate = null;
      let dateType = '';
      if (task.dueDate()) {
        taskDate = task.dueDate();
        dateType = '期日';
      } else if (task.deferDate()) {
        taskDate = task.deferDate();
        dateType = '開始日';
      }
      if (!taskDate) continue;
      const taskDay = new Date(taskDate);
      const daysDiff = Math.floor((taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < -1 || daysDiff > 7) continue;

      // iCalendarの日時形式（UTC, "YYYYMMDDTHHMMSSZ"）
      const pad = (n: number) => String(n).padStart(2, '0');
      const toICalDate = (d: Date) => {
        return (
          d.getUTCFullYear() +
          pad(d.getUTCMonth() + 1) +
          pad(d.getUTCDate()) + 'T' +
          pad(d.getUTCHours()) +
          pad(d.getUTCMinutes()) +
          pad(d.getUTCSeconds()) + 'Z'
        );
      };
      const dtstamp = toICalDate(new Date());
      const dtstart = toICalDate(taskDay);
      const uid = `${task.id()}@omnifocus-cli`;
      const summary = task.name().replace(/\n/g, ' ');
      const description = dateType;
      events.push('BEGIN:VEVENT');
      events.push(`UID:${uid}`);
      events.push(`DTSTAMP:${dtstamp}`);
      events.push(`DTSTART:${dtstart}`);
      events.push(`SUMMARY:${summary}`);
      events.push(`DESCRIPTION:${description}`);
      events.push('END:VEVENT');
    }
    events.push('END:VCALENDAR');
    return events.join('\n');
  } catch (e) {
    console.log(`Error: ${e instanceof Error ? e.message : String(e)}`);
    return '';
  }
};

listForecastIcalMain();
