import { Link } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import { LoginFormProps } from './props';
import styles from './styles.module.css';

export function LoginFormView({ register, errors, onSubmit, cargando, error }: LoginFormProps) {
  const { t } = useTranslations();
  return (
    <form onSubmit={onSubmit} className={styles.formulario} noValidate>
      <h1 className={styles.titulo}>{t.common.appName}</h1>
      <p className="suave">{t.auth.subtitle}</p>
      <Field etiqueta={t.auth.email} error={traducirValidacion(t.validation, errors.correo?.message)}>
        <input type="email" autoComplete="username" {...register('correo')} />
      </Field>
      <Field etiqueta={t.auth.password} error={traducirValidacion(t.validation, errors.clave?.message)}>
        <input type="password" autoComplete="current-password" {...register('clave')} />
      </Field>
      {error && <Alert tipo="error">{error}</Alert>}
      <Button type="submit" disabled={cargando}>
        {cargando ? t.auth.submitting : t.auth.submit}
      </Button>
      <Link to={RUTAS.olvideClave}>{t.auth.forgot}</Link>
    </form>
  );
}