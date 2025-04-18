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

// JXA特有の関数
declare function delay(seconds: number): void;
declare function Path(path: string): string;
