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

export interface IFormController {
  form: TFormElement;
  mode: TValidationMode;
  getFieldValidationResult(control: TFormControl): IFormFieldValidationResult;
  checkStructure(): IFormStructureCheckResult;
}

export type TFieldType =
  | "Text"
  | "Email"
  | "Password"
  | "Checkbox"
  | "Radio"
  | "Select";
