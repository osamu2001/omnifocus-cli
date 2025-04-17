// JXA環境のグローバル変数の型定義
declare const ObjC: {
  import: (name: string) => void;
  unwrap: <T>(obj: any) => T;
};

// JXA環境の$変数
declare const $: {
  NSProcessInfo: {
    processInfo: {
      arguments: {
        count: number;
        objectAtIndex: (index: number) => any;
      };
    };
  };
  [key: string]: any;
};

// OmniFocusのタスク型定義
interface OmniFocusTask {
  id(): string;
  name(): string;
  note(): string;
  completed(): boolean;
  flagged(): boolean;
  deferDate(): Date | null;
  dueDate(): Date | null;
  creationDate(): Date;
  modificationDate(): Date;
  completionDate(): Date | null;
  estimatedMinutes(): number | null;
  repetitionRule(): any;
  containingTask(): OmniFocusTask | null;
  containingProject(): OmniFocusProject | null;
  tags(): OmniFocusTag[];
  tasks(): OmniFocusTask[];
}

// OmniFocusのプロジェクト型定義
interface OmniFocusProject {
  id(): string;
  name(): string;
  note(): string;
  completed(): boolean;
  flagged(): boolean;
  creationDate(): Date;
  modificationDate(): Date;
  tags(): OmniFocusTag[];
  dueDate(): Date | null;
  effectivePriority(): number | null;
  parent(): OmniFocusProject | null;
  projects(): OmniFocusProject[];
  flattenedTasks(): OmniFocusTask[];
  status(): string;
  folder(): OmniFocusFolder | null;
}

// OmniFocusのタグ型定義
interface OmniFocusTag {
  id(): string;
  name(): string;
}

// OmniFocusのフォルダ型定義
interface OmniFocusFolder {
  id(): string;
  name(): string;
  container(): OmniFocusFolder | null;
  class(): string;
}

// OmniFocusのパースペクティブ型定義
interface OmniFocusPerspective {
  id(): string;
  name(): string;
}

// OmniFocusのドキュメント型定義
interface OmniFocusDocument {
  flattenedTasks(): OmniFocusTask[];
  flattenedProjects(): OmniFocusProject[];
  perspectives(): OmniFocusPerspective[];
}

// OmniFocusアプリケーション型定義
interface OmniFocusApplication {
  includeStandardAdditions: boolean;
  defaultDocument: OmniFocusDocument;
}

// Applicationのグローバル関数
declare function Application(name: 'OmniFocus'): OmniFocusApplication;
declare function Application(name: string): any;
