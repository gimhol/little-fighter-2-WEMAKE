import fs from "fs/promises";

export const read_text_file = (path: string) =>
  fs
    .readFile(path)
    .then((v) => v.toString())
    .then((v) => v?.replace(/\r/g, ""))
