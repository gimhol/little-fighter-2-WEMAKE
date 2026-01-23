# 构建与运行

[中文](./README.MD) | [English](./README.EN.MD)

不太旧的node.js应该都可以运行本项目，我曾用以下node.js运行:

- v22.16.0
- v24.10.0

## 构建数据

``` bash
npm run build:tool
npm run build:data
```

本步骤将会根据lf2原数据生成lf2:wemake的数据

- 一些必须的转换工具
  - [ffmpeg](https://ffmpeg.org/download.html): 用于音频文件转格式
  - [magick](https://imagemagick.org/script/download.php): 用于图片文件转格式

构建数据成功后，你可以在public目录下出现五个新文件
- data.zip
- data.zip.json
- prel.zip
- prel.zip.json
- lfw.full.zip (仅是自定义游戏的游戏包示例，正常游戏不会用到)

## 初始化

``` bash
npm i
```

## 运行

``` bash
npm run dev
```
