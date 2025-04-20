// filepath: /Users/osamu/ghq/github.com/osamu2001/omnifocus-cli/src/types/common.d.ts
// common.d.ts - OmniFocus CLIの共通型定義
// このファイルはOmniFocus CLI全体で使用される共通型を定義します
// 複数のインターフェースで共有されるプロパティやメソッドを抽出しています

/**
 * 識別可能なオブジェクトのための基本インターフェース
 * ID、名前、作成日、変更日などの基本プロパティを持つオブジェクトに実装されます
 * 
 * 使用例:
 * ```typescript
 * const item: HasIdentifier = app.defaultDocument.flattenedTasks()[0];
 * console.log(`Name: ${item.name()}, ID: ${item.id()}`);
 * ```
 */
interface HasIdentifier {
  /** 
   * オブジェクトの一意識別子を取得します
   * @returns ID文字列
   */
  id(): string;
  
  /** 
   * オブジェクトの名前を取得します
   * @returns 名前
   */
  name(): string;
  
  /** 
   * オブジェクトの作成日時を取得します
   * @returns 作成日時
   */
  creationDate(): Date;
  
  /** 
   * オブジェクトの最終更新日時を取得します
   * @returns 最終更新日時
   */
  modificationDate(): Date;
}

/**
 * 説明（ノート）を持つオブジェクトのインターフェース
 * 
 * 使用例:
 * ```typescript
 * const hasNotes: HasNotes = app.defaultDocument.flattenedProjects()[0];
 * console.log(`Notes: ${hasNotes.note()}`);
 * ```
 */
interface HasNotes {
  /** 
   * オブジェクトの説明（ノート）を取得します
   * @returns ノート内容
   */
  note(): string;
}

/**
 * 期日と開始日を持つオブジェクトのインターフェース
 * タスクやプロジェクトなど、期日と開始日を設定できるオブジェクトに実装されます
 * 
 * 使用例:
 * ```typescript
 * const hasDates: HasDates = app.defaultDocument.flattenedTasks()[0];
 * const dueDate = hasDates.dueDate();
 * console.log(`Due: ${dueDate ? dueDate.toLocaleDateString() : 'None'}`);
 * ```
 */
interface HasDates {
  /** 
   * オブジェクトの期日を取得します
   * @returns 期日（設定されていない場合はnull）
   */
  dueDate(): Date | null;
  
  /** 
   * オブジェクトの開始日を取得します
   * @returns 開始日（設定されていない場合はnull）
   */
  deferDate(): Date | null;
  
  /** 
   * オブジェクトの完了日を取得します
   * @returns 完了日（未完了または設定されていない場合はnull）
   */
  completionDate(): Date | null;
}

/**
 * タグを持つオブジェクトのインターフェース
 * タスクやプロジェクトなど、タグを添付できるオブジェクトに実装されます
 * 
 * 使用例:
 * ```typescript
 * const hasTaggable: HasTags = app.defaultDocument.flattenedTasks()[0];
 * const tags = hasTaggable.tags();
 * console.log(`Tags: ${tags.map(t => t.name()).join(', ')}`);
 * ```
 */
interface HasTags {
  /** 
   * オブジェクトに添付されたタグを取得します
   * @returns タグオブジェクトの配列
   */
  tags(): OmniFocusTag[];
}

/**
 * フラグを持つオブジェクトのインターフェース
 * タスクやプロジェクトなど、フラグを設定できるオブジェクトに実装されます
 * 
 * 使用例:
 * ```typescript
 * const flaggable: HasFlag = app.defaultDocument.flattenedTasks()[0];
 * console.log(`Flagged: ${flaggable.flagged()}`);
 * ```
 */
interface HasFlag {
  /** 
   * オブジェクトにフラグが設定されているかを取得します
   * @returns フラグが設定されている場合はtrue
   */
  flagged(): boolean;
}

/**
 * 階層構造を持つオブジェクトのための基本インターフェース
 * フォルダ、タグなど、親子関係を持つオブジェクトに実装されます
 * 
 * 使用例:
 * ```typescript
 * const hierarchical: Hierarchical<OmniFocusFolder> = app.defaultDocument.folders()[0];
 * const parent = hierarchical.parent();
 * console.log(`Parent: ${parent ? parent.name() : 'None'}`);
 * ```
 */
interface Hierarchical<T> {
  /** 
   * オブジェクトの親要素を取得します
   * @returns 親オブジェクト（存在しない場合はnull）
   */
  parent(): T | null;
  
  /** 
   * オブジェクトの子要素を取得します
   * @returns 子オブジェクトの配列
   */
  children(): T[];
}

/**
 * 完了状態を持つオブジェクトのインターフェース
 * タスクやプロジェクトなど、完了状態を持つオブジェクトに実装されます
 * 
 * 使用例:
 * ```typescript
 * const completable: Completable = app.defaultDocument.flattenedTasks()[0];
 * console.log(`Completed: ${completable.completed()}`);
 * ```
 */
interface Completable {
  /** 
   * オブジェクトが完了状態かどうかを取得します
   * @returns 完了している場合はtrue
   */
  completed(): boolean;
}

// ユーティリティ型定義
/**
 * オブジェクトを読み取り専用にする型
 */
type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

/**
 * タスクのコレクション型
 */
type TaskCollection = ReadonlyArray<OmniFocusTask>;

/**
 * プロジェクトのコレクション型
 */
type ProjectCollection = ReadonlyArray<OmniFocusProject>;

/**
 * フォルダのコレクション型
 */
type FolderCollection = ReadonlyArray<OmniFocusFolder>;

/**
 * タグのコレクション型
 */
type TagCollection = ReadonlyArray<OmniFocusTag>;
