export const download = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = url;
  a.click();
};
