import { loginSchema, registerSchema } from "@/lib/validators";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export function parseLoginInput(formData: FormData) {
  return loginSchema.safeParse(formDataToObject(formData));
}

export function parseRegisterInput(formData: FormData) {
  return registerSchema.safeParse(formDataToObject(formData));
}
