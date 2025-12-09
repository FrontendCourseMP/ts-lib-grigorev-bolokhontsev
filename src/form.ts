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
  IFieldMessages,
  IFormValidationResult,
  TFieldKind,
} from "./types/types";

type TFieldConfig = {
  name: string;
  controls: TFormControl[];
  kind: TFieldKind;
  messages: IFieldMessages;
};

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
    const config = control.name ? fieldConfigs.get(control.name) : undefined;
    if (config) {
      applyCustomMessages(config);
    } else {
      control.setCustomValidity("");
    }

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

  const fieldConfigs = new Map<string, TFieldConfig>();

  const pickControlsByName = (name: string): TFormControl[] =>
    Array.from(form.querySelectorAll<TFormControl>(`[name="${name}"]`));

  const ensureFieldConfig = (name: string): TFieldConfig => {
    const existing = fieldConfigs.get(name);
    if (existing) return existing;

    const controls = pickControlsByName(name);

    if (controls.length === 0) {
      throw new Error(
        `[ValidationGrigorevBolokhontsev] Поле с именем "${name}" не найдено в форме.`
      );
    }

    const fresh: TFieldConfig = {
      name,
      controls,
      kind: "string",
      messages: {},
    };

    fieldConfigs.set(name, fresh);
    return fresh;
  };

  const applyCustomMessages = (config: TFieldConfig): void => {
    const { kind, controls, messages } = config;

    if (kind === "array") {
      const checkboxes = controls.filter(
        (ctrl): ctrl is HTMLInputElement =>
          ctrl instanceof HTMLInputElement && ctrl.type === "checkbox"
      );

      checkboxes.forEach((checkbox) => checkbox.setCustomValidity(""));

      if (checkboxes.length === 0) return;

      const minAttr = Number(checkboxes[0].getAttribute("min") ?? 0);
      const minRequired = Number.isFinite(minAttr) && minAttr > 0 ? minAttr : 0;
      const checkedCount = checkboxes.filter((box) => box.checked).length;

      if (messages.required && checkedCount === 0) {
        checkboxes.forEach((box) =>
          box.setCustomValidity(messages.required as string)
        );
        return;
      }

      if (messages.min && minRequired > 0 && checkedCount < minRequired) {
        checkboxes.forEach((box) =>
          box.setCustomValidity(messages.min as string)
        );
      }

      return;
    }

    const control = controls[0];

    if (!control) return;

    control.setCustomValidity("");

    const validity = control.validity;

    if (messages.required && validity.valueMissing) {
      control.setCustomValidity(messages.required);
      return;
    }

    if (messages.min) {
      const isTooShort = validity.tooShort;
      const isRangeUnderflow = validity.rangeUnderflow;

      if ((kind === "string" || kind === "password") && isTooShort) {
        control.setCustomValidity(messages.min);
      }

      if (kind === "number" && isRangeUnderflow) {
        control.setCustomValidity(messages.min);
      }
    }
  };

  const buildFieldBuilder = (name: string): IFieldBuilder => {
    const config = ensureFieldConfig(name);

    const builder: IFieldBuilder = {
      string() {
        config.kind = "string";
        return builder;
      },
      password() {
        config.kind = "password";
        return builder;
      },
      number() {
        config.kind = "number";
        return builder;
      },
      array() {
        config.kind = "array";
        return builder;
      },
      min(message: string) {
        config.messages.min = message;
        return builder;
      },
      required(message: string) {
        config.messages.required = message;
        return builder;
      },
    };

    return builder;
  };

  const field = (name: string): IFieldBuilder => buildFieldBuilder(name);

  const validate = (): IFormValidationResult => {
    const results: IFormFieldValidationResult[] = [];

    getControls().forEach((control) => {
      const result = getFieldValidationResult(control);
      results.push(result);
    });

    return {
      isValid: results.every((item) => item.isValid),
      fields: results,
    };
  };

  return {
    form,
    mode,
    getFieldValidationResult,
    field,
    validate,
    checkStructure,
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
