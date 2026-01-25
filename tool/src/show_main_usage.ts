const text = `
lf2w-tool <command>

Usage:

lf2w-tool main
lf2w-tool help
lf2w-tool dat-2-txt
lf2w-tool make-data
lf2w-tool make-prel
lf2w-tool zip-full

`.trim()
export function show_main_usage() {
  console.log(text)
}
