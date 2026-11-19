import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { CrearAccesoForm } from '../../models/accesos-models';

export interface AccesoFormProps {
  register: UseFormRegister<CrearAccesoForm>;
  errors: FieldErrors<CrearAccesoForm>;
  onSubmit: () => void;
  cargando: boolean;
}
