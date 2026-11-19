import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import { PERFILES, ROLES_ASIGNABLES } from '../../models/accesos-models';
import { AccesoFormProps } from './props';
import styles from './styles.module.css';

export function AccesoForm({ register, errors, onSubmit, cargando }: AccesoFormProps) {
  const { t } = useTranslations();
  const v = (m?: string) => traducirValidacion(t.validation, m);
  return (
    <Card titulo={t.accesos.newAccess}>
      <p className="suave">{t.accesos.passwordHint}</p>
      <form onSubmit={onSubmit} className={styles.rejilla} noValidate>
        <Field etiqueta={t.accesos.email} error={v(errors.correo?.message)}>
          <input type="email" autoComplete="off" {...register('correo')} />
        </Field>
        <Field etiqueta={t.accesos.name} error={v(errors.nombre?.message)}>
          <input autoComplete="off" {...register('nombre')} />
        </Field>
        <Field etiqueta={t.accesos.role} error={v(errors.rol?.message)}>
          <select {...register('rol')}>
            {ROLES_ASIGNABLES.map((rol) => (
              <option key={rol} value={rol}>
                {t.accesos.roles[rol]}
              </option>
            ))}
          </select>
        </Field>
        <Field etiqueta={t.accesos.profile} error={v(errors.perfil?.message)}>
          <select {...register('perfil')}>
            {PERFILES.map((perfil) => (
              <option key={perfil} value={perfil}>
                {perfil || t.accesos.noProfile}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" className={styles.accion} disabled={cargando}>
          {cargando ? t.accesos.creating : t.accesos.create}
        </Button>
      </form>
    </Card>
  );
}
