import { CampoInforme, FilaTabla, ResumenCalculado, TablaCalculada } from './informes-models';

/**
 * Cálculos de las tablas de los informes, repetidos del backend (Backend/src/formatos/tablas.ts) para mostrarlos
 * mientras se escribe. El servidor es la autoridad: al guardar se muestra lo que él devuelve.
 * Reglas: una celda no numérica cuenta 0; las filas calculadas conservan su posición; en tablas de filas fijas
 * hay siempre `filasFijas.length` filas; los resúmenes parten con todas las opciones en 0.
 */
const numero = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** Fila con las columnas calculadas ya incluidas (no modifica la original). */
export function calcularFila(campo: CampoInforme, fila: FilaTabla | undefined): FilaTabla {
  const salida: FilaTabla = { ...(fila ?? {}) };
  for (const col of campo.columnas ?? []) {
    if (!col.formula) continue;
    const mas = col.formula.mas.reduce((s, k) => s + numero(salida[k]), 0);
    const menos = (col.formula.menos ?? []).reduce((s, k) => s + numero(salida[k]), 0);
    salida[col.clave] = mas - menos;
  }
  return salida;
}

function calcularTotales(campo: CampoInforme, filas: FilaTabla[]): Record<string, number> | undefined {
  if (!campo.totales) return undefined;
  const totales: Record<string, number> = {};
  for (const col of campo.columnas ?? []) if (col.tipo === 'numero') totales[col.clave] = filas.reduce((s, f) => s + numero(f[col.clave]), 0);
  return totales;
}

function calcularResumenes(campo: CampoInforme, filas: FilaTabla[]): ResumenCalculado[] {
  return (campo.resumenes ?? []).map((r) => {
    const col = (campo.columnas ?? []).find((c) => c.clave === r.columna);
    const conteos: Record<string, number> = Object.fromEntries((col?.opciones ?? []).map((o) => [o, 0]));
    for (const f of filas) {
      const v = f[r.columna];
      if (typeof v === 'string' && v in conteos) conteos[v] += 1;
    }
    return { titulo: r.titulo, columna: r.columna, conteos };
  });
}

export function calcularTabla(campo: CampoInforme, filas: FilaTabla[] | undefined): TablaCalculada {
  const cantidad = campo.filasFijas ? campo.filasFijas.length : (filas ?? []).length;
  const base = Array.from({ length: cantidad }, (_, i) => calcularFila(campo, (filas ?? [])[i]));
  const totales = calcularTotales(campo, base);
  return { filas: base, ...(totales ? { totales } : {}), resumenes: calcularResumenes(campo, base) };
}

/** Calcula todas las tablas del esquema: clave de campo → resultado. */
export function calcularTablas(campos: CampoInforme[], datos: Record<string, unknown> | null): Record<string, TablaCalculada> {
  const salida: Record<string, TablaCalculada> = {};
  for (const c of campos) {
    if (c.tipo !== 'tabla') continue;
    const v = datos?.[c.clave];
    salida[c.clave] = calcularTabla(c, Array.isArray(v) ? (v as FilaTabla[]) : undefined);
  }
  return salida;
}

/**
 * Recalcula tras editar UNA fila reutilizando las demás filas ya calculadas (para que sus componentes memoizados no se
 * vuelvan a dibujar con cada pulsación). Los totales y resúmenes sí se recalculan completos. `filas` ya trae la fila nueva.
 */
export function actualizarFila(campo: CampoInforme, previa: TablaCalculada | undefined, filas: FilaTabla[], indice: number): TablaCalculada {
  if (!previa || previa.filas.length !== filas.length || indice < 0 || indice >= filas.length) return calcularTabla(campo, filas);
  const base = previa.filas.slice();
  base[indice] = calcularFila(campo, filas[indice]);
  const totales = calcularTotales(campo, base);
  return { filas: base, ...(totales ? { totales } : {}), resumenes: calcularResumenes(campo, base) };
}

/** Número para mostrar: sin ruido de coma flotante (0.1 + 0.2 → 0.3). */
export const formatearNumero = (n: number): string => String(Math.round(n * 1e6) / 1e6);
