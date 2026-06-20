export const read_func_args = (
  str: string,
  func_name: string,
  min_arg_count: number = -1,
): string[] | null => {
  const reg = new RegExp(func_name + "\\((.*)\\)");
  const result = str.match(reg);
  if (!result) return null;
  const [, args_str] = result;
  const args = args_str!.split(",");
  if (min_arg_count >= 0 && min_arg_count > args.length) return null;
  return args;
};
