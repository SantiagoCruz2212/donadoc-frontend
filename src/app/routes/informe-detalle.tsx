import { useParams } from 'react-router-dom';

import InformeDetalleView from '@/features/informes/views/informe-detalle';

/** Detalle de un informe periódico: toma el código y el periodo de la URL. */
export default function InformeDetalleRoute() {
  const { codigo = '', periodo = '' } = useParams();
  return <InformeDetalleView codigo={codigo} periodo={periodo} />;
}
