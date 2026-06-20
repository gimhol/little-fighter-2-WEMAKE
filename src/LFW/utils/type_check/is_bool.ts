export const is_bool = (v: any): v is boolean => typeof v === "boolean";
export const is_false = (v: any): v is false => v === false;
export const is_true = (v: any): v is true => v === true;
