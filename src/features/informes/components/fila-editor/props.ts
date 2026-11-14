import { ColumnaTabla, ErroresFila, FilaTabla, ValorCelda } from '../../models/informes-models';

export interface FilaEditorProps {
  /** Prefijo para los ids de los mensajes de error (único por tabla). */
  idBase: string;
  columnas: ColumnaTabla[];
  indice: number;
  /** Rótulo de la fila (mes) o su número en tablas libres. */
  rotulo: string;
  /** Lo diligenciado en la fila (sin columnas calculadas). */
  fila: FilaTabla;
  /** La fila con las columnas calculadas ya incluidas. */
  calculada: FilaTabla;
  errores: ErroresFila;
  /** Tabla de filas libres: la fila se puede quitar. */
  libre: boolean;
  onCambiarCelda: (indice: number, columna: string, valor: ValorCelda | undefined) => void;
  onQuitarFila: (indice: number) => void;
}
