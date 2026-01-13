# Little Fighter 2: WEMAKE

![title](docs/image/readme.title.png)

[Chinese](README.md) | [English](README.en.md)  

try it at [https://lf.gim.ink/](https://lf.gim.ink/)

Think this project is pretty good? Consider starring it!

gameplays, arts, and sounds are all from "Litter Fighter 2" basically, created by Marti Wong and Starsky Wong in 1999.

"LF2:Wemake" created by Gim in 2024."

The original author, Marti Wong, has now launched "[Little Fighter 2 Remastered](https://lf2.net/)". Please purchase it on [Steam](https://store.steampowered.com/app/3249650) to support the original author.

## Multiplayer Online Game

- see ["Multiplayer Online Game"](./docs/Multiplayer%20Online%20Game.EN.MD)

## How to run

this project should be able to run on a Node.js version that isn't too old. I have run this project with the following Node.js versions:

- v22.16.0
- v24.10.0

### Installation

`npm i`

### Build data

`npm run build_data`

This step will generate lf2:wemake data based on the original lf2 data.

- require
  - [ffmpeg](https://ffmpeg.org/download.html): Used for audio file format conversion
  - [magick](https://imagemagick.org/script/download.php): Used for image file format conversion

### Run

`npm run start`
