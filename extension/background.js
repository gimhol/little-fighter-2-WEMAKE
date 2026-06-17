// 点击扩展图标 → 在新标签页打开游戏
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'index.html' });
});
