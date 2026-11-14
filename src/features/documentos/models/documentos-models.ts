import { z } from 'zod';

export interface Documento {
  id: string;
  casoId: string;
  tipo: string;
  estado: string;
  nombreArchivo: string | null;
  hashSha256: string | null;
  creadoEn: string;
}

export const textoSchema = z.object({ texto: z.string().trim().min(1, 'textMin') });
export type TextoForm = z.infer<typeof textoSchema>;