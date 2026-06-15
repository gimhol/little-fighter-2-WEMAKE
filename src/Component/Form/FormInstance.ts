export class FormInstance<T extends object> {
  value: Partial<T> = {};
  constructor(o?: Partial<T>) {
    Object.assign(this.value, o);
  }

  getFieldValue<K extends keyof T>(name: K): T[K] | undefined {
    return this.value?.[name];
  }

  setFieldValue<K extends keyof T>(name: K, value: T[K]): void {
    this.value = { ...this.value, [name]: value }
    if (value == void 0) delete this.value[name]
  }

  resetFieldsValue(value: Partial<T>): void {
    this.value = { ...value }
    for (const key in this.value)
      if (this.value[key] == void 0)
        delete this.value[key]
  }
  setFieldsValue(values: Partial<T>): void {
    this.value = { ...this.value, ...values }
    for (const key in values)
      if (values[key] == void 0)
        delete this.value[key]
  }

  getFieldsValue(): Partial<T> | undefined {
    return this.value;
  }

  validateField<K extends keyof T>(name: K) {
    // TODO
  }
}
