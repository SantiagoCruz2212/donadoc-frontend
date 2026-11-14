/** Lo que una institución ve de los trasplantes vigentes de la red: sin ningún dato personal del donante. */
export interface ComponenteRed {
  tipoComponente: string;
  rescatado: boolean;
}

export interface TrasplanteVigente {
  codigo: string;
  institucion: string;
  esPropio: boolean;
  casoId: string | null;
  tipoDonante: string | null;
  estado: string;
  fechaInicio: string;
  componentes: ComponenteRed[];
}

export interface ListaRed {
  items: TrasplanteVigente[];
  total: number;
}
