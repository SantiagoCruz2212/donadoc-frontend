import { clases } from '@/shared/utils/utils';

import { ButtonProps } from './props';
import styles from './styles.module.css';

export function Button({ variante = 'primario', className, type = 'button', ...resto }: ButtonProps) {
  return <button type={type} className={clases(styles.boton, styles[variante], className)} {...resto} />;
}