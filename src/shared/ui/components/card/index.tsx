import { CardProps } from './props';
import styles from './styles.module.css';

export function Card({ titulo, children }: CardProps) {
  return (
    <section className={styles.tarjeta}>
      {titulo && <h3 className={styles.titulo}>{titulo}</h3>}
      {children}
    </section>
  );
}