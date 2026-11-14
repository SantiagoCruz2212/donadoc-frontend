import { Decision, Extraccion } from '../../models/extracciones-models';

export interface ExtraccionCardProps {
  extraccion: Extraccion;
  onDecidir: (id: string, decision: Exclude<Decision, 'PENDIENTE'>, valorFinal?: string) => void;
}