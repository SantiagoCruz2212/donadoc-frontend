import { useTranslations } from '@/shared/config/i18n/use-translations';
import { Alert } from '@/shared/ui/components/alert';
import { Card } from '@/shared/ui/components/card';

import { DocumentosLista } from '../../components/documentos-lista';
import { HistoriaClinicaForm } from '../../components/historia-clinica-form';
import { useDocumentos } from '../../hooks/use-documentos';
import { useRegistrarHistoria } from '../../hooks/use-registrar-historia';

/** Sección «Historia clínica externa» del detalle de un caso. */
export default function DocumentosSection({ casoId }: { casoId: string }) {
  const { t } = useTranslations();
  const { documentos, documentoId, seleccionar, recargar, error: errorLista } = useDocumentos(casoId);
  const historia = useRegistrarHistoria(casoId, recargar);

  return (
    <Card titulo={t.documentos.title}>
      <p className="suave">{t.documentos.hint}</p>
      {(errorLista || historia.error) && <Alert tipo="error">{errorLista || historia.error}</Alert>}
      {historia.aviso && !historia.error && <Alert tipo="ok">{historia.aviso}</Alert>}
      <HistoriaClinicaForm
        register={historia.register}
        errors={historia.errors}
        onSubmit={historia.onSubmit}
        onUsarEjemplo={historia.usarEjemplo}
        onArchivo={historia.cargarArchivo}
        cargando={historia.cargando}
      />
      <DocumentosLista documentos={documentos} seleccionadoId={documentoId} onSeleccionar={seleccionar} />
    </Card>
  );
}