import { expect, test, beforeEach } from "vitest";
import { v } from "../form";

beforeEach(() => {
  document.body.innerHTML = "";
});

test("checkStructure проверяет структуру формы: happy path и негативные сценарии", () => {
  // Arrange
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

  // Act
  const validController = v.form(validForm);
  const validResult = validController.checkStructure();

  // Assert
  expect(validResult.isOk).toBe(true);
  expect(validResult.issues).toHaveLength(0);
});

test("checkStructure обнаруживает форму без полей ввода", () => {
  // Arrange - создаем форму без полей (input/select/textarea)
  const emptyForm = document.createElement("form");
  document.body.appendChild(emptyForm);

  const paragraph = document.createElement("p");
  paragraph.textContent = "Форма без полей";
  emptyForm.appendChild(paragraph);

  // Act 
  const controller = v.form(emptyForm);
  const result = controller.checkStructure();

  // Assert
  expect(result.isOk).toBe(false);
  expect(result.issues).toHaveLength(1);
  expect(result.issues[0].type).toBe("NoFields");
  expect(result.issues[0].message).toContain("не содержит полей");
});

test("checkStructure обнаруживает поле без label", () => {
  // Arrange
  const form = document.createElement("form");
  document.body.appendChild(form);
  
  const input = document.createElement("input");
  input.type = "text";
  input.name = "username";
  input.id = "username";
  form.appendChild(input);
  
  const errorDiv = document.createElement("div");
  errorDiv.setAttribute("data-error-for", "username");
  form.appendChild(errorDiv);

  // Act
  const controller = v.form(form);
  const result = controller.checkStructure();

  // Assert
  expect(result.isOk).toBe(false);
  expect(result.issues).toHaveLength(1);
  expect(result.issues[0].type).toBe("MissingLabel");
});

test("checkStructure обнаруживает поле без контейнера ошибок", () => {
  // Arrange
  const form = document.createElement("form");
  document.body.appendChild(form);
  
  const label = document.createElement("label");
  label.setAttribute("for", "email");
  label.textContent = "Email";
  form.appendChild(label);
  
  const input = document.createElement("input");
  input.type = "email";
  input.name = "email";
  input.id = "email";
  form.appendChild(input);
  
  // Act
  const controller = v.form(form);
  const result = controller.checkStructure();

  // Assert
  expect(result.isOk).toBe(false);
  expect(result.issues).toHaveLength(1);
  expect(result.issues[0].type).toBe("MissingErrorContainer");
});


test("checkStructure обрабатывает поле без id", () => {
  // Arrange
  const form = document.createElement("form");
  document.body.appendChild(form);
  
  // Поле без id 
  const input = document.createElement("input");
  input.type = "text";
  input.name = "username";
  form.appendChild(input);
  
  // Act
  const controller = v.form(form);
  const result = controller.checkStructure();
  
  // Assert
  expect(result.isOk).toBe(false);
});

test("checkStructure обнаруживает несколько ошибок в одной форме", () => {
  // Arrange
  const form = document.createElement("form");
  document.body.appendChild(form);
  
  // 1: без label
  const input1 = document.createElement("input");
  input1.type = "text";
  input1.id = "field1";
  input1.name = "field1";
  form.appendChild(input1);
  
  const error1 = document.createElement("div");
  error1.setAttribute("data-error-for", "field1");
  form.appendChild(error1);
  
  // 2: без контейнера ошибок
  const label2 = document.createElement("label");
  label2.setAttribute("for", "field2");
  label2.textContent = "Поле 2";
  form.appendChild(label2);
  
  const input2 = document.createElement("input");
  input2.type = "text";
  input2.id = "field2";
  input2.name = "field2";
  form.appendChild(input2);
  
  // 3: валидное
  const label3 = document.createElement("label");
  label3.setAttribute("for", "field3");
  label3.textContent = "Поле 3";
  form.appendChild(label3);
  
  const input3 = document.createElement("input");
  input3.type = "text";
  input3.id = "field3";
  input3.name = "field3";
  form.appendChild(input3);
  
  const error3 = document.createElement("div");
  error3.setAttribute("data-error-for", "field3");
  form.appendChild(error3);
  
  // Act
  const controller = v.form(form);
  const result = controller.checkStructure();
  
  // Assert
  expect(result.isOk).toBe(false);
  expect(result.issues).toHaveLength(2);
  
  const errorTypes = result.issues.map(issue => issue.type);
  expect(errorTypes).toContain("MissingLabel");
  expect(errorTypes).toContain("MissingErrorContainer");
});
