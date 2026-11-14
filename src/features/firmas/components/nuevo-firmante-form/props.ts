import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { NuevoFirmanteForm } from '../../models/firmas-models';

export interface NuevoFirmanteFormProps {
  register: UseFormRegister<NuevoFirmanteForm>;
  errors: FieldErrors<NuevoFirmanteForm>;
  onSubmit: () => void;
}
