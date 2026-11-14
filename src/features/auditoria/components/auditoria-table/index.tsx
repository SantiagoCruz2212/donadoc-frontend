import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Chip } from '@/shared/ui/components/chip';
import { formatearFechaHora } from '@/shared/utils/utils';

import { AuditoriaTableProps } from './props';
import styles from './styles.module.css';

export function AuditoriaTable({ pagina, onAnterior, onSiguiente }: AuditoriaTableProps) {
  const { t, idioma } = useTranslations();
  const locale = idioma === 'en' ? 'en-US' : 'es-CO';
  return (
    <Card>
      <table>
        <thead>
          <tr>
            <th>{t.auditoria.date}</th>
            <th>{t.auditoria.user}</th>
            <th>{t.auditoria.action}</th>
            <th>{t.auditoria.entity}</th>
            <th>{t.auditoria.route}</th>
            <th>{t.auditoria.status}</th>
            <th>{t.auditoria.ip}</th>
          </tr>
        </thead>
        <tbody>
          {pagina.items.map((e) => (
            <tr key={e.id}>
              <td>{formatearFechaHora(e.fecha, locale)}</td>
              <td>{e.usuarioNombre ?? t.auditoria.system}</td>
              <td>
                <Chip texto={e.accion} />
              </td>
              <td>{e.entidad}</td>
              <td className={styles.ruta}>{e.ruta ?? '—'}</td>
              <td>{e.estadoHttp ?? '—'}</td>
              <td>{e.ip ?? '—'}</td>
            </tr>
          ))}
          {pagina.items.length === 0 && (
            <tr>
              <td colSpan={7} className="suave">
                {t.auditoria.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className={styles.paginacion}>
        <Button variante="secundario" disabled={pagina.page <= 1} onClick={onAnterior}>
          {t.auditoria.previous}
        </Button>
        <span className="suave">
          {t.auditoria.page} {pagina.page} {t.auditoria.of} {pagina.totalPages} · {pagina.total}
        </span>
        <Button variante="secundario" disabled={pagina.page >= pagina.totalPages} onClick={onSiguiente}>
          {t.auditoria.next}
        </Button>
      </div>
    </Card>
  );
}
