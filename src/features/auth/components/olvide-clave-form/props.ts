import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { OlvideClaveForm, RestablecerClaveForm } from '../../models/auth-models';
import { PasoRecuperacion } from '../../hooks/use-olvide-clave';

interface FormBase<T extends object> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  onSubmit: () => void;
  cargando: boolean;
  error: string;
}

export interface OlvideClaveFormProps {
  paso: PasoRecuperacion;
  correo: string;
  correoForm: FormBase<OlvideClaveForm>;
  codigoForm: FormBase<RestablecerClaveForm>;
  onOtroCorreo: () => void;
}
