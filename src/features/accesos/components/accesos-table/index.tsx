import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';
import { Chip } from '@/shared/ui/components/chip';
import { formatearFechaHora } from '@/shared/utils/utils';

import { AccesosTableProps } from './props';

export function AccesosTable({ accesos, onNuevaClave, ocupado }: AccesosTableProps) {
  const { t, idioma } = useTranslations();
  const locale = idioma === 'en' ? 'en-US' : 'es-CO';
  return (
    <Card titulo={t.accesos.list}>
      <table>
        <thead>
          <tr>
            <th>{t.accesos.email}</th>
            <th>{t.accesos.name}</th>
            <th>{t.accesos.role}</th>
            <th>{t.accesos.profile}</th>
            <th>{t.accesos.createdAt}</th>
            <th>{t.accesos.actions}</th>
          </tr>
        </thead>
        <tbody>
          {accesos.map((a) => (
            <tr key={a.id}>
              <td>{a.correo}</td>
              <td>{a.nombre}</td>
              <td>
                <Chip texto={t.accesos.roles[a.rol]} />
              </td>
              <td>{a.perfil ?? '—'}</td>
              <td>{formatearFechaHora(a.creadoEn, locale)}</td>
              <td>
                {a.rol === 'SUPER_ADMIN' ? (
                  '—'
                ) : (
                  <Button variante="secundario" disabled={ocupado} onClick={() => onNuevaClave(a.id)}>
                    {t.accesos.resetPassword}
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {accesos.length === 0 && (
            <tr>
              <td colSpan={6} className="suave">
                {t.accesos.empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
