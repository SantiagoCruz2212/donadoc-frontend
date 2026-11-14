import { UseFormRegister } from 'react-hook-form';

import { Formulario, Valores } from '../../models/formatos-models';

export interface FormularioDinamicoProps {
  formulario: Formulario;
  register: UseFormRegister<Valores>;
  precargados: string[];
  errores: Record<string, string>;
  cargando: boolean;
  onGuardar: (completo: boolean) => void;
  onDescargar: () => void;
}
