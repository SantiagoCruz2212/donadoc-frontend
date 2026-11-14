import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Field } from '@/shared/ui/components/field';

import { CampoInformeProps } from './props';
import styles from './styles.module.css';

/** Un campo simple del informe (texto, fecha, selección, número, casilla): el control depende del tipo del esquema. */
export function CampoInformeView({ campo, valor, error, onCambiar }: CampoInformeProps) {
  const { t } = useTranslations();
  const etiqueta = (
    <span>
      {campo.etiqueta}
      {campo.requerido && <span aria-hidden="true"> *</span>}
    </span>
  );

  if (campo.tipo === 'booleano') {
    return (
      <label className={styles.casilla}>
        <input type="checkbox" checked={valor === true} onChange={(e) => onCambiar(campo.clave, e.target.checked)} />
        {etiqueta}
        {error && (
          <span role="alert" className={styles.error}>
            {error}
          </span>
        )}
      </label>
    );
  }

  const texto = typeof valor === 'string' || typeof valor === 'number' ? String(valor) : '';
  return (
    <Field etiqueta={etiqueta} error={error}>
      {campo.tipo === 'areaTexto' ? (
        <textarea rows={3} value={texto} onChange={(e) => onCambiar(campo.clave, e.target.value)} />
      ) : campo.tipo === 'seleccion' ? (
        <select value={texto} onChange={(e) => onCambiar(campo.clave, e.target.value)}>
          <option value="">{t.informes.select}</option>
          {(campo.opciones ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : campo.tipo === 'numero' ? (
        <input type="number" value={texto} onChange={(e) => onCambiar(campo.clave, e.target.value === '' ? '' : Number(e.target.value))} />
      ) : (
        <input type={campo.tipo === 'fecha' ? 'date' : 'text'} value={texto} onChange={(e) => onCambiar(campo.clave, e.target.value)} />
      )}
    </Field>
  );
}
