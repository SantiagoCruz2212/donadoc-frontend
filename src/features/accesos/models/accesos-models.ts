import { z } from 'zod';

export interface Acceso {
  id: string;
  correo: string;
  nombre: string;
  rol: 'SUPER_ADMIN' | 'ADMIN_ORG' | 'OPERADOR';
  perfil: string | null;
  estado: string;
  creadoEn: string;
}

export const ROLES_ASIGNABLES = ['OPERADOR', 'ADMIN_ORG'] as const;
export const PERFILES = ['', 'COORDINADOR', 'AUXILIAR', 'CIRUJANO', 'REGIONAL', 'CONSULTA'] as const;

/** Los mensajes son claves de validación; la vista las traduce al idioma activo. */
export const crearAccesoSchema = z.object({
  correo: z.string().min(1, 'required').email('invalidEmail').max(180, 'maxLength'),
  nombre: z.string().min(3, 'required').max(150, 'maxLength'),
  rol: z.enum(ROLES_ASIGNABLES),
  perfil: z.enum(PERFILES),
});

export type CrearAccesoForm = z.infer<typeof crearAccesoSchema>;
