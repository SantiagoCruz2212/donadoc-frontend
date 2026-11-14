import { ReactNode } from 'react';

export interface FieldProps {
  /** Texto de la etiqueta, o contenido (p. ej. con un asterisco de obligatorio). */
  etiqueta: ReactNode;
  error?: string;
  children: ReactNode;
}
