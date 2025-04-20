#!/usr/bin/osascript -l JavaScript
"use strict";
/// <reference path="./types/omnifocus.d.ts" />
/// <reference path="./types/jxa.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMethod = exports.formatDate = exports.safeCall = void 0;
/**
 * 安全にオブジェクトのメソッドを呼び出す
 * @param obj 対象オブジェクト
 * @param methodName メソッド名
 * @param defaultValue メソッド呼び出しに失敗した場合のデフォルト値
 * @returns メソッドの戻り値またはデフォルト値
 */
const safeCall = (obj, methodName, defaultValue = null) => {
    try {
        if (obj && typeof obj[methodName] === 'function') {
            return obj[methodName]();
        }
    }
    catch (e) {
        console.log(`${methodName}()メソッド呼び出し中にエラー: ${e}`);
    }
    return defaultValue;
};
exports.safeCall = safeCall;
const formatDate = (date) => {
    if (!date)
        return null;
    try {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    }
    catch (e) {
        console.log(`日付のフォーマット中にエラー: ${e}`);
        return null;
    }
};
exports.formatDate = formatDate;
const hasMethod = (obj, methodName) => {
    return obj && typeof obj[methodName] === 'function';
};
exports.hasMethod = hasMethod;
