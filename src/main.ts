import { v } from "./form";

const form = document.querySelector("form");

if (form instanceof HTMLFormElement) {
  const validator = v.form(form);

  validator
    .field("age")
    .number()
    .required("Укажите возраст")
    .min("Возраст должен быть от 18 лет");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = validator.validate();
    console.log("Результат проверки формы:", result);
  });
}

export { v };