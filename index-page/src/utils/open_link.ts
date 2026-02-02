export function open_link(url: string | null | undefined) {
  if (!url) return;
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.click()
}