export const get_short_file_size_txt = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  bytes /= 1024;
  if (bytes < 1024) return `${bytes.toFixed(1).replace(".0", "")}KB`;
  bytes /= 1024;
  if (bytes < 1024) return `${bytes.toFixed(1).replace(".0", "")}MB`;
  bytes /= 1024;
  return `${bytes.toFixed(1).replace(".0", "")}GB`;
};
