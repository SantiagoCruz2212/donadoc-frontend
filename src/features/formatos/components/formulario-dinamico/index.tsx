import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Chip } from '@/shared/ui/components/chip';

import { CampoFormatoView } from '../campo-formato';
import { FormularioDinamicoProps } from './props';
import styles from './styles.module.css';

/** Formulario generado desde el esquema del formato: una sección por bloque y un control por campo. */
export function FormularioDinamico({ formulario, register, precargados, errores, cargando, onGuardar, onDescargar }: FormularioDinamicoProps) {
  const { t } = useTranslations();
  const firmado = formulario.estado === 'FIRMADO';
  const conPdf = formulario.estado === 'COMPLETO' || firmado;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar(false);
      }}
    >
      <p className="suave">
        {formulario.plantilla.nombre} · {t.formatos.state} <Chip texto={formulario.estado} />
        {formulario.version > 0 && (
          <>
            {' '}
            · {t.formatos.version} {formulario.version}
          </>
        )}
      </p>
      {firmado && <Alert tipo="aviso">{t.formatos.signedReadonly}</Alert>}
      {formulario.plantilla.esquema.secciones.map((s) => (
        <fieldset key={s.titulo} className={styles.seccion} disabled={firmado}>
          <legend>{s.titulo}</legend>
          <div className={styles.rejilla}>
            {s.campos.map((c) => (
              <CampoFormatoView key={c.clave} campo={c} register={register} error={errores[c.clave]} soloLectura={firmado} precargado={precargados.includes(c.clave)} />
            ))}
          </div>
        </fieldset>
      ))}
      <div className={styles.acciones}>
        <Button type="submit" variante="secundario" disabled={cargando || firmado}>
          {cargando ? t.formatos.saving : t.formatos.saveDraft}
        </Button>
        <Button disabled={cargando || firmado} onClick={() => onGuardar(true)}>
          {t.formatos.complete}
        </Button>
        {conPdf && (
          <Button variante="enlace" onClick={onDescargar}>
            {t.formatos.download}
          </Button>
        )}
      </div>
    </form>
  );
}
