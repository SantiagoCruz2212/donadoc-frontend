import { OlvideClaveFormView } from '../../components/olvide-clave-form';
import { useOlvideClave } from '../../hooks/use-olvide-clave';
import styles from '../login/styles.module.css';

/** Vista pública: recuperar la clave con un código OTP enviado al correo. */
export default function OlvideClaveView() {
  const { paso, correo, correoForm, codigoForm, usarOtroCorreo } = useOlvideClave();
  return (
    <main className={styles.pagina}>
      <OlvideClaveFormView paso={paso} correo={correo} correoForm={correoForm} codigoForm={codigoForm} onOtroCorreo={usarOtroCorreo} />
    </main>
  );
}
