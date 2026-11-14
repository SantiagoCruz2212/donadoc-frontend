import { clases } from '@/shared/utils/utils';

import { AlertProps } from './props';
import styles from './styles.module.css';

export function Alert({ tipo, children }: AlertProps) {
  return (
    <p role={tipo === 'error' ? 'alert' : 'status'} className={clases(styles.alerta, styles[tipo])}>
      {children}
    </p>
  );
}