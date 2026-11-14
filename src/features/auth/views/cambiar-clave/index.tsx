import { CambiarClaveFormView } from '../../components/cambiar-clave-form';
import { useCambiarClave } from '../../hooks/use-cambiar-clave';

/** Vista privada: cambiar la clave de la sesión actual. */
export default function CambiarClaveView() {
  const cambio = useCambiarClave();
  return <CambiarClaveFormView {...cambio} />;
}
