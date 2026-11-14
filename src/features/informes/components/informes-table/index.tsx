import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Chip } from '@/shared/ui/components/chip';
import { Field } from '@/shared/ui/components/field';
import { formatearFechaHora } from '@/shared/utils/utils';

import { InformesTableProps } from './props';
import styles from './styles.module.css';

/** Informes de la organización, del periodo más reciente al más antiguo, con filtro por informe y paginación. */
export function InformesTable({ pagina, plantillas, codigo, onFiltrar, onAbrir, onAnterior, onSiguiente }: InformesTableProps) {
  const { t, idioma } = useTranslations();
  const locale = idioma === 'en' ? 'en-US' : 'es-CO';
  return (
    <Card titulo={t.informes.listTitle}>
      <div className={styles.filtro}>
        <Field etiqueta={t.informes.filterBy}>
          <select value={codigo} onChange={(e) => onFiltrar(e.target.value)}>
            <option value="">{t.informes.all}</option>
            {plantillas.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <table>
        <thead>
          <tr>
            <th>{t.informes.report}</th>
            <th>{t.informes.period}</th>
            <th>{t.informes.state}</th>
            <th>{t.informes.version}</th>
            <th>{t.informes.updated}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {pagina.items.map((i) => (
            <tr key={i.id}>
              <td>{i.nombre}</td>
              <td>{i.periodo}</td>
              <td>
                <Chip texto={i.estado} />
              </td>
              <td>{i.version}</td>
              <td>{formatearFechaHora(i.actualizadoEn, locale)}</td>
              <td>
                <Button variante="enlace" aria-label={`${t.informes.open} ${i.nombre} ${i.periodo}`} onClick={() => onAbrir(i)}>
                  {t.informes.open}
                </Button>
              </td>
            </tr>
          ))}
          {pagina.items.length === 0 && (
            <tr>
              <td colSpan={6} className="suave">
                {t.informes.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className={styles.paginacion}>
        <Button variante="secundario" disabled={pagina.page <= 1} onClick={onAnterior}>
          {t.informes.previous}
        </Button>
        <span className="suave">
          {t.informes.pageLabel} {pagina.page} {t.informes.of} {pagina.totalPages} · {pagina.total}
        </span>
        <Button variante="secundario" disabled={pagina.page >= pagina.totalPages} onClick={onSiguiente}>
          {t.informes.next}
        </Button>
      </div>
    </Card>
  );
}
