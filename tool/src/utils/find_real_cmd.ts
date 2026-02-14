import command_exists from "command-exists";
import { R_OK } from "constants";
import { accessSync } from "fs";
import { dirname, join } from "path";

const exact_map = new Map<string, string>()
const lax_map = new Map<string, string>()

export function find_real_cmd(cmd: string, exact = false): string {
  const map = exact ? exact_map : lax_map;
  const real_cmd = map.get(cmd);
  if (real_cmd !== void 0) return real_cmd;

  // 找下是否存在命令。
  if (command_exists.sync(cmd)) {
    map.set(cmd, cmd);
    return cmd
  }

  const trys = [
    // cwd下找文件。
    cmd,
  ]
  if (!exact) {
    // exe目录下找。 
    trys.push(join(dirname(process.execPath), cmd))
  }

  while (1) {
    let current = trys.shift();
    if (!current) break;
    try {
      accessSync(current, R_OK);
      map.set(cmd, current);
      return current;
    } catch (e) { }
  }

  map.set(cmd, '');
  return '';
}