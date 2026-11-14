import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Chip } from '@/shared/ui/components/chip';
import { formatearFechaHora } from '@/shared/utils/utils';

import { CasosTableProps } from './props';

export function CasosTable({ casos, onAbrir }: CasosTableProps) {
  const { t, idioma } = useTranslations();
  const locale = idioma === 'en' ? 'en-US' : 'es-CO';
  return (
    <Card>
      <table>
        <thead>
          <tr>
            <th>{t.casos.donor}</th>
            <th>{t.casos.document}</th>
            <th>{t.casos.state}</th>
            <th>{t.casos.created}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {casos.map((c) => (
            <tr key={c.id}>
              <td>
                {c.donante?.nombres} {c.donante?.apellidos}
              </td>
              <td>
                {c.donante?.tipoDocumento} {c.donante?.numeroDocumento}
              </td>
              <td>
                <Chip texto={c.estado} />
              </td>
              <td>{formatearFechaHora(c.creadoEn, locale)}</td>
              <td>
                <Button variante="enlace" onClick={() => onAbrir(c.id)}>
                  {t.casos.open}
                </Button>
              </td>
            </tr>
          ))}
          {casos.length === 0 && (
            <tr>
              <td colSpan={5} className="suave">
                {t.casos.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}