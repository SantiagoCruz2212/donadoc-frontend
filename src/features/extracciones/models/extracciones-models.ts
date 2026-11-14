export type Decision = 'PENDIENTE' | 'ACEPTADA' | 'MODIFICADA' | 'RECHAZADA';

export interface Sugerencia {
  id: string;
  campo: string;
  valorSugerido: string | null;
  confianza: number | null;
  decision: Decision;
  valorFinal: string | null;
}

export interface Extraccion {
  id: string;
  casoId: string;
  documentoOrigenId: string;
  estado: string;
  proveedor: string;
  modelo: string | null;
  intentos: number;
  solicitadoEn: string;
  sugerencias: Sugerencia[];
}

/** La API devuelve además un mensaje legible sobre el resultado de la extracción. */
export interface ResultadoExtraccion {
  mensaje: string;
  extraccion: Extraccion;
}