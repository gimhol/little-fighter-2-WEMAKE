# Little Fighter 2: WEMAKE

For English, see [README.en.md](README.en.md)  

直接开试 [https://lf.gim.ink/](https://lf.gim.ink/)

玩法、美术、音效音乐来自"Litter Fighter 2", 原作：Marti Wong，Starsky Wong.

## 如何运行本项目?

不太旧的node.js应该都可以运行本项目，我曾用以下node.js运行:

- v22.16.0
- v24.10.0

### 1.依赖安装 `npm i`

### 2.构建数据 `npm run build_data`

本步骤将会根据lf2原数据生成lf2:wemake的数据

- 一些必须的转换工具
  - [ffmpeg](https://ffmpeg.org/download.html): 用于音频文件转格式
  - [magick](https://imagemagick.org/script/download.php): 用于图片文件转格式

### 3.运行 `npm run start`
