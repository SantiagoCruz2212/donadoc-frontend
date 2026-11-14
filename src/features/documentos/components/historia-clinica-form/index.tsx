import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Field } from '@/shared/ui/components/field';
import { traducirValidacion } from '@/shared/utils/utils';

import { HistoriaClinicaFormProps } from './props';
import styles from './styles.module.css';

export function HistoriaClinicaForm({ register, errors, onSubmit, onUsarEjemplo, onArchivo, cargando }: HistoriaClinicaFormProps) {
  const { t } = useTranslations();
  return (
    <form onSubmit={onSubmit} noValidate>
      <Field etiqueta={t.documentos.placeholder} error={traducirValidacion(t.validation, errors.texto?.message)}>
        <textarea rows={7} placeholder={t.documentos.placeholder} {...register('texto')} />
      </Field>
      <div className={styles.acciones}>
        <Button type="submit" disabled={cargando}>
          {cargando ? t.documentos.registering : t.documentos.registerText}
        </Button>
        <Button variante="secundario" onClick={onUsarEjemplo}>
          {t.documentos.useExample}
        </Button>
        <label className={styles.archivo}>
          {t.documentos.orUpload}
          <input type="file" accept=".pdf,.txt" onChange={(e) => onArchivo(e.target.files?.[0])} />
        </label>
      </div>
    </form>
  );
}