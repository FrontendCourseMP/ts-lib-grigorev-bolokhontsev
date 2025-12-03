import { n } from "./form";

const form = document.querySelector("form");

if (form instanceof HTMLFormElement) {
  const validator = n.form(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstControl = form.querySelector("input, select, textarea");

    if (
      firstControl instanceof HTMLInputElement ||
      firstControl instanceof HTMLSelectElement ||
      firstControl instanceof HTMLTextAreaElement
    ) {
      const result = validator.getFieldValidationResult(firstControl);
      console.log("Результат базовой проверки поля:", result);
    }
  });
}

export { n };
