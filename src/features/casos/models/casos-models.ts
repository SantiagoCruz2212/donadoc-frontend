import { z } from 'zod';

import { TIPOS_COMPONENTE, TIPOS_DOCUMENTO } from '@/shared/constants/constants';

export interface Donante {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
}

export interface Caso {
  id: string;
  estado: string;
  tipoDonante: string | null;
  muerteViolenta: boolean;
  creadoEn: string;
  donante?: Donante;
}

export const crearCasoSchema = z.object({
  tipoDocumento: z.enum(TIPOS_DOCUMENTO),
  numeroDocumento: z.string().regex(/^[0-9A-Za-z-]{4,20}$/, 'documentFormat'),
  nombres: z.string().trim().min(1, 'required').max(120, 'maxLength'),
  apellidos: z.string().trim().min(1, 'required').max(120, 'maxLength'),
});

export type CrearCasoForm = z.infer<typeof crearCasoSchema>;

export interface Componente {
  id: string;
  tipoComponente: string;
  rescatado: boolean;
  causaNoRescate: string | null;
}

/** Si no se rescató hay que decir por qué (lo exige también el backend). */
export const componenteSchema = z
  .object({
    tipoComponente: z.enum(TIPOS_COMPONENTE),
    rescatado: z.boolean(),
    causaNoRescate: z.string().trim().max(500, 'maxLength').optional(),
  })
  .refine((d) => d.rescatado || (d.causaNoRescate ?? '').length > 0, { path: ['causaNoRescate'], message: 'required' });

export type ComponenteForm = z.infer<typeof componenteSchema>;
