import { Expression } from "./Expression";

const expression_result_pairs: [1 | 0, string, any][] = [
  [0, "!(1==1)&&!(1!=1)", false],
  [0, "(1==1)&1==2", false],
  [0, "(1==1)&1==1", true],
  [0, "(1==1)&(1==2)", false],
  [0, "(1==1)&(1==1)", true],
  [0, "1==1&1==2", false],
  [0, "1==1&(((1==1)&1==1)|(1==1&1==1))|1==1", true],
  [0, "1==1&(((1==1)&1==1)|(1==1&1==1))|1==2", true],
  [0, "1==1&(((1==1)&1==1)|(1==1&1==1))&1==2", false],
  [0, "1==0", false],
  [0, "1==1", true],
  [0, "1==2", false],
  [0, "1!=0", true],
  [0, "1!=1", false],
  [0, "1!=2", true],
  [0, "1>=0", true],
  [0, "1>=1", true],
  [0, "1>=2", false],
  [0, "1<=0", false],
  [0, "1<=1", true],
  [0, "1<=2", true],
  [0, "1<0", false],
  [0, "1<1", false],
  [0, "1<2", true],
  [0, "1>0", true],
  [0, "1>1", false],
  [0, "1>2", false],
  [0, "1==0", false],
  [0, "1==1", true],
  [0, "1==2", false],
  [0, "1{{1", true],
  [0, "1}}1", true],
  [0, "1,2{{1", true],
  [0, "1}}1,2", true],
  [0, "1,2{{3", false],
  [0, "3}}1,2", false],
];
for (const [ig, str, result] of expression_result_pairs) {
  if (ig) continue;
  test(`expression ${str} should be ${result}`, () => {
    const exp = new Expression(str, () => (_, a, op) => {
      switch (op) {
        case "{{":
          return a.split(",");
        case "}}":
          return a.split(",");
        case "!{":
          return a.split(",");
        case "!}":
          return a.split(",");
      }
      return a;
    });
    expect(exp.run(void 0)).toBe(result);
  });
}

test(`expression case`, () => {
  const exp = new Expression<any>("v==0", (ww) => (input, word, op) => {
    console.log(ww)
    expect(input).toBe('input');
    expect(op).toBe('==');
    if (word === 'v') return '0'
    return word
  })
  const result = exp.run("input")
  expect(result).toBe(true)
})

test(`expression case`, () => {
  const exp = new Expression<any>("a==0&&b==1", (ww) => (input, word, op) => word)
  exp.children[0].before
  expect(exp.children[0].before).toBe('')
  expect(exp.children[0].text).toBe('a==0')
  expect(exp.children[1].before).toBe('&')
  expect(exp.children[1].text).toBe('b==1')
})