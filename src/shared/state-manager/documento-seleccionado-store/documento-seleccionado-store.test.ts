import { useDocumentoSeleccionadoStore } from './documento-seleccionado-store';

describe('useDocumentoSeleccionadoStore', () => {
  it('selecciona y limpia el documento', () => {
    useDocumentoSeleccionadoStore.getState().seleccionar('d1');
    expect(useDocumentoSeleccionadoStore.getState().documentoId).toBe('d1');
    useDocumentoSeleccionadoStore.getState().limpiar();
    expect(useDocumentoSeleccionadoStore.getState().documentoId).toBeNull();
  });
});