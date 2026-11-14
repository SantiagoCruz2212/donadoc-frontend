import { ReactNode } from 'react';

export interface AlertProps {
  tipo: 'ok' | 'aviso' | 'error';
  children: ReactNode;
}