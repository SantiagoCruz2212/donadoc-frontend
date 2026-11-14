import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { CambiarClaveForm } from '../../models/auth-models';

export interface CambiarClaveFormProps {
  register: UseFormRegister<CambiarClaveForm>;
  errors: FieldErrors<CambiarClaveForm>;
  onSubmit: () => void;
  cargando: boolean;
  error: string;
  hecho: boolean;
}
