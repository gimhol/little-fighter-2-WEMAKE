import fs from "fs/promises";

export async function read_file(path: string | undefined, defaultValue: string = ''): Promise<string> {
  if (!path)
    return defaultValue;
  const buffer = await fs.readFile(path)
    .catch(() => defaultValue);
  return buffer.toString();
}
