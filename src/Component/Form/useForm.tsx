import { useRef } from "react";
import { Form } from "./Form";
import { FormInstance } from "./FormInstance";

export function useForm<T extends object>(init?: Partial<T>) {
  const ref_form = useRef<FormInstance<T> | undefined>(void 0);
  if (!ref_form.current) ref_form.current = new FormInstance<T>(init);
  return [ref_form.current, Form as Form<T>] as const;
}
