import { FieldProps } from './props';
import styles from './styles.module.css';

/** Etiqueta + control + mensaje de error de validación. */
export function Field({ etiqueta, error, children }: FieldProps) {
  return (
    <label className={styles.campo}>
      {etiqueta}
      {children}
      {error && (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </label>
  );
}