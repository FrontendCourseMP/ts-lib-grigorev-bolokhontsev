import { expect, test, beforeEach } from "vitest";
import { v } from "../form";

beforeEach(() => {
  document.body.innerHTML = "";
});

test("checkStructure проверяет структуру формы: happy path и негативные сценарии", () => {
  const validForm = document.createElement("form");
  document.body.appendChild(validForm);

  const label1 = document.createElement("label");
  label1.setAttribute("for", "name");
  label1.textContent = "Имя";
  validForm.appendChild(label1);

  const input1 = document.createElement("input");
  input1.type = "text";
  input1.id = "name";
  input1.name = "name";
  validForm.appendChild(input1);

  const error1 = document.createElement("div");
  error1.setAttribute("role", "alert");
  error1.setAttribute("data-error-for", "name");
  validForm.appendChild(error1);

  const label2 = document.createElement("label");
  label2.setAttribute("for", "email");
  label2.textContent = "Email";
  validForm.appendChild(label2);

  const input2 = document.createElement("input");
  input2.type = "email";
  input2.id = "email";
  input2.name = "email";
  validForm.appendChild(input2);

  const error2 = document.createElement("div");
  error2.setAttribute("role", "alert");
  error2.setAttribute("data-error-for", "email");
  validForm.appendChild(error2);

  const formWithoutFields = document.createElement("form");
  formWithoutFields.innerHTML = `<p>Форма без полей</p>`;
  document.body.appendChild(formWithoutFields);

  const validController = v.form(validForm);
  const validResult = validController.checkStructure();

  expect(validResult.isOk).toBe(true);
  expect(validResult.issues).toHaveLength(0);
});
