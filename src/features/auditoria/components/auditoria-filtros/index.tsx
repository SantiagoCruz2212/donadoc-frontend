import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Field } from '@/shared/ui/components/field';

import { ACCIONES_AUDITORIA, ENTIDADES_AUDITORIA } from '../../models/auditoria-models';
import { AuditoriaFiltrosProps } from './props';
import styles from './styles.module.css';

export function AuditoriaFiltros({ filtros, onCambiar, onFiltrar, onLimpiar }: AuditoriaFiltrosProps) {
  const { t } = useTranslations();
  return (
    <Card>
      <form
        className={styles.filtros}
        onSubmit={(e) => {
          e.preventDefault();
          onFiltrar();
        }}
      >
        <Field etiqueta={t.auditoria.entity}>
          <select value={filtros.entidad} onChange={(e) => onCambiar('entidad', e.target.value)}>
            <option value="">{t.auditoria.all}</option>
            {ENTIDADES_AUDITORIA.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        <Field etiqueta={t.auditoria.action}>
          <select value={filtros.accion} onChange={(e) => onCambiar('accion', e.target.value)}>
            <option value="">{t.auditoria.all}</option>
            {ACCIONES_AUDITORIA.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        <Field etiqueta={t.auditoria.from}>
          <input type="datetime-local" value={filtros.desde} onChange={(e) => onCambiar('desde', e.target.value)} />
        </Field>
        <Field etiqueta={t.auditoria.to}>
          <input type="datetime-local" value={filtros.hasta} onChange={(e) => onCambiar('hasta', e.target.value)} />
        </Field>
        <div className={styles.botones}>
          <Button type="submit">{t.auditoria.filter}</Button>
          <Button variante="secundario" onClick={onLimpiar}>
            {t.auditoria.clear}
          </Button>
        </div>
      </form>
    </Card>
  );
}
