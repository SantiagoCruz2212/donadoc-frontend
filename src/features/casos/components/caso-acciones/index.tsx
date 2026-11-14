import { useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { TRANSICIONES_CASO } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';

import { CasoAccionesProps } from './props';
import styles from './styles.module.css';

/** Botones para pasar el caso a su siguiente estado válido; «contraindicado» pide la causa. Eliminar es solo para ADMIN_ORG. */
export function CasoAcciones({ estado, esAdmin, ocupado, error, aviso, onCambiar, onEliminar }: CasoAccionesProps) {
  const { t } = useTranslations();
  const [causa, setCausa] = useState('');
  const siguientes = TRANSICIONES_CASO[estado] ?? [];
  const puedeEliminar = esAdmin && (estado === 'BORRADOR' || estado === 'CONTRAINDICADO');
  if (siguientes.length === 0 && !puedeEliminar) return null;

  return (
    <div className={styles.acciones}>
      {error && <Alert tipo="error">{error}</Alert>}
      {aviso && !error && <Alert tipo="ok">{aviso}</Alert>}
      {siguientes.length > 0 && <span className="suave">{t.casos.changeState}:</span>}
      {siguientes.map((s) =>
        s === 'CONTRAINDICADO' ? (
          <span key={s} className={styles.contra}>
            <input aria-label={t.casos.contraindicationCause} placeholder={t.casos.contraindicationCause} value={causa} onChange={(e) => setCausa(e.target.value)} />
            <Button variante="peligro" disabled={ocupado || causa.trim() === ''} onClick={() => onCambiar(s, causa.trim())}>
              {t.casos.moveTo} {s}
            </Button>
          </span>
        ) : (
          <Button key={s} variante="secundario" disabled={ocupado} onClick={() => onCambiar(s)}>
            {t.casos.moveTo} {s}
          </Button>
        ),
      )}
      {puedeEliminar && (
        <Button
          variante="peligro"
          disabled={ocupado}
          onClick={() => {
            if (window.confirm(t.casos.deleteConfirm)) onEliminar();
          }}
        >
          {t.casos.delete}
        </Button>
      )}
    </div>
  );
}
