import { v } from "./form";

const form = document.querySelector("form");

if (form instanceof HTMLFormElement) {
  const validator = v.form(form);

  validator.field("name").string().required("Введите имя").min("Мало символов");
  validator
    .field("age")
    .number()
    .required("Укажите возраст")
    .min("Слишком маленькое значение");
  validator
    .field("password")
    .password()
    .min("Пароль слишком короткий")
    .required("Введите пароль");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = validator.validate();
    console.log("Результат проверки формы:", result);
  });
}

export { v };
