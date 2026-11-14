import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import { CambiarClaveFormProps } from './props';
import styles from './styles.module.css';

export function CambiarClaveFormView({ register, errors, onSubmit, cargando, error, hecho }: CambiarClaveFormProps) {
  const { t } = useTranslations();
  return (
    <Card titulo={t.auth.changeTitle}>
      <form onSubmit={onSubmit} className={styles.formulario} noValidate>
        <Field etiqueta={t.auth.currentPassword} error={traducirValidacion(t.validation, errors.claveActual?.message)}>
          <input type="password" autoComplete="current-password" {...register('claveActual')} />
        </Field>
        <Field etiqueta={t.auth.newPassword} error={traducirValidacion(t.validation, errors.nuevaClave?.message)}>
          <input type="password" autoComplete="new-password" {...register('nuevaClave')} />
        </Field>
        <Field etiqueta={t.auth.confirmPassword} error={traducirValidacion(t.validation, errors.confirmar?.message)}>
          <input type="password" autoComplete="new-password" {...register('confirmar')} />
        </Field>
        <p className="suave">{t.auth.policy}</p>
        {error && <Alert tipo="error">{error}</Alert>}
        {hecho && !error && <Alert tipo="ok">{t.auth.changeDone}</Alert>}
        <Button type="submit" disabled={cargando}>
          {cargando ? t.auth.changing : t.auth.changePassword}
        </Button>
      </form>
    </Card>
  );
}
