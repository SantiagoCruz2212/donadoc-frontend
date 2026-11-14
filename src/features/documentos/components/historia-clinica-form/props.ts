import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { TextoForm } from '../../models/documentos-models';

export interface HistoriaClinicaFormProps {
  register: UseFormRegister<TextoForm>;
  errors: FieldErrors<TextoForm>;
  onSubmit: () => void;
  onUsarEjemplo: () => void;
  onArchivo: (archivo: File | undefined) => void;
  cargando: boolean;
}