import { useTranslations } from '@/shared/config/i18n/use-translations';
import { TIPOS_COMPONENTE } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Chip } from '@/shared/ui/components/chip';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import { ComponentesPanelProps } from './props';
import styles from './styles.module.css';

export function ComponentesPanel({ componentes, register, errors, rescatado, onSubmit, error }: ComponentesPanelProps) {
  const { t } = useTranslations();
  return (
    <Card titulo={t.casos.componentsTitle}>
      <p className="suave">{t.casos.componentsHint}</p>
      {error && <Alert tipo="error">{error}</Alert>}
      {componentes.length === 0 ? (
        <p className="suave">{t.casos.noComponents}</p>
      ) : (
        <ul className={styles.lista}>
          {componentes.map((c) => (
            <li key={c.id}>
              <Chip texto={c.tipoComponente} /> {c.rescatado ? t.casos.rescued : `${t.casos.notRescuedCause}: ${c.causaNoRescate ?? ''}`}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit} className={styles.formulario} noValidate>
        <Field etiqueta={t.casos.componentType}>
          <select {...register('tipoComponente')}>
            {TIPOS_COMPONENTE.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        <label className={styles.casilla}>
          <input type="checkbox" {...register('rescatado')} />
          {t.casos.rescued}
        </label>
        {!rescatado && (
          <Field etiqueta={t.casos.notRescuedCause} error={traducirValidacion(t.validation, errors.causaNoRescate?.message)}>
            <input {...register('causaNoRescate')} />
          </Field>
        )}
        <Button type="submit">{t.casos.addComponent}</Button>
      </form>
    </Card>
  );
}
