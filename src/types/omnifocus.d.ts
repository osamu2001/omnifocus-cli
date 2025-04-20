// filepath: /Users/osamu/ghq/github.com/osamu2001/omnifocus-cli/src/types/omnifocus.d.ts
// OmniFocus APIの型定義
// このファイルはOmniFocusアプリケーション特有のAPI型定義を含んでいます
// jxa.d.tsで定義されている基本型を前提としており、両方のファイルは相互に関連しています

/**
 * OmniFocusアプリケーションを表すインターフェース
 * jxa.d.tsで定義されているApplicationインターフェースを継承し、
 * OmniFocus特有の機能を追加しています
 */
declare interface OmniFocusApplication extends Application {
  /** デフォルトのドキュメント */
  defaultDocument: OmniFocusDocument;
  /** アプリケーションのバージョンを取得 */
  version(): string;
  /** すべてのウィンドウを取得 */
  windows(): any[];
  
  /**
   * 新しいタスクオブジェクトを作成する
   * @param properties タスクのプロパティ
   * @returns 作成されたタスクオブジェクト
   */
  Task(properties: { name: string, [key: string]: any }): OmniFocusTask;

  /**
   * 新しいインボックスタスクオブジェクトを作成する
   * @param properties タスクのプロパティ
   * @returns 作成されたインボックスタスクオブジェクト
   */
  InboxTask(properties: { name: string, [key: string]: any }): OmniFocusTask;

  /**
   * 新しいプロジェクトオブジェクトを作成する
   * @param properties プロジェクトのプロパティ
   * @returns 作成されたプロジェクトオブジェクト
   */
  Project(properties: { name: string, [key: string]: any }): OmniFocusProject;
}

/**
 * OmniFocusドキュメントを表すインターフェース
 */
declare interface OmniFocusDocument {
  /** インボックスタスクを取得 */
  inboxTasks: {
    (): OmniFocusTask[];
    push(task: OmniFocusTask): void;
  };
  /** すべてのフォルダを取得 */
  folders(): OmniFocusFolder[];
  /** すべてのフォルダとサブフォルダを取得 */
  flattenedFolders(): OmniFocusFolder[];
  /** すべてのタスクを取得 */
  flattenedTasks(): OmniFocusTask[];
  /** すべてのプロジェクトを取得 */
  flattenedProjects(): OmniFocusProject[];
  /** すべてのタグを取得 */
  flattenedTags(): OmniFocusTag[];
  /** すべてのパースペクティブを取得 */
  perspectives(): OmniFocusPerspective[];
  /** すべてのプロジェクトを取得（非フラット化） */
  projects: {
    (): OmniFocusProject[];
    push(project: OmniFocusProject): void;
  };
  
  /**
   * 新しいタスクを作成する
   * @param properties タスクのプロパティ
   * @returns 作成されたタスク
   */
  makeTask(properties: TaskProperties): OmniFocusTask;
  
  /**
   * 新しいプロジェクトを作成する
   * @param properties プロジェクトのプロパティ
   * @returns 作成されたプロジェクト
   */
  makeProject(properties: ProjectProperties): OmniFocusProject;
  
  /**
   * 新しいフォルダを作成する
   * @param properties フォルダのプロパティ
   * @returns 作成されたフォルダ
   */
  makeFolder(properties: FolderProperties): OmniFocusFolder;
  
  /**
   * 新しいタグを作成する
   * @param properties タグのプロパティ
   * @returns 作成されたタグ
   */
  makeTag(properties: TagProperties): OmniFocusTag;
  
  /**
   * 指定した文字列で検索を行う
   * @param search 検索文字列
   * @returns 検索結果のタスク
   */
  search(search: string): OmniFocusTask[];
}

/**
 * タスクの状態を表す列挙型
 */
declare enum TaskStatus {
  Active = 'active',
  Completed = 'completed',
  Dropped = 'dropped'
}

/**
 * プロジェクトの状態を表す列挙型
 */
declare enum ProjectStatus {
  Active = 'active',
  OnHold = 'onHold',
  Completed = 'completed',
  Dropped = 'dropped'
}

/**
 * 繰り返しルールを表すインターフェース
 */
declare interface RepetitionRule {
  /** 繰り返しの種類（固定か浮動か） */
  repetitionMethod(): 'fixed' | 'floating';
  /** 繰り返しの間隔 */
  repetitionInterval(): number;
  /** 繰り返しの単位（日、週、月、年） */
  repetitionUnit(): 'day' | 'week' | 'month' | 'year';
}

/**
 * タスク作成プロパティ
 */
declare interface TaskProperties {
  name?: string;
  note?: string;
  dueDate?: Date;
  deferDate?: Date;
  flagged?: boolean;
  estimatedMinutes?: number;
  completionDate?: Date;
  tags?: OmniFocusTag[];
  project?: OmniFocusProject;
  parent?: OmniFocusTask;
}

/**
 * プロジェクト作成プロパティ
 */
declare interface ProjectProperties {
  name?: string;
  note?: string;
  dueDate?: Date;
  deferDate?: Date;
  flagged?: boolean;
  status?: ProjectStatus | string;
  completionDate?: Date;
  folder?: OmniFocusFolder;
  tags?: OmniFocusTag[];
}

/**
 * フォルダ作成プロパティ
 */
declare interface FolderProperties {
  name?: string;
  container?: OmniFocusFolder;
}

/**
 * タグ作成プロパティ
 */
declare interface TagProperties {
  name?: string;
  parent?: OmniFocusTag;
}

/**
 * OmniFocusフォルダを表すインターフェース
 */
declare interface OmniFocusFolder {
  /** フォルダのIDを取得 */
  id(): string;
  /** フォルダの名前を取得 */
  name(): string;
  /** フォルダのサブフォルダを取得 */
  folders(): OmniFocusFolder[];
  /** フォルダ内のプロジェクトを取得 */
  projects(): OmniFocusProject[];
  /** フォルダの親フォルダを取得 */
  container(): OmniFocusFolder | null;
  /** フォルダのクラスを取得 */
  class(): string;
  /** フォルダの説明を取得 */
  note(): string;
  /** フォルダの作成日を取得 */
  creationDate(): Date;
  /** フォルダの変更日を取得 */
  modificationDate(): Date;
}

/**
 * OmniFocusプロジェクトを表すインターフェース
 */
declare interface OmniFocusProject {
  /** プロジェクトのIDを取得 */
  id(): string;
  /** プロジェクトの名前を取得 */
  name(): string;
  /** プロジェクトが完了しているかどうかを取得 */
  completed(): boolean;
  /** プロジェクトのフォルダを取得 */
  folder(): OmniFocusFolder | null;
  /** プロジェクトのタスクを取得 */
  tasks: {
    (): OmniFocusTask[];
    push(task: OmniFocusTask): void;
  };
  /** プロジェクト内のすべてのタスク（子タスク含む）を取得 */
  flattenedTasks?(): OmniFocusTask[];
  /** プロジェクトのステータスを取得 */
  status(): string;
  /** プロジェクトの有効なステータスを取得 */
  effectiveStatus(): string;
  /** プロジェクトの説明を取得 */
  note(): string;
  /** プロジェクトにフラグが付いているかどうかを取得 */
  flagged(): boolean;
  /** プロジェクトの開始日を取得 */
  deferDate(): Date | null;
  /** プロジェクトの期限を取得 */
  dueDate(): Date | null;
  /** プロジェクトの繰り返しルールを取得 */
  repetitionRule(): RepetitionRule | null;
  /** プロジェクトの作成日を取得 */
  creationDate(): Date;
  /** プロジェクトの変更日を取得 */
  modificationDate(): Date;
  /** プロジェクトの完了日を取得 */
  completionDate(): Date | null;
  /** プロジェクトに添付されているタグを取得 */
  tags(): OmniFocusTag[];
}

/**
 * OmniFocusタスクを表すインターフェース
 */
declare interface OmniFocusTask {
  /** タスクのIDを取得 */
  id(): string;
  /** タスクの名前を取得 */
  name(): string;
  /** タスクが完了しているかどうかを取得 */
  completed(): boolean;
  /** タスクにフラグが付いているかどうかを取得 */
  flagged(): boolean;
  /** タスクの期限を取得 */
  dueDate(): Date | null;
  /** タスクの開始日を取得 */
  deferDate(): Date | null;
  /** タスクの完了日を取得 */
  completionDate(): Date | null;
  /** タスクの変更日を取得 */
  modificationDate(): Date;
  /** タスクの作成日を取得 */
  creationDate(): Date;
  /** タスクの説明を取得 */
  note(): string;
  /** タスクに添付されているタグを取得 */
  tags(): OmniFocusTag[];
  /** タスクが属するプロジェクトを取得 */
  project(): OmniFocusProject | null;
  /** タスクが含まれるプロジェクトを取得 */
  containingProject(): OmniFocusProject | null;
  /** タスクの親タスクを取得 */
  parent(): OmniFocusTask | null;
  /** タスクの子タスクを取得 */
  children(): OmniFocusTask[];
  /** 親タスクを取得（containingTaskとして使用） */
  containingTask(): OmniFocusTask | null;
  /** 子タスクを取得（tasksとして使用） */
  tasks: {
    (): OmniFocusTask[];
    push(task: OmniFocusTask): void;
  };
  /** タスクの有効な期限を取得 */
  effectiveDueDate(): Date | null;
  /** タスクの有効な開始日を取得 */
  effectiveDeferDate(): Date | null;
  /** タスクの予定時間（分）を取得 */
  estimatedMinutes(): number | null;
  /** タスクの繰り返しルールを取得 */
  repetitionRule(): RepetitionRule | null;
  /** タスクがブロックされているかを取得 */
  blocked(): boolean;
  /** タスクが次のアクションかどうかを取得 */
  isNextAction(): boolean;
  /** タスクの完了状態を設定 */
  markComplete(flag: boolean): void;
  /** タスクにフラグを設定 */
  markFlagged(flag: boolean): void;
  /** タスクがブロックされているかどうかを取得 */
  blocked(): boolean;
}

/**
 * OmniFocusタグを表すインターフェース
 */
declare interface OmniFocusTag {
  /** タグのIDを取得 */
  id(): string;
  /** タグの名前を取得 */
  name(): string;
  /** タグに関連付けられたタスクを取得 */
  tasks(): OmniFocusTask[];
  /** タグの子タグを取得 */
  children(): OmniFocusTag[];
  /** タグの親タグを取得 */
  parent(): OmniFocusTag | null;
  /** タグの状態（アクティブか非アクティブか）を取得 */
  status(): 'active' | 'dropped';
  /** タグに関連付けられたプロジェクトを取得 */
  projects(): OmniFocusProject[];
  /** タグの説明を取得 */
  note(): string;
}

/**
 * OmniFocusパースペクティブを表すインターフェース
 */
declare interface OmniFocusPerspective {
  /** パースペクティブのIDを取得 */
  id(): string;
  /** パースペクティブの名前を取得 */
  name(): string;
}

/**
 * タスク情報を格納するインターフェース
 * 主にAPI呼び出し結果や出力用
 */
declare interface TaskInfo {
  id?: string;
  name?: string;
  note?: string;
  completed?: boolean;
  flagged?: boolean;
  deferDate?: Date | null;
  dueDate?: Date | null;
  creationDate?: Date | null;
  modificationDate?: Date | null;
  completionDate?: Date | null;
  estimatedMinutes?: number | null;
  repetitionRule?: any;
  containingTask?: string | null;
  containingProject?: {id: string; name: string} | null;
  tags?: Array<{id: string; name: string}>;
  subtasks?: Array<{id: string; name: string}>;
}

/**
 * プロジェクト情報を格納するインターフェース
 * 主にAPI呼び出し結果や出力用
 */
declare interface ProjectInfo {
  id?: string;
  name?: string;
  note?: string;
  completed?: boolean;
  flagged?: boolean;
  status?: string;
  folder?: {id: string; name: string; path: string} | null;
  tasks?: Array<{id: string; name: string}>;
  deferDate?: Date | null;
  dueDate?: Date | null;
  creationDate?: Date | null;
  modificationDate?: Date | null;
  completionDate?: Date | null;
  tags?: Array<{id: string; name: string}>;
}

/**
 * 型ガード: オブジェクトがOmniFocusTaskかどうかを判定する
 * @param obj 判定対象のオブジェクト
 * @returns OmniFocusTaskの場合true
 */
declare function isOmniFocusTask(obj: any): obj is OmniFocusTask;

/**
 * 型ガード: オブジェクトがOmniFocusProjectかどうかを判定する
 * @param obj 判定対象のオブジェクト
 * @returns OmniFocusProjectの場合true
 */
declare function isOmniFocusProject(obj: any): obj is OmniFocusProject;

/**
 * 型ガード: オブジェクトがOmniFocusFolderかどうかを判定する
 * @param obj 判定対象のオブジェクト
 * @returns OmniFocusFolderの場合true
 */
declare function isOmniFocusFolder(obj: any): obj is OmniFocusFolder;

/**
 * 型ガード: オブジェクトがOmniFocusTagかどうかを判定する
 * @param obj 判定対象のオブジェクト
 * @returns OmniFocusTagの場合true
 */
declare function isOmniFocusTag(obj: any): obj is OmniFocusTag;

/**
 * OmniFocus名前空間 - OmniFocus特有のユーティリティ型定義
 * 注: この名前空間はjxa.d.tsから移動してきました
 */
declare namespace OmniFocus {
  // Quick Entry関連
  interface QuickEntryPanel {
    /**
     * Quick Entryパネルが表示されているかどうか
     */
    visible: boolean;
    
    /**
     * Quick Entryパネルを開く
     */
    open(): void;
    
    /**
     * Quick Entryパネルを保存する
     */
    save(): void;
    
    /**
     * Quick Entryパネルを閉じる
     */
    close(): void;
  }
  
  // タスク状態変更コマンド
  interface TaskStatusCommands {
    /**
     * タスクやプロジェクトを完了としてマークする
     * @param tasks 対象のタスクやプロジェクト
     */
    markComplete(tasks: any): void;
    
    /**
     * タスクやプロジェクトを未完了としてマークする
     * @param tasks 対象のタスクやプロジェクト
     */
    markIncomplete(tasks: any): void;
    
    /**
     * タスクやプロジェクトを破棄としてマークする
     * @param tasks 対象のタスクやプロジェクト
     */
    markDropped(tasks: any): void;
  }
  
  // ドキュメント操作コマンド
  interface DocumentCommands {
    /**
     * ドキュメントを同期する
     */
    synchronize(): void;
    
    /**
     * ドキュメントをアーカイブする
     * @param destination アーカイブ先のファイルパス
     * @param compression 圧縮するかどうか（デフォルト: true）
     * @param summaries サマリーを含めるかどうか（デフォルト: false）
     */
    archive(destination: string, compression?: boolean, summaries?: boolean): void;
    
    /**
     * 完了タスクを隠し、インボックスアイテムを処理する
     */
    compact(): void;
    
    /**
     * 最後のコマンドを元に戻す
     */
    undo(): void;
    
    /**
     * 元に戻したコマンドをやり直す
     */
    redo(): void;
  }
}
