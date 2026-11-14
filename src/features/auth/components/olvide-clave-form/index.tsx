import { Link } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import styles from '../login-form/styles.module.css';
import { OlvideClaveFormProps } from './props';

/** Los tres pasos de «olvidé mi clave»: correo → código y clave nueva → listo. */
export function OlvideClaveFormView({ paso, correo, correoForm, codigoForm, onOtroCorreo }: OlvideClaveFormProps) {
  const { t } = useTranslations();

  if (paso === 'listo') {
    return (
      <div className={styles.formulario}>
        <h1 className={styles.titulo}>{t.auth.forgotTitle}</h1>
        <Alert tipo="ok">{t.auth.resetDone}</Alert>
        <Link to={RUTAS.login}>{t.auth.backToLogin}</Link>
      </div>
    );
  }

  if (paso === 'codigo') {
    const { register, errors, onSubmit, cargando, error } = codigoForm;
    return (
      <form onSubmit={onSubmit} className={styles.formulario} noValidate>
        <h1 className={styles.titulo}>{t.auth.forgotTitle}</h1>
        <Alert tipo="ok">{t.auth.codeSent}</Alert>
        <p className="suave">{correo}</p>
        <Field etiqueta={t.auth.code} error={traducirValidacion(t.validation, errors.codigo?.message)}>
          <input inputMode="numeric" maxLength={6} autoComplete="one-time-code" {...register('codigo')} />
        </Field>
        <Field etiqueta={t.auth.newPassword} error={traducirValidacion(t.validation, errors.nuevaClave?.message)}>
          <input type="password" autoComplete="new-password" {...register('nuevaClave')} />
        </Field>
        <Field etiqueta={t.auth.confirmPassword} error={traducirValidacion(t.validation, errors.confirmar?.message)}>
          <input type="password" autoComplete="new-password" {...register('confirmar')} />
        </Field>
        <p className="suave">{t.auth.policy}</p>
        {error && <Alert tipo="error">{error}</Alert>}
        <Button type="submit" disabled={cargando}>
          {cargando ? t.auth.resetting : t.auth.resetPassword}
        </Button>
        <Button variante="enlace" onClick={onOtroCorreo}>
          {t.auth.otherEmail}
        </Button>
      </form>
    );
  }

  const { register, errors, onSubmit, cargando, error } = correoForm;
  return (
    <form onSubmit={onSubmit} className={styles.formulario} noValidate>
      <h1 className={styles.titulo}>{t.auth.forgotTitle}</h1>
      <p className="suave">{t.auth.forgotHint}</p>
      <Field etiqueta={t.auth.email} error={traducirValidacion(t.validation, errors.correo?.message)}>
        <input type="email" autoComplete="username" {...register('correo')} />
      </Field>
      {error && <Alert tipo="error">{error}</Alert>}
      <Button type="submit" disabled={cargando}>
        {cargando ? t.auth.sending : t.auth.sendCode}
      </Button>
      <Link to={RUTAS.login}>{t.auth.backToLogin}</Link>
    </form>
  );
}
