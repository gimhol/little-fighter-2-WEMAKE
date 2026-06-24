import type { ISchema } from "../LFW/defines/ISchema";
import { SchemaValidator } from "../LFW/utils/schema/validate_schema";

function v(value: any, schema: ISchema) {
  const validator = new SchemaValidator();
  return validator.validate(value, schema);
}

test("SchemaValidator: string, str_0: 'world'", () => {
  const schema: ISchema = {
    key: 'test',
    type: 'object',
    properties: { str_0: { type: 'string' } },
  };
  expect(v({ str_0: 'world' }, schema)).toBe(true);

  // nullable
  const schema_n: ISchema = {
    key: 'test',
    type: 'object',
    properties: { str_0: { type: 'string', nullable: true } },
  };
  expect(v({}, schema_n)).toBe(true);
});

test("SchemaValidator: number, num_0: 111", () => {
  const schema: ISchema = {
    key: 'test',
    type: 'object',
    properties: { num_0: { type: 'number' } },
  };
  expect(v({ num_0: 111 }, schema)).toBe(true);

  // wrong type
  expect(v({ num_0: 'hello' }, schema)).toBe(false);

  // nullable
  const schema_n: ISchema = {
    key: 'test',
    type: 'object',
    properties: { num_0: { type: 'number', nullable: true } },
  };
  expect(v({}, schema_n)).toBe(true);
});

test("SchemaValidator: oneof", () => {
  const schema: ISchema = {
    key: 'test',
    type: 'object',
    properties: { val: { type: 'number', oneof: [0, 1] } },
  };
  expect(v({ val: 0 }, schema)).toBe(true);
  expect(v({ val: 1 }, schema)).toBe(true);
  expect(v({ val: 2 }, schema)).toBe(false);
});

test("SchemaValidator: warnings for unexpected keys", () => {
  const schema: ISchema = {
    key: 'test',
    type: 'object',
    properties: { a: { type: 'string' } },
  };
  const validator = new SchemaValidator();
  validator.validate({ a: 'ok', b: 123 }, schema);
  expect(validator.warnings.length).toBeGreaterThan(0);
  expect(validator.warnings.some(w => w.includes('b'))).toBe(true);
});