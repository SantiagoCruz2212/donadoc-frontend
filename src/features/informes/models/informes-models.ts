/**
 * Tipos de los informes periódicos. Espejo mínimo de Backend/src/formatos/esquema.ts y tablas.ts: se duplican aquí
 * (y no se importan de features/formatos) porque un feature no puede depender de otro.
 */
export type TipoCampo = 'texto' | 'areaTexto' | 'fecha' | 'seleccion' | 'booleano' | 'numero' | 'tabla';
export type TipoColumna = 'texto' | 'fecha' | 'numero' | 'seleccion';
export type Periodicidad = 'MENSUAL' | 'SEMANAL';

export interface ColumnaTabla {
  clave: string;
  etiqueta: string;
  tipo: TipoColumna;
  opciones?: string[];
  /** Con fórmula la columna es calculada y de solo lectura: suma de `mas` menos suma de `menos`. */
  formula?: { mas: string[]; menos?: string[] };
}

export interface ResumenTabla {
  columna: string;
  titulo: string;
}

export interface CampoInforme {
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido: boolean;
  opciones?: string[];
  columnas?: ColumnaTabla[];
  filasFijas?: string[];
  maxFilas?: number;
  totales?: boolean;
  resumenes?: ResumenTabla[];
}

export interface SeccionInforme {
  titulo: string;
  campos: CampoInforme[];
}

export interface EsquemaInforme {
  ambito?: 'CASO' | 'INFORME';
  periodicidad?: Periodicidad;
  secciones: SeccionInforme[];
}

export interface PlantillaInforme {
  codigo: string;
  nombre: string;
  version: string;
  esquema: EsquemaInforme;
}

export type ValorCelda = string | number;
export type FilaTabla = Record<string, ValorCelda>;
export type ValorCampo = string | number | boolean | FilaTabla[];
/** Valores del formulario por clave de campo (las tablas son listas de filas). */
export type Valores = Record<string, ValorCampo>;

export interface ResumenCalculado {
  titulo: string;
  columna: string;
  conteos: Record<string, number>;
}

export interface TablaCalculada {
  filas: FilaTabla[];
  totales?: Record<string, number>;
  resumenes: ResumenCalculado[];
}

export type EstadoInforme = 'SIN_INICIAR' | 'BORRADOR' | 'COMPLETO';

export interface InformeVista {
  plantilla: PlantillaInforme;
  periodo: string;
  estado: EstadoInforme;
  version: number;
  hashSha256: string | null;
  datos: Record<string, ValorCampo> | null;
  calculados: Record<string, TablaCalculada>;
  actualizadoEn: string | null;
}

export interface InformeResumen {
  id: string;
  codigo: string;
  nombre: string;
  periodo: string;
  estado: EstadoInforme;
  version: number;
  actualizadoEn: string;
}

export interface PaginaInformes {
  items: InformeResumen[];
  page: number;
  totalPages: number;
  total: number;
}

export const TAMANO_PAGINA = 20;
export const MAX_FILAS_POR_DEFECTO = 200;

const FORMA_PERIODO: Record<Periodicidad, RegExp> = {
  MENSUAL: /^\d{4}-(0[1-9]|1[0-2])$/,
  SEMANAL: /^\d{4}-S(0[1-9]|[1-4]\d|5[0-3])$/,
};

export const periodicidadDe = (e: EsquemaInforme): Periodicidad => e.periodicidad ?? 'MENSUAL';

/** ¿El periodo tiene la forma que exige la periodicidad? (AAAA-MM o AAAA-Sww; el servidor sigue siendo la autoridad). */
export const periodoValido = (periodicidad: Periodicidad, periodo: string): boolean => FORMA_PERIODO[periodicidad].test(periodo);

export const todosLosCampos = (e: EsquemaInforme): CampoInforme[] => e.secciones.flatMap((s) => s.campos);

export const maxFilasDe = (c: CampoInforme): number => (c.filasFijas ? c.filasFijas.length : (c.maxFilas ?? MAX_FILAS_POR_DEFECTO));

const celdaConValor = (v: unknown): v is ValorCelda => v !== undefined && v !== null && v !== '' && !(typeof v === 'number' && Number.isNaN(v));

/** Solo las celdas diligenciables y con contenido (sin vacías ni columnas calculadas). */
export function limpiarFila(columnas: ColumnaTabla[], fila: FilaTabla): FilaTabla {
  const salida: FilaTabla = {};
  for (const col of columnas) {
    if (col.formula) continue;
    const bruto = fila[col.clave];
    const v = typeof bruto === 'string' ? bruto.trim() : bruto;
    if (celdaConValor(v)) salida[col.clave] = v;
  }
  return salida;
}

/**
 * Valores iniciales del formulario a partir de lo guardado: tablas de filas fijas con una fila por rótulo (vacías `{}`),
 * tablas libres con las filas guardadas, booleanos en falso y el resto en blanco.
 */
export function valoresIniciales(v: InformeVista): Valores {
  const valores: Valores = {};
  for (const c of todosLosCampos(v.plantilla.esquema)) {
    const guardado = v.datos?.[c.clave];
    if (c.tipo === 'tabla') {
      const filas = Array.isArray(guardado) ? guardado : [];
      valores[c.clave] = c.filasFijas ? c.filasFijas.map((_, i) => ({ ...(filas[i] ?? {}) })) : filas.map((f) => ({ ...f }));
    } else if (guardado !== undefined && guardado !== null) valores[c.clave] = guardado;
    else valores[c.clave] = c.tipo === 'booleano' ? false : '';
  }
  return valores;
}

/**
 * Lo que se envía a la API: sin textos vacíos ni NaN; en tablas libres sin filas vacías; en tablas de filas fijas se
 * conserva la posición de cada fila (un arreglo alineado con los rótulos) y se omite la tabla si no tiene ningún dato.
 */
export function limpiarDatos(esquema: EsquemaInforme, valores: Valores): Record<string, ValorCampo> {
  const salida: Record<string, ValorCampo> = {};
  for (const c of todosLosCampos(esquema)) {
    const v = valores[c.clave];
    if (c.tipo === 'tabla') {
      const filas = (Array.isArray(v) ? v : []).map((f) => limpiarFila(c.columnas ?? [], f));
      const conDatos = filas.some((f) => Object.keys(f).length > 0);
      if (!conDatos) continue;
      salida[c.clave] = c.filasFijas ? filas : filas.filter((f) => Object.keys(f).length > 0);
      continue;
    }
    if (v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v))) continue;
    salida[c.clave] = v;
  }
  return salida;
}

export interface ErroresFila {
  /** Error de la fila completa (`mensual[3]`). */
  fila?: string;
  /** Errores por celda (`mensual[3].hb`): columna → mensaje. */
  celdas: Record<string, string>;
}

export interface ErroresTabla {
  /** Error de la tabla completa (`mensual`). */
  tabla?: string;
  filas: Record<number, ErroresFila>;
}

/** Agrupa los errores planos de la API (`clave`, `clave[i]`, `clave[i].col`) de una tabla por fila y celda. */
export function erroresDeTabla(errores: Record<string, string>, clave: string): ErroresTabla {
  const salida: ErroresTabla = { filas: {} };
  for (const [k, mensaje] of Object.entries(errores)) {
    if (k === clave) {
      salida.tabla = mensaje;
      continue;
    }
    if (!k.startsWith(`${clave}[`)) continue;
    const m = /^(\d+)\](?:\.(.+))?$/.exec(k.slice(clave.length + 1));
    if (!m) continue;
    const i = Number(m[1]);
    const fila = (salida.filas[i] ??= { celdas: {} });
    if (m[2]) fila.celdas[m[2]] = mensaje;
    else fila.fila = mensaje;
  }
  return salida;
}
