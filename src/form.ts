import type {
  TFormControl,
  TFormElement,
  TFormValidity,
  TGetFormFromControl,
  TGetValidityFromControl,
  IFormFieldValidationResult,
  IFormController,
  TValidationMode,
  IFormStructureCheckResult,
  IFormStructureIssue,
  IFieldBuilder,
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
  const getControls = (): NodeListOf<TFormControl> =>
    form.querySelectorAll("input, select, textarea");

  const findLabelForControl = (
    control: TFormControl
  ): HTMLLabelElement | null => {
    const id = control.id;

    if (id) {
      const byFor = form.querySelector<HTMLLabelElement>(`label[for="${id}"]`);
      if (byFor) return byFor;
    }

    return control.closest("label");
  };

  const findErrorElementForControl = (
    control: TFormControl
  ): HTMLElement | null => {
    const candidate = control.parentElement?.nextElementSibling;

    if (
      candidate instanceof HTMLElement &&
      (candidate.getAttribute("role") === "alert" ||
        candidate.dataset.errorFor === control.name)
    ) {
      return candidate;
    }

    if (control.name) {
      const byDataAttr = form.querySelector<HTMLElement>(
        `[data-error-for="${control.name}"]`
      );
      if (byDataAttr) return byDataAttr;
    }

    return null;
  };

  const getFieldValidationResult = (
    control: TFormControl
  ): IFormFieldValidationResult => {
    const fieldForm = getFormFromControl(control);
    const isValid = control.checkValidity();
    const validity = getValidityFromControl(control);
    const message = control.validationMessage;
    const errorElement = findErrorElementForControl(control);

    if (errorElement) {
      errorElement.textContent = isValid ? "" : message;
    }

    control.toggleAttribute("aria-invalid", !isValid);

    return {
      control,
      form: fieldForm,
      validity,
      isValid,
      name: control.name || control.id || null,
      message,
    };
  };

  const checkStructure = (): IFormStructureCheckResult => {
    const controls = getControls();
    const issues: IFormStructureIssue[] = [];

    if (controls.length === 0) {
      issues.push({
        control: null,
        name: null,
        type: "NoFields",
        message: "Форма не содержит полей ввода (input/select/textarea).",
      });
    }

    controls.forEach((control) => {
      const name = control.name || control.id || null;

      const label = findLabelForControl(control);
      if (!label) {
        issues.push({
          control,
          name,
          type: "MissingLabel",
          message: "Для поля не найден связанный <label>.",
        });
      }

      const errorElement = findErrorElementForControl(control);
      if (!errorElement) {
        issues.push({
          control,
          name,
          type: "MissingErrorContainer",
          message:
            'Для поля не найден элемент для вывода ошибок (role="alert" или [data-error-for]).',
        });
      }
    });

    return {
      isOk: issues.length === 0,
      issues,
    };
  };

  const validate = () => {
    const results: IFormFieldValidationResult[] = [];

    getControls().forEach((control) => {
      const result = getFieldValidationResult(control);
      results.push(result);
    });

    const isValid = results.every((item) => item.isValid);

    return {
      isValid,
      fields: results,
    };
  };

  const field = (name: string): IFieldBuilder => {
    const builder: IFieldBuilder = {
      required(message: string) {
        console.log(`Поле "${name}": сообщение для обязательного поля установлено в "${message}"`);
        return builder;
      },
      min(message: string) {
        console.log(`Поле "${name}": сообщение для минимального значения установлено в "${message}"`);
        return builder;
      }
    };

    return builder;
  };

  return {
    form,
    mode,
    getFieldValidationResult,
    checkStructure,
    validate,
    field,
  };
};

export const ValidationGrigorevBolokhontsev = {
  form(
    formElement: TFormElement,
    mode: TValidationMode = "OnSubmit"
  ): IFormController {
    const controller = createFormController(formElement, mode);
    const structure = controller.checkStructure();

    if (!structure.isOk) {
      console.warn("[nova-validate] Нарушения структуры формы:", structure);
    }

    return controller;
  },
} as const;

export const v = ValidationGrigorevBolokhontsev;