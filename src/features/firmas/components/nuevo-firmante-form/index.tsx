import { useTranslations } from '@/shared/config/i18n/use-translations';
import { ROLES_FIRMANTE } from '@/shared/constants/constants';
import { Button } from '@/shared/ui/components/button';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import { NuevoFirmanteFormProps } from './props';
import styles from './styles.module.css';

export function NuevoFirmanteFormView({ register, errors, onSubmit }: NuevoFirmanteFormProps) {
  const { t } = useTranslations();
  return (
    <form onSubmit={onSubmit} className={styles.formulario} noValidate>
      <Field etiqueta={t.firmas.name} error={traducirValidacion(t.validation, errors.firmanteNombre?.message)}>
        <input {...register('firmanteNombre')} />
      </Field>
      <Field etiqueta={t.firmas.role} error={traducirValidacion(t.validation, errors.firmanteRol?.message)}>
        <select {...register('firmanteRol')}>
          {ROLES_FIRMANTE.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>
      <Field etiqueta={t.firmas.email} error={traducirValidacion(t.validation, errors.firmanteCorreo?.message)}>
        <input type="email" {...register('firmanteCorreo')} />
      </Field>
      <Button type="submit">{t.firmas.add}</Button>
    </form>
  );
}
