# Custom Game

[中文](README.MD) | [English](README.EN.MD)

LFW is designed to be a web game that can run on modern browsers. You gotta download all the core resources. After downloading, you need to unzip and process them.

Once they're downloaded, they'll be cached, so you don't have to process them again. But it still takes time to read and pre - process the resources.

Take the original LFW for example:

- Right after the "Launch Page" shows up, the game will start loading prel.zip right away.
- After prel.zip is loaded, you will enter the "Entry Page".
- In the "Entry Page", you have to click "Start Game" to start loading data.zip.

We do this to let players see something quicker.

Normally, prel.zip should include all the UI pages and related UI resources like sounds and pictures.
To see the in-game interface as soon as possible, this package should be as small as possible.

data.zip contains stuff like character, weapon, background, and stage data, along with related resources like sounds and pictures, so it's gonna be pretty big.

To keep the same logic, a "Custom Game Package" also has to have one prel.zip and at least one data.zip.

## By the way

Actually, you could stuff everything into prel.zip.
But then players would have to stare at the "Launch Page" for a really long time...

(There's actually one character, one stage, and one background in prel.zip. It's for my convenience during development.)

## How to Generate a Custom Game Package

TODO

## How to Use a Custom Game Package

TODO
