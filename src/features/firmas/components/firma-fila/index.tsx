import { useState } from 'react';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Chip } from '@/shared/ui/components/chip';
import { formatearFechaHora } from '@/shared/utils/utils';

import { FirmaFilaProps } from './props';
import styles from './styles.module.css';

/** Una firma: pendiente (enviar código y firmar) o ya sellada (comprobar integridad). */
export function FirmaFila({ firma, verificacion, ocupada, onEnviarCodigo, onFirmar, onComprobar }: FirmaFilaProps) {
  const { t, idioma } = useTranslations();
  const [codigo, setCodigo] = useState('');
  const firmada = firma.estado === 'FIRMADA';
  return (
    <li className={styles.fila}>
      <div className={styles.cabecera}>
        <strong>{firma.firmanteNombre}</strong> <span className="suave">· {firma.firmanteRol} · {firma.firmanteCorreo}</span>
        <Chip texto={firmada ? 'FIRMADA' : t.firmas.pending} />
        {firma.firmadoEn && (
          <span className="suave">
            {t.firmas.signedAt} {formatearFechaHora(firma.firmadoEn, idioma === 'en' ? 'en-US' : 'es-CO')}
          </span>
        )}
      </div>
      {firmada ? (
        <>
          <p className="suave">
            {firma.proveedor} · {t.firmas.seal} <code>{firma.hashFirma?.slice(0, 16)}…</code>
          </p>
          <Button variante="secundario" disabled={ocupada} onClick={() => onComprobar(firma.id)}>
            {t.firmas.check}
          </Button>
          {verificacion && (
            <Alert tipo={verificacion.valida ? 'ok' : 'error'}>
              {verificacion.valida ? t.firmas.valid : `${t.firmas.invalid} ${verificacion.motivos.join(' · ')}`}
            </Alert>
          )}
        </>
      ) : (
        <div className={styles.acciones}>
          <Button variante="secundario" disabled={ocupada} onClick={() => onEnviarCodigo(firma.id)}>
            {t.firmas.sendCode}
          </Button>
          <input
            aria-label={`${t.firmas.code} ${firma.firmanteNombre}`}
            className={styles.codigo}
            inputMode="numeric"
            maxLength={6}
            placeholder={t.firmas.code}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
          />
          <Button disabled={ocupada || codigo.length !== 6} onClick={() => onFirmar(firma.id, codigo)}>
            {ocupada ? t.firmas.verifying : t.firmas.verify}
          </Button>
        </div>
      )}
    </li>
  );
}
