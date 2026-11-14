import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Escribe tu correo electrónico.')
  .email('Ese correo no parece válido.');

export const passwordSchema = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres.')
  .max(72, 'La contraseña es demasiado larga.');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Escribe tu nombre (mínimo 2 letras).')
  .max(60, 'El nombre es demasiado largo.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Revisa los datos ingresados.';
}
