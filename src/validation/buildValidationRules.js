export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LENGTH_AWARE_TYPES = ["text", "textarea", "password", "email"];

export function getValidationRules(field) {
  const rules = {};
  const label = field.label || "This field";

  if (field.required) {
    rules.required = `${label} is required`;
  }

  if (LENGTH_AWARE_TYPES.includes(field.type)) {
    if (field.minLength) {
      rules.minLength = {
        value: Number(field.minLength),
        message: `Minimum ${field.minLength} characters`,
      };
    }
    if (field.maxLength) {
      rules.maxLength = {
        value: Number(field.maxLength),
        message: `Maximum ${field.maxLength} characters`,
      };
    }
  }

  if (field.type === "number") {
    if (field.min !== undefined && field.min !== "") {
      rules.min = { value: Number(field.min), message: `Minimum: ${field.min}` };
    }
    if (field.max !== undefined && field.max !== "") {
      rules.max = { value: Number(field.max), message: `Maximum: ${field.max}` };
    }
  }

  const validate = {};

  if (field.type === "email") {
    validate.email = (value) => !value || EMAIL_REGEX.test(value) || "Invalid email address";
  }

  if (field.pattern && field.type !== "email") {
    validate.pattern = (value) => {
      if (!value) return true;
      try {
        return (
          new RegExp(field.pattern).test(value) || field.patternMessage || "Invalid format"
        );
      } catch {
        return true;
      }
    };
  }

  if (Object.keys(validate).length > 0) {
    rules.validate = validate;
  }

  return rules;
}
