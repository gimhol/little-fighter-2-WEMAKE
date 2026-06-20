const pwd = "SiuHungIsAGoodBearBecauseHeIsVeryGood";
const head_placeholder_length = 123;
function decode(buf: { [i in number]: number }, len: number) {
  for (let i = 0; i < len; ++i) buf[i] -= pwd.charCodeAt(i % pwd.length);
}
export default async function decode_lf2_dat(
  array_buffer: ArrayBuffer,
): Promise<string> {
  const buf = new Uint8Array(array_buffer);
  decode(buf, buf.byteLength);
  const char_code_arr = Array.from(buf);
  char_code_arr.splice(0, head_placeholder_length);
  return String.fromCharCode(...char_code_arr);
}
