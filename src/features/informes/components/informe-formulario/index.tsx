import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Chip } from '@/shared/ui/components/chip';

import { FilaTabla } from '../../models/informes-models';
import { CampoInformeView } from '../campo-informe';
import { TablaEditor } from '../tabla-editor';
import { InformeFormularioProps } from './props';
import styles from './styles.module.css';

/** Formulario del informe generado desde su esquema: una sección por bloque, un control por campo y un editor por tabla. */
export function InformeFormulario({
  informe,
  valores,
  calculados,
  errores,
  cargando,
  onCambiarCampo,
  onCambiarCelda,
  onAgregarFila,
  onQuitarFila,
  onGuardar,
  onDescargar,
}: InformeFormularioProps) {
  const { t } = useTranslations();
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onGuardar(false);
      }}
    >
      <p className="suave">
        {informe.plantilla.nombre} · {t.informes.period} {informe.periodo} · {t.informes.state} <Chip texto={informe.estado} />
        {informe.version > 0 && (
          <>
            {' '}
            · {t.informes.version} {informe.version}
          </>
        )}
      </p>
      {informe.plantilla.esquema.secciones.map((s) => (
        <fieldset key={s.titulo} className={styles.seccion}>
          <legend>{s.titulo}</legend>
          <div className={styles.rejilla}>
            {s.campos.map((c) =>
              c.tipo === 'tabla' ? (
                <div key={c.clave} className={styles.tabla}>
                  <h4 className={styles.tituloTabla}>
                    {c.etiqueta}
                    {c.requerido && <span aria-hidden="true"> *</span>}
                  </h4>
                  <TablaEditor
                    campo={c}
                    filas={(valores[c.clave] as FilaTabla[] | undefined) ?? []}
                    calculada={calculados[c.clave]}
                    errores={errores}
                    onCambiarCelda={onCambiarCelda}
                    onAgregarFila={onAgregarFila}
                    onQuitarFila={onQuitarFila}
                  />
                </div>
              ) : (
                <CampoInformeView key={c.clave} campo={c} valor={valores[c.clave]} error={errores[c.clave]} onCambiar={onCambiarCampo} />
              ),
            )}
          </div>
        </fieldset>
      ))}
      <div className={styles.acciones}>
        <Button type="submit" variante="secundario" disabled={cargando}>
          {cargando ? t.informes.saving : t.informes.saveDraft}
        </Button>
        <Button disabled={cargando} onClick={() => onGuardar(true)}>
          {t.informes.complete}
        </Button>
        {informe.estado === 'COMPLETO' && (
          <Button variante="enlace" onClick={onDescargar}>
            {t.informes.download}
          </Button>
        )}
      </div>
    </form>
  );
}
