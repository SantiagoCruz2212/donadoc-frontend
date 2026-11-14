import { ChipProps } from './props';
import styles from './styles.module.css';

export function Chip({ texto }: ChipProps) {
  return <span className={styles.chip}>{texto}</span>;
}