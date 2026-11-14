import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { Componente, ComponenteForm } from '../../models/casos-models';

export interface ComponentesPanelProps {
  componentes: Componente[];
  register: UseFormRegister<ComponenteForm>;
  errors: FieldErrors<ComponenteForm>;
  /** true cuando el componente a registrar se rescató (oculta la causa). */
  rescatado: boolean;
  onSubmit: () => void;
  error: string;
}
