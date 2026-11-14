import { ApiError } from '@/shared/models/api-models';

/** Fecha y hora en español de Colombia (la API ya entrega las fechas en la zona horaria de negocio). */
export function formatearFechaHora(iso: string, locale = 'es-CO'): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
}

/** 0.91 → "91 %". Sin dato devuelve "—". */
export function formatearPorcentaje(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? '—' : `${Math.round(valor * 100)} %`;
}

/** Mensaje legible de cualquier error, incluyendo el detalle por campo de las validaciones de la API. */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (error instanceof ApiError) {
    const campos = error.detalle.map((d) => Object.values(d.constraints).join(', ')).filter(Boolean).join(' · ');
    return campos ? `${error.message}: ${campos}` : error.message;
  }
  return error instanceof Error && error.message ? error.message : porDefecto;
}

/**
 * Los esquemas de Zod devuelven CLAVES de validación (p. ej. "required"); aquí se traducen al idioma activo.
 * Si el mensaje no es una clave conocida se devuelve tal cual.
 */
export function traducirValidacion(diccionario: Record<string, string>, mensaje: string | undefined): string | undefined {
  if (!mensaje) return undefined;
  return diccionario[mensaje] ?? mensaje;
}

/** Entrega un archivo al usuario (descarga) a partir de un Blob. */
export function descargarBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Convierte el detalle de errores de validación de la API en un mapa campo → mensaje. */
export function erroresPorCampo(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.detalle.map((d) => [d.property, Object.values(d.constraints).join(', ')]));
}

/** Une clases CSS ignorando valores vacíos. */
export function clases(...nombres: (string | false | null | undefined)[]): string {
  return nombres.filter(Boolean).join(' ');
}
