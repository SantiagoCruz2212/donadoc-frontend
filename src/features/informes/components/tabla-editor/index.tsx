import { useCallback, useId, useMemo } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';

import { formatearNumero } from '../../models/calculos';
import { ErroresFila, erroresDeTabla, maxFilasDe, ValorCelda } from '../../models/informes-models';
import { FilaEditor } from '../fila-editor';
import { TablaEditorProps } from './props';
import styles from './styles.module.css';

const SIN_ERRORES: ErroresFila = { celdas: {} };

/**
 * Editor de una tabla del informe: rejilla con encabezado y primera columna fijos y desplazamiento horizontal.
 * Las columnas calculadas son de solo lectura, la fila TOTAL y los resúmenes salen de `calculada`. En tablas libres
 * permite agregar y quitar filas hasta el máximo del esquema.
 */
export function TablaEditor({ campo, filas, calculada, errores, onCambiarCelda, onAgregarFila, onQuitarFila }: TablaEditorProps) {
  const { t } = useTranslations();
  const idBase = useId();
  const columnas = useMemo(() => campo.columnas ?? [], [campo.columnas]);
  const libre = !campo.filasFijas;
  const max = maxFilasDe(campo);
  const clave = campo.clave;
  const porFila = useMemo(() => erroresDeTabla(errores, clave), [errores, clave]);
  const cambiarCelda = useCallback((i: number, col: string, v: ValorCelda | undefined) => onCambiarCelda(clave, i, col, v), [onCambiarCelda, clave]);
  const quitarFila = useCallback((i: number) => onQuitarFila(clave, i), [onQuitarFila, clave]);
  const idErrorTabla = `${idBase}-tabla`;

  return (
    <div className={styles.tabla}>
      {porFila.tabla && (
        <p role="alert" id={idErrorTabla} className={styles.error}>
          {porFila.tabla}
        </p>
      )}
      <div className={styles.contenedor} role="region" aria-label={campo.etiqueta} aria-describedby={porFila.tabla ? idErrorTabla : undefined} tabIndex={0}>
        <table className={styles.rejilla}>
          <thead>
            <tr>
              <th scope="col" className={styles.esquina}>
                {libre ? t.informes.row : t.informes.rowFixed}
              </th>
              {columnas.map((col) => (
                <th key={col.clave} scope="col" className={styles.encabezado}>
                  {col.etiqueta}
                  {col.formula && <span className={styles.marca}> {t.informes.calculated}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <FilaEditor
                // En filas libres la posición es la identidad: quitar una fila renumera las siguientes.
                key={i}
                idBase={idBase}
                columnas={columnas}
                indice={i}
                rotulo={campo.filasFijas ? (campo.filasFijas[i] ?? String(i + 1)) : String(i + 1)}
                fila={fila}
                calculada={calculada?.filas[i] ?? fila}
                errores={porFila.filas[i] ?? SIN_ERRORES}
                libre={libre}
                onCambiarCelda={cambiarCelda}
                onQuitarFila={quitarFila}
              />
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={columnas.length + 1} className="suave">
                  {t.informes.noRows}
                </td>
              </tr>
            )}
          </tbody>
          {campo.totales && calculada?.totales && (
            <tfoot>
              <tr>
                <th scope="row" className={styles.rotuloTotal}>
                  {t.informes.total}
                </th>
                {columnas.map((col) => (
                  <td key={col.clave} className={styles.total}>
                    {col.tipo === 'numero' ? formatearNumero(calculada.totales?.[col.clave] ?? 0) : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {libre && (
        <div className={styles.acciones}>
          <Button variante="secundario" disabled={filas.length >= max} onClick={() => onAgregarFila(clave)}>
            {t.informes.addRow}
          </Button>
          <span className="suave">
            {filas.length} / {max}
          </span>
        </div>
      )}
      {(calculada?.resumenes ?? []).map((r) => {
        const con = Object.entries(r.conteos).filter(([, n]) => n > 0);
        return (
          <p key={r.columna} className={styles.resumen}>
            <strong>{r.titulo}:</strong> {con.length > 0 ? con.map(([opcion, n]) => `${opcion} ${n}`).join(' · ') : t.informes.noData}
          </p>
        );
      })}
    </div>
  );
}
