import { PromiseInOne } from "promise-in-one/dist/es/pio";
import { Ditto } from "../ditto";

const pio = new PromiseInOne(([type, args]: [string, any]) => type + Ditto.MD5(JSON.stringify(args)));
export function PIO(originalMethod: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name);
  console.log(originalMethod, context)
  function replacementMethod(this: any, ...args: any[]) {
    const name = this.constructor.name + "." + methodName.toString() + ".";
    return new Promise<any>((resolve, reject) => {
      const [pid, existed] = pio.check([name, args], resolve, reject);
      if (existed) { console.log('hit!'); return; }
      const real_promise = originalMethod.apply(this, args);
      pio.handle(pid, real_promise);
    });
  }
  return replacementMethod
}