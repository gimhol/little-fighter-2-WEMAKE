# Building and Running

[中文](./README.MD) | [English](./README.EN.MD)

This project should be able to run on node.js versions that are not too old. I have run this project with the following node.js versions:

- v22.16.0
- v24.10.0

## Dependency Installation

`npm i`

## Data Building

`npm run build_data`

This step will generate lf2:wemake data based on the original lf2 data.

- Some necessary conversion tools
  - [ffmpeg](https://ffmpeg.org/download.html): Used for converting audio file formats.
  - [magick](https://imagemagick.org/script/download.php): Used for converting image file formats.

## Running

`npm run start`
