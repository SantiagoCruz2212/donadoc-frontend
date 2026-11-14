import { z } from 'zod';

import { ROLES_FIRMANTE } from '@/shared/constants/constants';

export interface Firma {
  id: string;
  documentoId: string;
  firmanteNombre: string;
  firmanteRol: string;
  /** Enmascarado por la API (a***@dominio). */
  firmanteCorreo: string | null;
  orden: number;
  estado: 'PENDIENTE' | 'FIRMADA';
  firmadoEn: string | null;
  proveedor: string | null;
  hashFirma: string | null;
}

export interface Verificacion {
  valida: boolean;
  motivos: string[];
  firmanteNombre: string;
  firmanteRol: string;
  firmadoEn: string | null;
  proveedor: string | null;
}

export const nuevoFirmanteSchema = z.object({
  firmanteNombre: z.string().trim().min(1, 'required').max(150, 'maxLength'),
  firmanteRol: z.enum(ROLES_FIRMANTE),
  firmanteCorreo: z.string().min(1, 'required').email('invalidEmail'),
});

export type NuevoFirmanteForm = z.infer<typeof nuevoFirmanteSchema>;
