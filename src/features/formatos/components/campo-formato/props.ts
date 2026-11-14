import { UseFormRegister } from 'react-hook-form';

import { CampoFormato, Valores } from '../../models/formatos-models';

export interface CampoFormatoProps {
  campo: CampoFormato;
  register: UseFormRegister<Valores>;
  error?: string;
  soloLectura: boolean;
  precargado: boolean;
}
