import { CampoInforme, FilaTabla, TablaCalculada, ValorCelda } from '../../models/informes-models';

export interface TablaEditorProps {
  /** Campo de tipo «tabla» del esquema (columnas, filas fijas, totales, resúmenes). */
  campo: CampoInforme;
  /** Lo diligenciado: una fila por rótulo (filas fijas) o las filas libres. */
  filas: FilaTabla[];
  /** Columnas calculadas, totales y resúmenes ya resueltos (en vivo, o lo que devolvió el servidor). */
  calculada: TablaCalculada | undefined;
  /** Errores planos de la API de todo el formulario: `clave`, `clave[i]` y `clave[i].columna`. */
  errores: Record<string, string>;
  onCambiarCelda: (clave: string, indice: number, columna: string, valor: ValorCelda | undefined) => void;
  onAgregarFila: (clave: string) => void;
  onQuitarFila: (clave: string, indice: number) => void;
}
