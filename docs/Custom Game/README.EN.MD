# Custom Game

[中文](README.MD) | [English](README.EN.MD)

Essentially, LF2:Wemake is actually an action game framework. 

It can "play" the UI and content of the game package, and this framework is compatible with the LF2 logic.

LF2:Wemake has also roughly implemented a somewhat usable UI framework.

However, the corresponding editor is not supported yet...

## Custom Game Package

Essentially, the "custom game package" is a Zip archive. Inside this Zip, there are multiple (more than two) zip files and one index.json file.

- The content of index.json is a string array of paths, pointing to each Zip file within the "custom game package".
- The first Zip file is "prel.zip" (pre-loaded data).
- The other Zip files are all "data.zip" (game data).

For example:

Pack the data of LF2:Wemake into a "custom game package" named full.zip. The internal directory structure of full.zip can be like this:

``` plaintext
full.zip
  ├── data.zip
  ├── index.json
  └── prel.zip
```

And the content of index.json is:

``` json
[
  "prel.zip",
  "data.zip"
]
```

## Why do we need "prel.zip" and "data.zip"?

LF2:Wemake is designed as a web game that can run on modern browsers.

Taking a non-custom game as an example, LF2:Wemake will load "prel.zip" immediately after the launch page is displayed.

After the "launch page", it will enter the "entry page". Only after clicking "Start Game" on this page will it load "data.zip".

So this mechanism is very important for the following reasons:

Therefore, "prel.zip" generally contains all the UI pages and related resources (such as sounds and images).

To allow players to see the in-game interface as soon as possible, the size of this package should be as small as possible.

To maintain the same logic, the "custom game package" must also contain one "prel.zip" and at least one "data.zip".
