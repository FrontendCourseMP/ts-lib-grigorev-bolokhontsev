export type Sum = (a: number, b: number) => number;

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
  name: string | null;
  message: string;
}

export type TValidationMode = "OnSubmit" | "OnChange" | "OnBlur";

export type TFormStructureIssueType =
  | "NoFields"
  | "MissingLabel"
  | "MissingErrorContainer";

export interface IFormStructureIssue {
  control: TFormControl | null;
  name: string | null;
  type: TFormStructureIssueType;
  message: string;
}

export interface IFormStructureCheckResult {
  isOk: boolean;
  issues: IFormStructureIssue[];
}

export type TFieldKind = "string" | "password" | "number" | "array";

export interface IFieldMessages {
  min?: string;
  required?: string;
}

export interface IFieldBuilder {
  string(): IFieldBuilder;
  password(): IFieldBuilder;
  number(): IFieldBuilder;
  array(): IFieldBuilder;
  min(message: string): IFieldBuilder;
  required(message: string): IFieldBuilder;
}

export interface IFormValidationResult {
  isValid: boolean;
  fields: IFormFieldValidationResult[];
}

export interface IFormController {
  form: TFormElement;
  mode: TValidationMode;
  getFieldValidationResult(control: TFormControl): IFormFieldValidationResult;
  field(name: string): IFieldBuilder;
  validate(): IFormValidationResult;
  checkStructure(): IFormStructureCheckResult;
}

export type TFieldType =
  | "Text"
  | "Email"
  | "Password"
  | "Checkbox"
  | "Radio"
  | "Select";


export type TFieldConfig = {
  name: string;
  messages: IFieldMessages;
};