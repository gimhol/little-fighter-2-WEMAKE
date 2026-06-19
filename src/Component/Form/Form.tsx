import {
  createContext,
  type PropsWithChildren,
  type ReactElement
} from "react";
import { FormInstance } from "./FormInstance";
import { FormItem, type IFormItemProps } from "./FormItem";
import { useForm } from "./useForm";

export interface IFormProps<T extends object> extends PropsWithChildren {
  form?: FormInstance<T>;
  onChange?(changed: Partial<T>, allValues: T): void;
}

type FormContextType = IFormProps<object>;
export const FormContext = createContext<FormContextType>({
  form: undefined
});

export interface Form<T extends object> {
  (props: IFormProps<T>): ReactElement;
  Item(props: IFormItemProps<T>): ReactElement
}
export function Form<T extends object>(props: IFormProps<T>) {
  const { form, onChange } = props;
  const _onChange: typeof onChange = (a, b) => onChange?.(a, b)
  return (
    <FormContext.Provider value={{ form, onChange: _onChange }}>
      {props.children}
    </FormContext.Provider>
  );
}
Form.useForm = useForm;
Form.Item = FormItem;