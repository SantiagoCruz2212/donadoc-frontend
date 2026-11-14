import { useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Button } from '@/shared/ui/components/button';
import { Chip } from '@/shared/ui/components/chip';
import { formatearPorcentaje } from '@/shared/utils/utils';

import { SugerenciaFilaProps } from './props';
import styles from './styles.module.css';

/** Una sugerencia de la IA: muestra el valor y su confianza, y permite aceptar, modificar o rechazar. */
export function SugerenciaFila({ sugerencia: s, onDecidir }: SugerenciaFilaProps) {
  const { t } = useTranslations();
  const [corregido, setCorregido] = useState('');
  const revisada = s.decision !== 'PENDIENTE';
  const valorMostrado = s.decision === 'ACEPTADA' || s.decision === 'MODIFICADA' ? s.valorFinal : s.valorSugerido;

  return (
    <tr>
      <td>{s.campo}</td>
      <td>{valorMostrado}</td>
      <td>{formatearPorcentaje(s.confianza)}</td>
      <td>
        {revisada ? (
          <Chip texto={s.decision} />
        ) : (
          <div className={styles.acciones}>
            <Button onClick={() => onDecidir(s.id, 'ACEPTADA')}>{t.extracciones.accept}</Button>
            <input
              className={styles.corregido}
              aria-label={t.extracciones.correctedValue}
              placeholder={t.extracciones.correctedValue}
              value={corregido}
              onChange={(e) => setCorregido(e.target.value)}
            />
            <Button variante="secundario" disabled={!corregido.trim()} onClick={() => onDecidir(s.id, 'MODIFICADA', corregido.trim())}>
              {t.extracciones.modify}
            </Button>
            <Button variante="peligro" onClick={() => onDecidir(s.id, 'RECHAZADA')}>
              {t.extracciones.reject}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}