/** Esquema de un formato tal como lo entrega la API: secciones con campos tipados. */
export type TipoCampo = 'texto' | 'areaTexto' | 'fecha' | 'seleccion' | 'booleano' | 'numero';

export interface CampoFormato {
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido: boolean;
  opciones?: string[];
  origen?: string;
}

export interface SeccionFormato {
  titulo: string;
  campos: CampoFormato[];
}

export interface EsquemaFormato {
  secciones: SeccionFormato[];
}

export interface Plantilla {
  codigo: string;
  nombre: string;
  version: string;
  esquema: EsquemaFormato;
}

export type ValorCampo = string | number | boolean;
export type Valores = Record<string, ValorCampo | undefined>;

export interface Formulario {
  plantilla: Plantilla;
  estado: 'SIN_INICIAR' | 'BORRADOR' | 'COMPLETO' | 'FIRMADO';
  version: number;
  documentoId: string | null;
  hashSha256: string | null;
  datos: Record<string, ValorCampo> | null;
  precarga: Record<string, ValorCampo>;
}

/** Lo que el formulario informa al detalle del caso (para habilitar las firmas). */
export interface FormularioActivo {
  documentoId: string | null;
  estado: Formulario['estado'];
  version: number;
}

export const todosLosCampos = (e: EsquemaFormato): CampoFormato[] => e.secciones.flatMap((s) => s.campos);

/**
 * Valores iniciales del formulario: lo ya guardado manda sobre lo precargado. Devuelve también qué claves
 * vienen de la precarga, para avisarlo en pantalla (la persona debe revisarlas).
 */
export function valoresIniciales(f: Formulario): { valores: Valores; precargados: string[] } {
  const valores: Valores = {};
  const precargados: string[] = [];
  for (const c of todosLosCampos(f.plantilla.esquema)) {
    if (f.datos && c.clave in f.datos) valores[c.clave] = f.datos[c.clave];
    else if (c.clave in f.precarga) {
      valores[c.clave] = f.precarga[c.clave];
      precargados.push(c.clave);
    } else valores[c.clave] = c.tipo === 'booleano' ? false : '';
  }
  return { valores, precargados };
}

/** Deja solo valores con contenido (sin textos vacíos ni números NaN) en el tipo que espera la API. */
export function limpiarValores(esquema: EsquemaFormato, valores: Valores): Record<string, ValorCampo> {
  const salida: Record<string, ValorCampo> = {};
  for (const c of todosLosCampos(esquema)) {
    const v = valores[c.clave];
    if (v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v))) continue;
    salida[c.clave] = v;
  }
  return salida;
}
