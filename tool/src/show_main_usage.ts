const text = `
lf2w-tool <command> -c "./conf.json"

Example: lf2w-tool main -c "./conf.json"

About "conf.json", see Usage "lf2w-tool print-conf"

Usage:

lf2w-tool help          Print out 'help' information.

lf2w-tool print-conf    Print out the template of the "conf file". 
                        You can copy it into your "conf file", 
                        then edit it and use it.
                        
lf2w-tool main          Just like 'lf2w-tool make-data' + 
                                  'lf2w-tool make-prel' + 
                                  'lf2w-tool zip-full'

lf2w-tool make-data     Convert the 'LF2 dir' to 'LF2W dir',
                        then zip 'LF2W dir' into 'data.zip',
                        and this will generate a 'data.zip.json' too.

lf2w-tool make-prel     Zip 'prel dir' into 'prel.zip', 
                        and this will generate a 'prel.zip.json' too.

lf2w-tool zip-full      Zip 'data.zip' and 'prel.zip' 
                        with an index.json into 'full.zip'.


lf2w-tool dat-2-txt     Parse .dat file into .txt file.
`.trim()
export function show_main_usage() {
  console.log(text)
}
