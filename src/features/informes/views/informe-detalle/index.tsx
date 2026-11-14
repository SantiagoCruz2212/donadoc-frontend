import { useNavigate } from 'react-router-dom';

import { useTranslations } from '@/shared/config/i18n/use-translations';
import { RUTAS } from '@/shared/constants/constants';
import { Alert } from '@/shared/ui/components/alert';
import { Button } from '@/shared/ui/components/button';

import { InformeFormulario } from '../../components/informe-formulario';
import { useInforme } from '../../hooks/use-informe';

interface InformeDetalleViewProps {
  codigo: string;
  periodo: string;
}

/** Un informe de un periodo: formulario generado desde su esquema, con editor de tablas. */
export default function InformeDetalleView({ codigo, periodo }: InformeDetalleViewProps) {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const i = useInforme(codigo, periodo);
  return (
    <>
      <Button variante="enlace" onClick={() => navigate(RUTAS.informes)}>
        {t.informes.back}
      </Button>
      <h2>{i.informe?.plantilla.nombre ?? codigo}</h2>
      {i.error && <Alert tipo="error">{i.error}</Alert>}
      {i.aviso && !i.error && <Alert tipo="ok">{i.aviso}</Alert>}
      {!i.informe && !i.error && <p className="suave">{t.informes.loading}</p>}
      {i.informe && (
        <InformeFormulario
          informe={i.informe}
          valores={i.valores}
          calculados={i.calculados}
          errores={i.errores}
          cargando={i.cargando}
          onCambiarCampo={i.cambiarCampo}
          onCambiarCelda={i.cambiarCelda}
          onAgregarFila={i.agregarFila}
          onQuitarFila={i.quitarFila}
          onGuardar={(completo) => void i.guardar(completo)}
          onDescargar={() => void i.descargar()}
        />
      )}
    </>
  );
}
