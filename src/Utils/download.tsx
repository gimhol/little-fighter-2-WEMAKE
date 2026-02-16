export const download = (url: string, name: string = url) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
};
