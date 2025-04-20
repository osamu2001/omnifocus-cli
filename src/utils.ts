#!/usr/bin/osascript -l JavaScript

/// <reference path="./types/omnifocus.d.ts" />
/// <reference path="./types/jxa.d.ts" />

/**
 * 安全にオブジェクトのメソッドを呼び出す
 * @param obj 対象オブジェクト
 * @param methodName メソッド名
 * @param defaultValue メソッド呼び出しに失敗した場合のデフォルト値
 * @returns メソッドの戻り値またはデフォルト値
 */
export const safeCall = <T>(obj: any, methodName: string, defaultValue: T = null as unknown as T): T => {
  try {
    if (obj && typeof obj[methodName] === 'function') {
      return obj[methodName]();
    }
  } catch (e) {
    console.log(`${methodName}()メソッド呼び出し中にエラー: ${e}`);
  }
  return defaultValue;
};

export const formatDate = (date: Date | null): string | null => {
  if (!date) return null;
  
  try {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  } catch (e) {
    console.log(`日付のフォーマット中にエラー: ${e}`);
    return null;
  }
};

export const hasMethod = (obj: any, methodName: string): boolean => {
  return obj && typeof obj[methodName] === 'function';
};
