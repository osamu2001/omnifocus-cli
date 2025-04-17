// JXA環境のグローバル変数の型定義
declare const ObjC: {
  import: (name: string) => void;
  unwrap: <T>(obj: any) => T;
};

// JXA環境の$変数
declare const $: any;

// Applicationのグローバル関数
declare function Application(name: string): ApplicationObject;

// OmniFocus固有の型定義
interface ApplicationObject {
  includeStandardAdditions: boolean;
  defaultDocument: DocumentObject;
  Project: (options: { name: string }) => ProjectObject;
  // 他のOmniFocus関連のメソッドとプロパティを追加可能
}

interface DocumentObject {
  projects: ProjectObject[];
  tasks: TaskObject[];
  tags: TagObject[];
  // 他のプロパティを追加可能
}

interface ProjectObject {
  id: string;
  name: string;
  tasks: TaskObject[];
  // 他のプロパティを追加可能
}

interface TaskObject {
  id: string;
  name: string;
  completed: boolean;
  // 他のプロパティを追加可能
}

interface TagObject {
  id: string;
  name: string;
  // 他のプロパティを追加可能
}

// consoleの型定義
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
};
