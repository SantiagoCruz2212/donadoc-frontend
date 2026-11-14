import { Decision, Sugerencia } from '../../models/extracciones-models';

export interface SugerenciaFilaProps {
  sugerencia: Sugerencia;
  onDecidir: (id: string, decision: Exclude<Decision, 'PENDIENTE'>, valorFinal?: string) => void;
}