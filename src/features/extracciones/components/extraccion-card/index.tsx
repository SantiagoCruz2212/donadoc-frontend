import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Card } from '@/shared/ui/components/card';
import { Chip } from '@/shared/ui/components/chip';
import { formatearFechaHora } from '@/shared/utils/utils';

import { SugerenciaFila } from '../sugerencia-fila';
import { ExtraccionCardProps } from './props';

export function ExtraccionCard({ extraccion: x, onDecidir }: ExtraccionCardProps) {
  const { t, idioma } = useTranslations();
  const locale = idioma === 'en' ? 'en-US' : 'es-CO';
  const titulo = (
    <>
      {t.extracciones.extraction} <Chip texto={x.estado} />{' '}
      <span className="suave">
        {x.proveedor} · {x.intentos} {t.extracciones.attempts} · {formatearFechaHora(x.solicitadoEn, locale)}
      </span>
    </>
  );
  return (
    <Card titulo={titulo}>
      {x.sugerencias.length === 0 ? (
        <p className="suave">{t.extracciones.noSuggestions}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t.extracciones.field}</th>
              <th>{t.extracciones.suggestedValue}</th>
              <th>{t.extracciones.confidence}</th>
              <th>{t.extracciones.decision}</th>
            </tr>
          </thead>
          <tbody>
            {x.sugerencias.map((s) => (
              <SugerenciaFila key={s.id} sugerencia={s} onDecidir={onDecidir} />
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}