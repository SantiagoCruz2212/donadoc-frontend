import { z } from 'zod';

import { UsuarioSesion } from '@/shared/state-manager';

export interface SesionResponse {
  accessToken: string;
  usuario: UsuarioSesion;
}

/** Los mensajes son claves de validación; la vista las traduce al idioma activo. */
export const loginSchema = z.object({
  correo: z.string().min(1, 'required').email('invalidEmail'),
  clave: z.string().min(1, 'required'),
});

export type LoginForm = z.infer<typeof loginSchema>;

/** Misma política que el backend: 10 o más caracteres con al menos una letra y un número. */
const nuevaClave = z
  .string()
  .min(10, 'passwordPolicy')
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'passwordPolicy');

export const olvideClaveSchema = z.object({
  correo: z.string().min(1, 'required').email('invalidEmail'),
});

export const restablecerClaveSchema = z
  .object({
    codigo: z.string().regex(/^\d{6}$/, 'otpFormat'),
    nuevaClave,
    confirmar: z.string().min(1, 'required'),
  })
  .refine((d) => d.nuevaClave === d.confirmar, { path: ['confirmar'], message: 'passwordsMatch' });

export const cambiarClaveSchema = z
  .object({
    claveActual: z.string().min(1, 'required'),
    nuevaClave,
    confirmar: z.string().min(1, 'required'),
  })
  .refine((d) => d.nuevaClave === d.confirmar, { path: ['confirmar'], message: 'passwordsMatch' });

export type OlvideClaveForm = z.infer<typeof olvideClaveSchema>;
export type RestablecerClaveForm = z.infer<typeof restablecerClaveSchema>;
export type CambiarClaveForm = z.infer<typeof cambiarClaveSchema>;
