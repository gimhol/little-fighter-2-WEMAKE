import { parse_call_func_expression } from "./parse_call_func_expression";

test(`parse_call_func_expression('func_name()')`, () => {
  const a = parse_call_func_expression('func_name()');
  expect(a?.name).toBe('func_name')
  expect(a?.args.length).toBe(0)
  expect(a?.enabled).toBe(true)
})

test(`parse_call_func_expression('func_name(hello, world)')`, () => {
  const a = parse_call_func_expression('func_name(hello, world)');
  expect(a?.name).toBe('func_name')
  expect(a?.args?.[0]).toBe('hello')
  expect(a?.args?.[1]).toBe('world')
  expect(a?.enabled).toBe(true)
})

test(`parse_call_func_expression('!func_name(hello, world)')`, () => {
  const a = parse_call_func_expression('!func_name(hello, world)');
  expect(a?.name).toBe('func_name')
  expect(a?.args?.[0]).toBe('hello')
  expect(a?.args?.[1]).toBe('world')
  expect(a?.enabled).toBe(false)
})
test(`parse_call_func_expression('<MY>!func_name(hello, world)')`, () => {
  const a = parse_call_func_expression('<MY>!func_name(hello, world)');
  expect(a?.id).toBe('MY')
  expect(a?.name).toBe('func_name')
  expect(a?.args?.[0]).toBe('hello')
  expect(a?.args?.[1]).toBe('world')
  expect(a?.enabled).toBe(false)
})