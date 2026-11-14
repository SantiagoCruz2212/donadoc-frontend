import { LoginFormView } from '../../components/login-form';
import { useLogin } from '../../hooks/use-login';
import styles from './styles.module.css';

/** Vista: solo renderiza. La lógica vive en useLogin. */
export default function LoginView() {
  const login = useLogin();
  return (
    <main className={styles.pagina}>
      <LoginFormView {...login} />
    </main>
  );
}