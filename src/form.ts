import {
  TFormControl,
  TFormElement,
  TFormValidity,
  TGetFormFromControl,
  TGetValidityFromControl,
  IFormFieldValidationResult,
  IFormController,
  TValidationMode,
} from "./types/types";

export const getFormFromControl: TGetFormFromControl = (
  control: TFormControl
): TFormElement | null => {
  return control.form;
};

export const getValidityFromControl: TGetValidityFromControl = (
  control: TFormControl
): TFormValidity => {
  return control.validity;
};

export const createFormController = (
  form: TFormElement,
  mode: TValidationMode = "OnSubmit"
): IFormController => {
  const getFieldValidationResult = (
    control: TFormControl
  ): IFormFieldValidationResult => {
    const fieldForm = getFormFromControl(control);
    const validity = getValidityFromControl(control);

    const isValid = control.checkValidity();

    return {
      control,
      form: fieldForm,
      validity,
      isValid,
    };
  };

  return {
    form,
    mode,
    getFieldValidationResult,
  };
};

export const n = {
  form(
    formElement: TFormElement,
    mode: TValidationMode = "OnSubmit"
  ): IFormController {
    return createFormController(formElement, mode);
  },
} as const;
