export function check_is_str_ok(...list: [string, any][]) {
  for (const [name, ele] of list)
    if (typeof ele !== "string") throw new Error(`未设置${name}`);
}
