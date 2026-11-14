import { useTranslations } from '@/shared/config/i18n/use-translations';
import { TIPOS_DOCUMENTO } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import { NuevoCasoFormProps } from './props';
import styles from './styles.module.css';

export function NuevoCasoForm({ register, errors, onSubmit, cargando, error }: NuevoCasoFormProps) {
  const { t } = useTranslations();
  const v = (m?: string) => traducirValidacion(t.validation, m);
  return (
    <Card titulo={t.casos.newCase}>
      <form onSubmit={onSubmit} className={styles.rejilla} noValidate>
        <Field etiqueta={t.casos.documentType} error={v(errors.tipoDocumento?.message)}>
          <select {...register('tipoDocumento')}>
            {TIPOS_DOCUMENTO.map((tipo) => (
              <option key={tipo}>{tipo}</option>
            ))}
          </select>
        </Field>
        <Field etiqueta={t.casos.documentNumber} error={v(errors.numeroDocumento?.message)}>
          <input {...register('numeroDocumento')} />
        </Field>
        <Field etiqueta={t.casos.names} error={v(errors.nombres?.message)}>
          <input {...register('nombres')} />
        </Field>
        <Field etiqueta={t.casos.surnames} error={v(errors.apellidos?.message)}>
          <input {...register('apellidos')} />
        </Field>
        <Button type="submit" className={styles.accion} disabled={cargando}>
          {cargando ? t.casos.creating : t.casos.create}
        </Button>
      </form>
      {error && <Alert tipo="error">{error}</Alert>}
    </Card>
  );
}