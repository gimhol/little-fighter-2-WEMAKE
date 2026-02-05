import { basename } from "path";
export let whoami = "lf2w-tool";
const [argv0, argv1] = process.argv;
if (argv0 === 'bun') whoami = basename(argv1)

const text = `
\x1B[36m[Guidance on Drag-and-Generate]\x1B[0m

Usage 1:

You can drag a similar LF2 directory to ${whoami}, 
Some intermediate directories and files will be generated.
Then a 'conf.json5' and a './public/data.zip' file will be automatically generated.

Usage 1:
You can drag a 'conf.json5' to ${whoami},
It will read the configuration from the 'conf.json5'.
And generate 'data.zip', 'prel.zip' and 'full.zip' for you
(Depending on whether the configuration is complete).

\x1B[36m[Guidance on Command-line]\x1B[0m

Example: ${whoami} main
         ${whoami} help

\x1B[36m[More Usage]\x1B[0m

${whoami} version       Print out version.
${whoami} help          Print out 'help' information.

${whoami} print-conf    Print out the template of the "conf file". 
                        You can copy it into your "conf file", 
                        then edit it and use it.
                        
${whoami} main          Just like '${whoami} make-data' + 
                                  '${whoami} make-prel' + 
                                  '${whoami} zip-full'

${whoami} make-data     Convert the 'LF2 dir' to 'LF2W dir',
                        then zip 'LF2W dir' into 'data.zip',
                        and this will generate a 'data.zip.json' too.

${whoami} make-prel     Zip 'prel dir' into 'prel.zip', 
                        and this will generate a 'prel.zip.json' too.

${whoami} zip-full      Zip 'data.zip' and 'prel.zip' 
                        with an index.json into 'full.zip'.


${whoami} dat-2-txt     Parse .dat file into .txt file.
`.trim()

export function show_main_usage() {
  console.log(text)
}
