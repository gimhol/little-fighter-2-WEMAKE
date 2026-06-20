import { check_field, one_of } from "./check_field"

test("check_field: string, str_0: 'world'", () => {
  const key = 'str_0'
  const obj: { str_0?: string } = { [key]: 'world' }
  expect(check_field(obj, 'obj', key, 'string')).toBe(true)
  expect(check_field(obj, 'obj', key, ['string'])).toBe(true)
  expect(check_field(obj, 'obj', key, one_of('world'))).toBe(true)
  expect(check_field(obj, 'obj', key, ['string', 'number'])).toBe(true)
  expect(check_field(obj, 'obj', key, [one_of('world'), 'number'])).toBe(true)
  expect(check_field(obj, 'obj', key, 'number')).toBe(false)
  expect(check_field(obj, 'obj', key, 'bigint')).toBe(false)
  expect(check_field(obj, 'obj', key, 'boolean')).toBe(false)
  expect(check_field(obj, 'obj', key, 'function')).toBe(false)
  expect(check_field(obj, 'obj', key, 'object')).toBe(false)
  expect(check_field(obj, 'obj', key, 'symbol')).toBe(false)
  expect(check_field(obj, 'obj', key, 'undefined')).toBe(false)
  expect(check_field(obj, 'obj', key, ['number'])).toBe(false)
  expect(check_field(obj, 'obj', key, one_of('world2'))).toBe(false)
  expect(check_field(obj, 'obj', key, ['boolean', 'number'])).toBe(false)
  expect(check_field(obj, 'obj', key, [one_of('world2'), 'number'])).toBe(false)

  delete obj.str_0;
  expect(check_field(obj, 'obj', key, ['undefined', 'string'])).toBe(true)
  expect(check_field(obj, 'obj', key, [one_of('world'), 'undefined'])).toBe(true)
})

test("check_field: number, num_0: 111", () => {
  const key = 'num_0'
  const obj: { num_0?: number } = { [key]: 111 }
  expect(check_field(obj, 'obj', key, 'number')).toBe(true)
  expect(check_field(obj, 'obj', key, ['number'])).toBe(true)
  expect(check_field(obj, 'obj', key, ['number', 'string'])).toBe(true)
  expect(check_field(obj, 'obj', key, one_of(111))).toBe(true)
  expect(check_field(obj, 'obj', key, [one_of(111), 'string'])).toBe(true)
  expect(check_field(obj, 'obj', key, 'string')).toBe(false)
  expect(check_field(obj, 'obj', key, 'bigint')).toBe(false)
  expect(check_field(obj, 'obj', key, 'boolean')).toBe(false)
  expect(check_field(obj, 'obj', key, 'function')).toBe(false)
  expect(check_field(obj, 'obj', key, 'object')).toBe(false)
  expect(check_field(obj, 'obj', key, 'symbol')).toBe(false)
  expect(check_field(obj, 'obj', key, 'undefined')).toBe(false)
  expect(check_field(obj, 'obj', key, ['string'])).toBe(false)
  expect(check_field(obj, 'obj', key, ['boolean', 'string'])).toBe(false)
  expect(check_field(obj, 'obj', key, one_of(112))).toBe(false)
  expect(check_field(obj, 'obj', key, [one_of(112, 110), 'string'])).toBe(false)

  delete obj.num_0;
  expect(check_field(obj, 'obj', key, 'undefined')).toBe(true)
  expect(check_field(obj, 'obj', key, ['undefined', 'number'])).toBe(true)
  expect(check_field(obj, 'obj', key, ['undefined', one_of(111, 110)])).toBe(true)
})