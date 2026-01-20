# 自定义游戏

[中文](README.MD) | [English](README.EN.MD)  

本质上来说，LF2:Wemake实际上是一个动作游戏框架，它能“播放”游戏包的UI与内容，
这个框架兼容了LF2逻辑。

LF2:Wemake还粗略的实现了一个大致能用UI框架。

但目前还没支持对应的编辑器……

## “自定义游戏包”

“自定义游戏包”本质是个 Zip 压缩包，这个 Zip 内部包含了（两个以上）多个 zip 文件与一个 index.json 文件

- index.json 内是一个路径字符串数组，指向“自定义游戏包”内的各个 Zip
- 首个Zip为 “prel.zip” （预加载数据）
- 其他Zip均为 “data.zip” （游戏数据）

举个例子：

将LF2:Wemake的数据打包成“自定义游戏包” full.zip，内部目录结构可以是这样的：

``` plaintext
full.zip
  ├── data.zip
  ├── index.json
  └── prel.zip
```

然后 index.json 的内容

``` json
[
  "prel.zip",
  "data.zip"
]
```

## 为什么“自定义游戏包”要区分“prel.zip”与“data.zip”

LF2:Wemake设计为一个能在现代浏览器运行的网页游戏。

以非自定义游戏为例，LF2:Wemake 会在启动页显示后立刻加载 “prel.zip”

在“启动页”后，会进入“入口页”，在此点击“开始游戏”后，才会加载“data.zip”

所以这个机制会很重要，原因如下：

所以“prel.zip”一般包含全部的UI页面以及相关的资源（声音图片等），
为了让玩家尽快看到游戏内界面，这个包的体积应该尽量小。

为保持相同的逻辑，“自定义游戏包”也必须包含一个 “prel.zip” 与至少一个“data.zip”
