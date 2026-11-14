import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';
import { Card } from '@/shared/ui/components/card';

import { ExtraccionCard } from '../../components/extraccion-card';
import { useDecidirSugerencia } from '../../hooks/use-decidir-sugerencia';
import { useExtraer } from '../../hooks/use-extraer';
import { useExtracciones } from '../../hooks/use-extracciones';

/** Sección «Extracción con IA»: pedir la extracción y revisar las sugerencias (la IA propone, la persona decide). */
export default function ExtraccionesSection({ casoId }: { casoId: string }) {
  const { t } = useTranslations();
  const { extracciones, recargar, error: errorLista } = useExtracciones(casoId);
  const extraer = useExtraer(casoId, recargar);
  const decision = useDecidirSugerencia(recargar);
  const error = errorLista || extraer.error || decision.error;

  return (
    <>
      <Card titulo={t.extracciones.title}>
        <p className="suave">{t.extracciones.hint}</p>
        {error && <Alert tipo="error">{error}</Alert>}
        {extraer.aviso && <Alert tipo={extraer.aviso.tipo}>{extraer.aviso.texto}</Alert>}
        {!extraer.puedeExtraer && <p className="suave">{t.extracciones.selectDocument}</p>}
        <Button onClick={extraer.extraer} disabled={extraer.cargando || !extraer.puedeExtraer}>
          {extraer.cargando ? t.extracciones.extracting : t.extracciones.extract}
        </Button>
      </Card>
      {extracciones.map((x) => (
        <ExtraccionCard key={x.id} extraccion={x} onDecidir={decision.decidir} />
      ))}
    </>
  );
}