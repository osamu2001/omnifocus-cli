/**
 * コマンドライン引数を取得します
 */
export function getCommandLineArguments(): string[] {
  const args: string[] = [];
  if (typeof $.NSProcessInfo !== "undefined") {
    const nsArgs = $.NSProcessInfo.processInfo.arguments;
    for (let i = 0; i < nsArgs.count; i++) {
      args.push(ObjC.unwrap<string>(nsArgs.objectAtIndex(i)));
    }
    return args.slice(2);
  }
  return args;
}
