import { memo } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { clases } from '@/shared/utils/utils';

import { formatearNumero } from '../../models/calculos';
import { ColumnaTabla } from '../../models/informes-models';
import { FilaEditorProps } from './props';
import styles from './styles.module.css';

/**
 * Una fila de la tabla. Está memoizada: solo se vuelve a dibujar cuando cambian SUS datos, sus errores o sus columnas,
 * de modo que escribir en una celda no redibuja las demás filas (tablas de ~12 filas × ~50 columnas).
 */
function FilaEditorBase({ idBase, columnas, indice, rotulo, fila, calculada, errores, libre, onCambiarCelda, onQuitarFila }: FilaEditorProps) {
  const { t } = useTranslations();
  const idFila = `${idBase}-e${indice}`;
  const nombreFila = libre ? `${t.informes.row} ${rotulo}` : rotulo;

  const control = (col: ColumnaTabla) => {
    const idError = `${idFila}-${col.clave}`;
    const error = errores.celdas[col.clave];
    const comunes = {
      'aria-label': `${nombreFila} · ${col.etiqueta}`,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? idError : undefined,
    };
    const valor = fila[col.clave];
    if (col.tipo === 'seleccion') {
      return (
        <select {...comunes} value={typeof valor === 'string' ? valor : ''} onChange={(e) => onCambiarCelda(indice, col.clave, e.target.value || undefined)}>
          <option value="">{t.informes.select}</option>
          {(col.opciones ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    if (col.tipo === 'numero') {
      return (
        <input
          {...comunes}
          type="number"
          min={0}
          step="any"
          value={typeof valor === 'number' ? valor : ''}
          onChange={(e) => onCambiarCelda(indice, col.clave, e.target.value === '' ? undefined : Number(e.target.value))}
        />
      );
    }
    return (
      <input
        {...comunes}
        type={col.tipo === 'fecha' ? 'date' : 'text'}
        value={typeof valor === 'string' ? valor : ''}
        onChange={(e) => onCambiarCelda(indice, col.clave, e.target.value || undefined)}
      />
    );
  };

  return (
    <tr>
      <th scope="row" className={styles.rotulo}>
        <span>{rotulo}</span>
        {libre && (
          <Button variante="enlace" aria-label={`${t.informes.removeRow} ${rotulo}`} onClick={() => onQuitarFila(indice)}>
            {t.informes.removeRowShort}
          </Button>
        )}
        {errores.fila && (
          <span role="alert" id={idFila} className={styles.error}>
            {errores.fila}
          </span>
        )}
      </th>
      {columnas.map((col) => {
        const error = errores.celdas[col.clave];
        if (col.formula) {
          const v = calculada[col.clave];
          return (
            <td key={col.clave} className={clases(styles.celda, styles.calculada)}>
              <input
                readOnly
                tabIndex={-1}
                aria-label={`${nombreFila} · ${col.etiqueta} (${t.informes.calculated})`}
                value={typeof v === 'number' ? formatearNumero(v) : ''}
              />
            </td>
          );
        }
        return (
          <td key={col.clave} className={styles.celda}>
            {control(col)}
            {error && (
              <span role="alert" id={`${idFila}-${col.clave}`} className={styles.error}>
                {error}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

export const FilaEditor = memo(FilaEditorBase);
