// filepath: /Users/osamu/ghq/github.com/osamu2001/omnifocus-cli/src/types/jxa.d.ts
// JXA（JavaScript for Automation）環境の基本型定義
// このファイルはmacOS上でJavaScriptを使用して自動化する際の基本的な型を定義しています
// omnifocus.d.tsはこのファイルで定義された基本型を前提としています

// JXA環境のグローバル変数の型定義
declare const ObjC: {
  /**
   * Framework/Libraryをインポートする
   * @param name インポートするFramework/Libraryの名前
   */
  import: (name: string) => void;
  
  /**
   * ObjectiveC/NSのオブジェクトをJavaScriptの値に変換する
   * @param obj 変換するオブジェクト
   * @returns JavaScriptのネイティブ値
   */
  unwrap: <T>(obj: any) => T;
  
  /**
   * JavaScriptの値をObjectiveC/NSのオブジェクトに変換する
   * @param obj 変換するJavaScriptの値
   * @returns ObjectiveC/NSオブジェクト
   */
  bridge: <T>(obj: any) => T;
  
  /**
   * ObjectiveC/NSのクラスを取得する
   * @param className クラス名
   * @returns クラスオブジェクト
   */
  cast: <T>(obj: any, className: string) => T;
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
  NSString: {
    alloc: {
      initWithString: (str: string) => any;
    };
    /**
     * UTF8文字列からNSStringオブジェクトを作成
     * @param str UTF8文字列
     * @returns NSStringオブジェクト
     */
    stringWithUTF8String: (str: string) => {
      dataUsingEncoding: (encoding: number) => any;
    };
  };
  NSURL: {
    URLWithString: (str: string) => any;
    fileURLWithPath: (path: string) => any;
  };
  NSDate: any;
  NSFileManager: {
    defaultManager: {
      contentsOfDirectoryAtPath_error: (path: string, error: any) => any;
      createDirectoryAtPath_withIntermediateDirectories_attributes_error: (path: string, createIntermediates: boolean, attrs: any, error: any) => boolean;
    }
  };
  NSArray: any;
  NSDictionary: any;
  
  /**
   * ファイルハンドルオブジェクト関連のメソッド
   */
  NSFileHandle: {
    fileHandleWithStandardOutput: {
      writeData: (data: any) => void;
    };
    fileHandleWithStandardError: {
      writeData: (data: any) => void;
    };
    fileHandleWithStandardInput: {
      readDataToEndOfFile: () => any;
      availableData: () => any;
    };
  };
  
  /**
   * NSStringエンコーディング定数
   * 4は標準的なUTF8エンコーディングを表す
   */
  NSUTF8StringEncoding: number;

  /**
   * プロセスを終了する
   * @param exitCode 終了コード（0は正常終了、非0は異常終了）
   */
  exit: (exitCode: number) => never;
};

// 標準追加機能のインターフェース
interface StandardAdditions {
  displayDialog: (text: string, params?: DialogParams) => DialogResult;
  displayAlert: (text: string, params?: AlertParams) => AlertResult;
  chooseFile: (params?: FileParams) => string;
  chooseFolder: (params?: FolderParams) => string;
  setClipboard: (text: string) => void;
  clipboard: () => string;
}

// ダイアログのパラメータ
interface DialogParams {
  withTitle?: string;
  defaultAnswer?: string;
  buttons?: string[];
  defaultButton?: string | number;
  cancelButton?: string | number;
  withIcon?: any;
  givingUpAfter?: number;
}

// ダイアログの結果
interface DialogResult {
  buttonReturned: string;
  textReturned?: string;
}

// アラートのパラメータ
interface AlertParams {
  as?: string;
  buttons?: string[];
  defaultButton?: string | number;
  cancelButton?: string | number;
  givingUpAfter?: number;
}

// アラートの結果
interface AlertResult {
  buttonReturned: string;
}

// ファイル選択のパラメータ
interface FileParams {
  withPrompt?: string;
  ofType?: string[];
  defaultLocation?: string;
  invisibles?: boolean;
  multipleSelectionsAllowed?: boolean;
  showingPackageContents?: boolean;
}

// フォルダ選択のパラメータ
interface FolderParams {
  withPrompt?: string;
  defaultLocation?: string;
  invisibles?: boolean;
  multipleSelectionsAllowed?: boolean;
  showingPackageContents?: boolean;
}

// Applicationのグローバル関数
declare function Application(name: string): any;
declare function Application<T>(name: string): T & StandardAdditions;

// Application関数の型を拡張
// 注: これはOmniFocusアプリケーションに特化した型定義を含んでいます
// 将来的には各アプリケーション固有の型定義はそれぞれのd.tsファイルに移動すべきかもしれません
interface ApplicationFunction {
  (name: 'OmniFocus'): OmniFocusApplication;
  (name: string): any;
}

// Application関連のインターフェース
interface Application {
  /**
   * アプリケーションが終了するまで待機する
   */
  wait(): void;
  
  /**
   * アプリケーションをアクティブにする
   */
  activate(): void;
  
  /**
   * アプリケーションの情報を取得
   */
  name(): string;
  version(): string;
  frontmost(): boolean;
  
  // StandardAdditionsを含める設定
  // 注: OmniFocusアプリケーションインターフェースにも同じプロパティが定義されていますが、
  // これはJXA環境の一般的な機能であり、各アプリケーションで共通して使用されます
  includeStandardAdditions: boolean;
}

// JXA特有の関数
declare function delay(seconds: number): void;
declare function Path(path: string): string;

// OmniFocus特有の型定義
// 注: これらの型定義は本来omnifocus.d.tsに属するかもしれませんが、
// 現在のコードベースでは両方のファイル間に相互依存関係があります
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
