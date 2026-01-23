# Building and Running

[中文](./README.MD) | [English](./README.EN.MD)

This project should be able to run on node.js versions that are not too old. I have run this project with the following node.js versions:

- v22.16.0
- v24.10.0

## Data Building

This step will generate the lf2:wemake data based on the original lf2 data.

Prepare some necessary conversion tools:
 - [ffmpeg](https://ffmpeg.org/download.html): Used to convert audio file formats.
 - [magick](https://imagemagick.org/script/download.php): Used to convert image file formats.

After installing ffmpeg and magick, make sure they can be executed in the command line. (Tip: You can add them to the environment variables.)

Execute the following commands:

``` bash
npm run build:tool
npm run build:data
```

After successfully building the data, five new files will appear in the public directory:
 - data.zip
 - data.zip.json
 - prel.zip
 - prel.zip.json
 - lfw.full.zip (This is just an example of the game package for custom games and is not used in normal games.)

## init

``` bash
npm i
```

## Running

``` bash
npm run dev
```
