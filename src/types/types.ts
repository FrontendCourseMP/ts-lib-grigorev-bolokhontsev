export type sum = (a: number, b: number) => number;

export type TFormControl =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export type TFormElement = HTMLFormElement;

export type TFormValidity = ValidityState;

export type TGetFormFromControl = (
  control: TFormControl
) => TFormElement | null;

export type TGetValidityFromControl = (control: TFormControl) => TFormValidity;

export interface IFormFieldValidationResult {
  control: TFormControl;
  form: TFormElement | null;
  validity: TFormValidity;
  isValid: boolean;
}

export interface IFormController {
  form: TFormElement;
  mode: "onSubmit" | "onChange" | "onBlur";
  getFieldValidationResult(control: TFormControl): IFormFieldValidationResult;
}

export type TFieldType =
  | "text"
  | "email"
  | "password"
  | "checkbox"
  | "radio"
  | "select";
