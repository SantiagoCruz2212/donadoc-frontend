import { create } from 'zustand';

import { DocumentoSeleccionadoStore } from './documento-seleccionado-types';

/** Dos features (documentos y extracciones) necesitan el mismo dato: por la regla de fronteras va a shared/. */
export const useDocumentoSeleccionadoStore = create<DocumentoSeleccionadoStore>()((set) => ({
  documentoId: null,
  seleccionar: (documentoId) => set({ documentoId }),
  limpiar: () => set({ documentoId: null }),
}));
