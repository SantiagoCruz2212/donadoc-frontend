import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { CrearCasoForm } from '../../models/casos-models';

export interface NuevoCasoFormProps {
  register: UseFormRegister<CrearCasoForm>;
  errors: FieldErrors<CrearCasoForm>;
  onSubmit: () => void;
  cargando: boolean;
  error: string;
}