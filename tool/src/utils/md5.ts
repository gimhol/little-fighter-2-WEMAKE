import { createHash } from "crypto";

export function md5(
  text: string,
  salt: string = "",
): string {
  return createHash("md5").update(text).update(salt).digest().toString("hex");
}
