# Документация по библиотеке валидации

Григорьев Егор - сolavor  
Болохонцев Виктор - w1lqA

## Описание

Библиотека для валидации HTML-форм с поддержкой кастомных сообщений об ошибках, проверки структуры формы и гибкой настройки правил валидации.

## Требования

- TypeScript 5.9+
- Современный браузер с поддержкой ES2022
- Для тестирования: Node.js с поддержкой ES modules

## Установка

```sh
npm install
```

## Быстрый старт

### Пример использования

```typescript
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
    console.log(result.isValid ? "Форма валидна!" : "Ошибки:", result.fields);
  });
}
```

### Структура HTML формы

Форма должна соответствовать следующей структуре:

```html
<form>
  <label for="name">Имя</label>
  <input type="text" id="name" name="name" />
  <div role="alert" data-error-for="name"></div>

  <label for="age">Возраст</label>
  <input type="number" id="age" name="age" />
  <div role="alert" data-error-for="age"></div>
</form>
```

**Требования к структуре:**

- Каждое поле должно иметь связанный `<label>` (через атрибут `for` или оборачивающий элемент)
- Для каждого поля должен быть контейнер ошибок с `role="alert"` или атрибутом `data-error-for`

## API

### Основные методы

#### `v.form(formElement, mode?)`

Создает контроллер валидации для формы.

**Параметры:**

- `formElement` (HTMLFormElement) - элемент формы
- `mode` (TValidationMode, опционально) - режим валидации: `"OnSubmit"` (по умолчанию), `"OnChange"`, `"OnBlur"`

**Возвращает:** `IFormController`

**Пример:**

```typescript
const validator = v.form(form, "OnChange");
```

#### `validator.field(name)`

Начинает настройку правил валидации для поля.

**Параметры:**

- `name` (string) - имя поля (атрибут `name` или `id`)

**Возвращает:** `IFieldBuilder` - билдер для цепочки методов

**Методы билдера:**

- `.string()` - указывает, что поле является строковым
- `.password()` - указывает, что поле является паролем
- `.number()` - указывает, что поле является числовым
- `.array()` - указывает, что поле является массивом (для чекбоксов)
- `.required(message)` - делает поле обязательным с кастомным сообщением
- `.min(message)` - устанавливает минимальное значение/длину с кастомным сообщением

**Пример:**

```typescript
validator
  .field("email")
  .string()
  .required("Email обязателен")
  .min("Email слишком короткий");
```

#### `validator.validate()`

Выполняет валидацию всех полей формы.

**Возвращает:** `IFormValidationResult`

```typescript
interface IFormValidationResult {
  isValid: boolean; // true, если все поля валидны
  fields: IFormFieldValidationResult[]; // результаты валидации каждого поля
}
```

**Пример:**

```typescript
const result = validator.validate();
if (!result.isValid) {
  result.fields
    .filter((f) => !f.isValid)
    .forEach((f) => console.log(`${f.name}: ${f.message}`));
}
```

#### `validator.checkStructure()`

Проверяет структуру формы на соответствие требованиям.

**Возвращает:** `IFormStructureCheckResult`

```typescript
interface IFormStructureCheckResult {
  isOk: boolean; // true, если структура корректна
  issues: IFormStructureIssue[]; // список проблем
}
```


**Типы проблем:**

- `"NoFields"` - форма не содержит полей ввода
- `"MissingLabel"` - для поля не найден связанный label
- `"MissingErrorContainer"` - для поля не найден контейнер ошибок

**Пример:**

```typescript
const structure = validator.checkStructure();
if (!structure.isOk) {
  structure.issues.forEach((issue) => console.warn(issue.message));
}
```

#### `validator.getFieldValidationResult(control)`

Получает результат валидации для конкретного поля.

**Параметры:**

- `control` (TFormControl) - элемент поля (input, select, textarea)

**Возвращает:** `IFormFieldValidationResult`

## Типы

### TValidationMode

```typescript
type TValidationMode = "OnSubmit" | "OnChange" | "OnBlur";
```

### TFieldKind

```typescript
type TFieldKind = "string" | "password" | "number" | "array";
```

### IFormFieldValidationResult

```typescript
interface IFormFieldValidationResult {
  control: TFormControl;
  form: TFormElement | null;
  validity: TFormValidity;
  isValid: boolean;
  name: string | null;
  message: string;
}
```

## Тестирование

Проект включает набор тестов, покрывающий все основные сценарии:

- Happy path (валидные формы)
- Негативные сценарии (формы с ошибками)
- Проверка всех веток if-else
- Работа с DOM через JsDom

**Запуск тестов:**

```sh
npm test
```

## Соответствие требованиям

### Полнота реализации

**Валидация форм:**

- Поддержка различных типов полей (string, password, number, array)
- Кастомные сообщения об ошибках
- Проверка обязательности полей
- Проверка минимальных значений/длин

**Проверка структуры:**

- Валидация наличия полей ввода
- Проверка связанных label элементов
- Проверка контейнеров ошибок

**Гибкость:**

- Поддержка различных режимов валидации
- Fluent API для настройки правил
- Автоматическое отображение ошибок в DOM

### Понятность API

- **Fluent API** - цепочка методов для интуитивной настройки
- **Типизация TypeScript** - полная поддержка типов для автодополнения
- **Понятные названия** - методы и свойства имеют описательные имена
- **Документация** - все публичные методы документированы

### Примеры использования

Библиотека предоставляет простой и понятный API:

```typescript
validator.field("name").string().required("Обязательное поле");
validator
  .field("password")
  .password()
  .required("Пароль обязателен")
  .min("Минимум 8 символов");
```

## Разработка

**Установка зависимостей:**

```sh
npm install
```

**Запуск в режиме разработки:**

```sh
npm run dev
```

**Сборка:**

```sh
npm run build
```

**Линтинг:**

```sh
npm run lint
```

**Форматирование:**

```sh
npm run format
```


