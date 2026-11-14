import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import CasoResumenView from '@/features/casos/views/caso-resumen';
import DocumentosSection from '@/features/documentos/views/documentos-section';
import ExtraccionesSection from '@/features/extracciones/views/extracciones-section';
import FirmasSection from '@/features/firmas/views/firmas-section';
import { FormularioActivo } from '@/features/formatos/models/formatos-models';
import FormulariosSection from '@/features/formatos/views/formularios-section';

const SIN_FORMULARIO: FormularioActivo = { documentoId: null, estado: 'SIN_INICIAR', version: 0 };

/**
 * Detalle de un caso: compone las vistas de varios features. Vive en app/ porque un feature no puede importar
 * de otro (regla de fronteras). Lo que comparten: el documento seleccionado (shared/state-manager) y el formato
 * abierto, que los formatos informan y las firmas consumen a través de este componente.
 */
export default function CasoDetalleRoute() {
  const { casoId = '' } = useParams();
  const [formulario, setFormulario] = useState<FormularioActivo>(SIN_FORMULARIO);
  const [recarga, setRecarga] = useState(0);
  const alCambiarFormulario = useCallback((a: FormularioActivo) => setFormulario(a), []);
  const alFirmar = useCallback(() => setRecarga((n) => n + 1), []);
  return (
    <>
      <CasoResumenView casoId={casoId} />
      <DocumentosSection casoId={casoId} />
      <ExtraccionesSection casoId={casoId} />
      <FormulariosSection casoId={casoId} onFormularioChange={alCambiarFormulario} recarga={recarga} />
      <FirmasSection casoId={casoId} documentoId={formulario.documentoId} estadoDocumento={formulario.estado} onFirmado={alFirmar} />
    </>
  );
}
