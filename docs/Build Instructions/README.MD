# 构建与运行

[中文](./README.MD) | [English](./README.EN.MD)

不太旧的node.js应该都可以运行本项目，我曾用以下node.js运行:

- v22.16.0
- v24.10.0

## 依赖安装

`npm i`

## 构建数据

`npm run build_data`

本步骤将会根据lf2原数据生成lf2:wemake的数据

- 一些必须的转换工具
  - [ffmpeg](https://ffmpeg.org/download.html): 用于音频文件转格式
  - [magick](https://imagemagick.org/script/download.php): 用于图片文件转格式

## 运行

`npm run start`
