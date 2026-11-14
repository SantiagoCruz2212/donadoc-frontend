import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { LoginForm } from '../../models/auth-models';

export interface LoginFormProps {
  register: UseFormRegister<LoginForm>;
  errors: FieldErrors<LoginForm>;
  onSubmit: () => void;
  cargando: boolean;
  error: string;
}