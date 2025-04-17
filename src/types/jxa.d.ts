// JXA環境のグローバル変数の型定義
declare const ObjC: {
  import: (name: string) => void;
  unwrap: <T>(obj: any) => T;
};

// JXA環境の$変数
declare const $: any;

// Applicationのグローバル関数
declare function Application(name: string): any;
