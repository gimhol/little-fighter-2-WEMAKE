export function ctrl_a_bounding(e: React.KeyboardEvent, el?: Element | null | undefined) {
  if (!(e.ctrlKey || e.metaKey) || e.key?.toLowerCase() !== 'a')
    return;
  // eslint-disable-next-line no-debugger
  // debugger
  e.preventDefault();
  e.stopPropagation();
  
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  selection.removeAllRanges();


  if (!el) return
  range.selectNodeContents(el);
  selection.addRange(range);
}
