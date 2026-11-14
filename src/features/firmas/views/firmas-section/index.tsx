import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';
import { Card } from '@/shared/ui/components/card';

import { FirmaFila } from '../../components/firma-fila';
import { NuevoFirmanteFormView } from '../../components/nuevo-firmante-form';
import { useFirmas } from '../../hooks/use-firmas';

interface FirmasSectionProps {
  casoId: string;
  /** Documento (el PDF del formato) que se firma; null mientras no esté completo. */
  documentoId: string | null;
  /** Estado del documento: COMPLETO admite firmantes, FIRMADO ya no. */
  estadoDocumento: string;
  /** Se llama al sellar una firma, para que el formato refresque su estado. */
  onFirmado?: () => void;
}

/** Sección «Firmas» del detalle de un caso. */
export default function FirmasSection({ casoId, documentoId, estadoDocumento, onFirmado }: FirmasSectionProps) {
  const { t } = useTranslations();
  const habilitado = documentoId !== null && (estadoDocumento === 'COMPLETO' || estadoDocumento === 'FIRMADO');
  const f = useFirmas(casoId, habilitado ? documentoId : null, onFirmado); // no se consultan firmas de un formato sin completar

  return (
    <Card titulo={t.firmas.title}>
      <p className="suave">{t.firmas.hint}</p>
      {!habilitado ? (
        <Alert tipo="aviso">{t.firmas.needComplete}</Alert>
      ) : (
        <>
          {f.error && <Alert tipo="error">{f.error}</Alert>}
          {f.aviso && !f.error && <Alert tipo="ok">{f.aviso}</Alert>}
          {estadoDocumento === 'FIRMADO' && <Alert tipo="ok">{t.firmas.allSigned}</Alert>}
          {f.firmas.length === 0 ? (
            <p className="suave">{t.firmas.none}</p>
          ) : (
            <ul>
              {f.firmas.map((firma) => (
                <FirmaFila
                  key={firma.id}
                  firma={firma}
                  verificacion={f.verificaciones[firma.id]}
                  ocupada={f.enviando === firma.id}
                  onEnviarCodigo={(id) => void f.enviarCodigo(id)}
                  onFirmar={(id, codigo) => void f.firmar(id, codigo)}
                  onComprobar={(id) => void f.comprobar(id)}
                />
              ))}
            </ul>
          )}
          {estadoDocumento !== 'FIRMADO' && <NuevoFirmanteFormView register={f.register} errors={f.errors} onSubmit={f.agregar} />}
        </>
      )}
    </Card>
  );
}
