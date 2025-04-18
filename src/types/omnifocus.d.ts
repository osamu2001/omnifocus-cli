// OmniFocus APIの型定義

declare interface OmniFocusApplication {
  includeStandardAdditions: boolean;
  defaultDocument: OmniFocusDocument;
}

declare interface OmniFocusDocument {
  inboxTasks(): OmniFocusTask[];
  folders(): OmniFocusFolder[];
  flattenedFolders(): OmniFocusFolder[];
  flattenedTasks(): OmniFocusTask[];
  flattenedProjects(): OmniFocusProject[];
  flattenedTags(): OmniFocusTag[];
  perspectives(): OmniFocusPerspective[];
}

declare interface OmniFocusFolder {
  id(): string;
  name(): string;
  folders(): OmniFocusFolder[];
  projects(): OmniFocusProject[];
}

declare interface OmniFocusProject {
  id(): string;
  name(): string;
  completed(): boolean;
  folder(): OmniFocusFolder | null;
  tasks(): OmniFocusTask[];
  status(): string;
  effectiveStatus(): string;
}

declare interface OmniFocusTask {
  id(): string;
  name(): string;
  completed(): boolean;
  flagged(): boolean;
  dueDate(): Date | null;
  deferDate(): Date | null;
  completionDate(): Date | null;
  modificationDate(): Date;
  creationDate(): Date;
  note(): string;
  tags(): OmniFocusTag[];
  project(): OmniFocusProject | null;
  containingProject(): OmniFocusProject | null;
  parent(): OmniFocusTask | null;
  children(): OmniFocusTask[];
  effectiveDueDate(): Date | null;
  effectiveDeferDate(): Date | null;
}

declare interface OmniFocusTag {
  id(): string;
  name(): string;
  tasks(): OmniFocusTask[];
  children(): OmniFocusTag[];
  parent(): OmniFocusTag | null;
}

declare interface OmniFocusPerspective {
  id(): string;
  name(): string;
}

// Application関数の型を拡張
interface ApplicationFunction {
  (name: 'OmniFocus'): OmniFocusApplication;
  (name: string): any;
}

// グローバルのApplication関数の型を上書き
declare const Application: ApplicationFunction;
