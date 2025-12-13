interface IResult {
  id: string;
  name: string;
  args: string[];
  enabled: boolean;
}
export function parse_call_func_expression(text: string): IResult | null {
  const result = text.match(/(<.*>)?(!?)(.*)\((.*)\)/);
  if (!result) return null;
  const [, id = '', first, name, args] = result.map(v => v?.trim());
  if (!name) return null;
  if (!args) {
    return {
      id: id.substring(1, id.length - 1),
      name,
      args: [],
      enabled: first !== '!'
    }
  }
  return {
    id: id.substring(1, id.length - 1),
    name,
    args: args.split(",").map(v => v.trim()),
    enabled: first !== '!',
  }
}
