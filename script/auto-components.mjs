import fs from 'fs';
const a = `
export class A extends UIComponent{}
export class B extends UIComponent {}
export class C extends UIComponent\n{}
export class D <> extends UIComponent<>{}
`
const regexp1 = /export\s*class\s*(.*?)\s*extends\s*UIComponent[\s|<|\{]/g
const regexp2 = new RegExp(regexp1, '')
console.log(
  a.match(regexp1).map(v => v.match(regexp2).at(1).split('<').at(0).trim())
)

console.log(import.meta.url)
// TODO