import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Field } from '@/shared/ui/components/field';

import { CampoFormatoProps } from './props';
import styles from './styles.module.css';

/** Un campo del formato: el control depende del tipo declarado en el esquema. */
export function CampoFormatoView({ campo, register, error, soloLectura, precargado }: CampoFormatoProps) {
  const { t } = useTranslations();
  // Un solo elemento: la etiqueta de Field es una columna flex y cada fragmento suelto caería en su propia línea.
  const etiqueta = (
    <span>
      {campo.etiqueta}
      {campo.requerido && <span aria-hidden="true"> *</span>}
      {precargado && <em className={styles.precargado}> · {t.formatos.prefilled}</em>}
    </span>
  );

  if (campo.tipo === 'booleano') {
    return (
      <label className={styles.casilla}>
        <input type="checkbox" disabled={soloLectura} {...register(campo.clave)} />
        {etiqueta}
        {error && (
          <span role="alert" className={styles.error}>
            {error}
          </span>
        )}
      </label>
    );
  }

  return (
    <Field etiqueta={etiqueta} error={error}>
      {campo.tipo === 'areaTexto' ? (
        <textarea rows={3} disabled={soloLectura} {...register(campo.clave)} />
      ) : campo.tipo === 'seleccion' ? (
        <select disabled={soloLectura} {...register(campo.clave)}>
          <option value="">{t.formatos.select}</option>
          {(campo.opciones ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={campo.tipo === 'fecha' ? 'date' : campo.tipo === 'numero' ? 'number' : 'text'}
          disabled={soloLectura}
          {...register(campo.clave, campo.tipo === 'numero' ? { valueAsNumber: true } : undefined)}
        />
      )}
    </Field>
  );
}
