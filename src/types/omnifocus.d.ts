// filepath: /Users/osamu/ghq/github.com/osamu2001/omnifocus-cli/src/types/omnifocus.d.ts
// OmniFocus APIの型定義
// このファイルはOmniFocusアプリケーション特有のAPI型定義を含んでいます
// jxa.d.tsで定義されている基本型を前提としており、両方のファイルは相互に関連しています

/**
 * OmniFocusアプリケーションを表すインターフェース
 * jxa.d.tsで定義されているApplicationインターフェースを継承し、
 * OmniFocus特有の機能を追加しています
 * 
 * 使用例:
 * ```typescript
 * // OmniFocusアプリケーションを取得
 * const app = Application('OmniFocus') as OmniFocusApplication;
 * app.includeStandardAdditions = true;
 * 
 * // アプリケーション情報を表示
 * console.log(`OmniFocus バージョン: ${app.version()}`);
 * console.log(`デフォルトドキュメント: ${app.defaultDocument ? 'あり' : 'なし'}`);
 * ```
 */
declare interface OmniFocusApplication extends Application {
  /** 
   * デフォルトのドキュメント
   * 通常のOmniFocus操作のための主要なアクセスポイント
   */
  defaultDocument: OmniFocusDocument;
  
  /** 
   * アプリケーションのバージョンを取得
   * @returns バージョン文字列（例: '4.0.1'）
   */
  version(): string;
  
  /** 
   * すべてのウィンドウを取得
   * @returns OmniFocusウィンドウの配列
   */
  windows(): OmniFocusWindow[];
  
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
 * OmniFocus内のドキュメント（データベース）を操作するためのメソッドとプロパティへのアクセスを提供します
 * 
 * 使用例:
 * ```typescript
 * // ドキュメントを取得して情報を表示
 * const doc = app.defaultDocument;
 * console.log(`インボックスタスク数: ${doc.inboxTasks().length}`);
 * console.log(`すべてのタスク数: ${doc.flattenedTasks().length}`);
 * 
 * // 新しいタスクを作成
 * const newTask = doc.makeTask({name: "新しいタスク", flagged: true});
 * console.log(`タスクID: ${newTask.id()}`);
 * ```
 */
declare interface OmniFocusDocument {
  /**
   * インボックスタスクを取得または追加します
   */
  inboxTasks: {
    /**
     * インボックスタスクを取得します
     * @returns インボックス内のタスクの配列
     */
    (): TaskCollection;
    
    /**
     * インボックスにタスクを追加します
     * @param task 追加するタスク
     */
    push(task: OmniFocusTask): void;
  };
  
  /**
   * すべてのフォルダを取得します（最上位レベルのみ）
   * @returns フォルダの配列
   */
  folders(): FolderCollection;
  
  /**
   * すべてのフォルダとサブフォルダを取得します（フラット化）
   * @returns すべてのフォルダの配列
   */
  flattenedFolders(): FolderCollection;
  
  /**
   * すべてのタスクを取得します（フラット化）
   * @returns すべてのタスクの配列
   */
  flattenedTasks(): TaskCollection;
  
  /**
   * すべてのプロジェクトを取得します（フラット化）
   * @returns すべてのプロジェクトの配列
   */
  flattenedProjects(): ProjectCollection;
  
  /**
   * すべてのタグを取得します（フラット化）
   * @returns すべてのタグの配列
   */
  flattenedTags(): TagCollection;
  
  /**
   * すべてのパースペクティブを取得します
   * @returns パースペクティブの配列
   */
  perspectives(): OmniFocusPerspective[];
  
  /**
   * すべてのプロジェクトを取得または追加します（最上位レベルのみ）
   */
  projects: {
    /**
     * すべてのプロジェクトを取得します（最上位レベルのみ）
     * @returns プロジェクトの配列
     */
    (): ProjectCollection;
    
    /**
     * プロジェクトを追加します
     * @param project 追加するプロジェクト
     */
    push(project: OmniFocusProject): void;
  };
  
  /**
   * 新しいタスクを作成します
   * @param properties タスクのプロパティ
   * @returns 作成されたタスク
   */
  makeTask(properties: TaskProperties): OmniFocusTask;
  
  /**
   * 新しいプロジェクトを作成します
   * @param properties プロジェクトのプロパティ
   * @returns 作成されたプロジェクト
   */
  makeProject(properties: ProjectProperties): OmniFocusProject;
  
  /**
   * 新しいフォルダを作成します
   * @param properties フォルダのプロパティ
   * @returns 作成されたフォルダ
   */
  makeFolder(properties: FolderProperties): OmniFocusFolder;
  
  /**
   * 新しいタグを作成します
   * @param properties タグのプロパティ
   * @returns 作成されたタグ
   */
  makeTag(properties: TagProperties): OmniFocusTag;
  
  /**
   * 指定した文字列で検索を行います
   * @param search 検索文字列
   * @returns 検索結果のタスク
   */
  search(search: string): TaskCollection;
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
 * OmniFocus内のフォルダを操作するためのメソッドとプロパティへのアクセスを提供します
 * 
 * 使用例:
 * ```typescript
 * // フォルダを取得して情報を表示
 * const folder = app.defaultDocument.folders()[0];
 * console.log(`フォルダ名: ${folder.name()}`);
 * console.log(`サブフォルダ数: ${folder.folders().length}`);
 * console.log(`プロジェクト数: ${folder.projects().length}`);
 * 
 * // フォルダ内のプロジェクトを一覧表示
 * folder.projects().forEach(project => {
 *   console.log(` - ${project.name()}`);
 * });
 * ```
 */
declare interface OmniFocusFolder extends HasIdentifier, HasNotes {
  /**
   * フォルダのサブフォルダを取得します
   * @returns サブフォルダの配列
   */
  folders(): FolderCollection;
  
  /**
   * フォルダ内のプロジェクトを取得します
   * @returns フォルダ内のプロジェクトの配列
   */
  projects(): ProjectCollection;
  
  /**
   * フォルダの親フォルダを取得します
   * @returns 親フォルダ（最上位フォルダの場合はnull）
   */
  container(): OmniFocusFolder | null;
  
  /**
   * フォルダのクラス名を取得します
   * @returns クラス名
   */
  class(): string;
}

/**
 * OmniFocusプロジェクトを表すインターフェース
 * OmniFocus内のプロジェクトを操作するためのメソッドとプロパティへのアクセスを提供します
 * 
 * 使用例:
 * ```typescript
 * // プロジェクトを取得して情報を表示
 * const project = app.defaultDocument.flattenedProjects()[0];
 * console.log(`プロジェクト名: ${project.name()}`);
 * console.log(`ステータス: ${project.status()}`);
 * console.log(`タスク数: ${project.tasks().length}`);
 * 
 * // プロジェクト内のタスクを取得
 * const tasks = project.tasks();
 * tasks.forEach(task => console.log(` - ${task.name()}`));
 * ```
 */
declare interface OmniFocusProject extends HasIdentifier, HasNotes, HasDates, HasTags, HasFlag, Completable {
  /**
   * プロジェクトが含まれるフォルダを取得します
   * @returns プロジェクトのフォルダ（設定されていない場合はnull）
   */
  folder(): OmniFocusFolder | null;
  
  /**
   * プロジェクトのタスクを取得または追加します
   * @returns プロジェクト内のタスクの配列
   */
  tasks: {
    (): OmniFocusTask[];
    /**
     * プロジェクトに新しいタスクを追加します
     * @param task 追加するタスク
     */
    push(task: OmniFocusTask): void;
  };
  
  /**
   * プロジェクト内のすべてのタスク（子タスク含む）を取得します
   * @returns プロジェクト内のすべてのタスクの配列
   */
  flattenedTasks?(): OmniFocusTask[];
  
  /**
   * プロジェクトのステータスを取得します
   * @returns プロジェクトのステータス（'active'|'onHold'|'completed'|'dropped'）
   */
  status(): 'active' | 'onHold' | 'completed' | 'dropped';
  
  /**
   * プロジェクトの有効なステータスを取得します
   * 親要素の状態なども考慮した実際の有効なステータスを返します
   * @returns プロジェクトの有効なステータス
   */
  effectiveStatus(): 'active' | 'onHold' | 'completed' | 'dropped';
  
  /**
   * プロジェクトの繰り返しルールを取得します
   * @returns 繰り返しルール（設定されていない場合はnull）
   */
  repetitionRule(): RepetitionRule | null;
}

/**
 * OmniFocusタスクを表すインターフェース
 * OmniFocus内のタスク（To-Do項目）を操作するためのメソッドとプロパティへのアクセスを提供します
 * 
 * 使用例:
 * ```typescript
 * // タスクを取得して情報を表示
 * const task = app.defaultDocument.flattenedTasks()[0];
 * console.log(`タスク名: ${task.name()}`);
 * console.log(`期限: ${task.dueDate() ? task.dueDate().toLocaleDateString() : '未設定'}`);
 * 
 * // タスクにフラグを付ける
 * task.markFlagged(true);
 * ```
 */
declare interface OmniFocusTask extends HasIdentifier, HasNotes, HasDates, HasTags, HasFlag, Completable {
  // 基本プロパティはすでに共通インターフェースで定義されているため削除
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
 * OmniFocus内のタグを操作するためのメソッドとプロパティへのアクセスを提供します
 * 
 * 使用例:
 * ```typescript
 * // タグを取得して情報を表示
 * const tag = app.defaultDocument.flattenedTags()[0];
 * console.log(`タグ名: ${tag.name()}`);
 * console.log(`関連タスク数: ${tag.tasks().length}`);
 * 
 * // タグの階層構造を表示
 * const childTags = tag.children();
 * childTags.forEach(child => {
 *   console.log(` - ${child.name()}`);
 * });
 * ```
 */
declare interface OmniFocusTag extends HasIdentifier, HasNotes, Hierarchical<OmniFocusTag> {
  /**
   * タグに関連付けられたタスクを取得します
   * @returns タグが付いたタスクの配列
   */
  tasks(): TaskCollection;
  
  /**
   * タグの状態を取得します
   * @returns タグの状態（'active'または'dropped'）
   */
  status(): 'active' | 'dropped';
  
  /**
   * タグに関連付けられたプロジェクトを取得します
   * @returns タグが付いたプロジェクトの配列
   */
  projects(): ProjectCollection;
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
 * OmniFocusウィンドウを表すインターフェース
 * OmniFocusアプリケーションのウィンドウを操作するためのメソッドとプロパティへのアクセスを提供します
 */
declare interface OmniFocusWindow {
  /**
   * ウィンドウの名前を取得します
   * @returns ウィンドウ名
   */
  name(): string;
  
  /**
   * ウィンドウのサイズを取得します
   * @returns ウィンドウサイズ（{width: number, height: number}形式）
   */
  bounds(): { width: number; height: number; x: number; y: number; };
  
  /**
   * ウィンドウが閉じられたかどうかを取得します
   * @returns 閉じられている場合はtrue
   */
  closed(): boolean;
  
  /**
   * ウィンドウが最小化されているかどうかを取得します
   * @returns 最小化されている場合はtrue
   */
  miniaturized(): boolean;
  
  /**
   * ウィンドウを閉じます
   */
  close(): void;
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
