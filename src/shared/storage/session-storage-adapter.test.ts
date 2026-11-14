import { sessionStorageAdapter } from './session-storage-adapter';

describe('sessionStorageAdapter', () => {
  it('guarda, lee y borra valores', () => {
    sessionStorageAdapter.setItem('k', 'v');
    expect(sessionStorageAdapter.getItem('k')).toBe('v');
    sessionStorageAdapter.removeItem('k');
    expect(sessionStorageAdapter.getItem('k')).toBeNull();
  });

  it('no falla si el navegador bloquea el almacenamiento', () => {
    const espia = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const espiaSet = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const espiaDel = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(sessionStorageAdapter.getItem('k')).toBeNull();
    expect(() => sessionStorageAdapter.setItem('k', 'v')).not.toThrow();
    expect(() => sessionStorageAdapter.removeItem('k')).not.toThrow();
    espia.mockRestore();
    espiaSet.mockRestore();
    espiaDel.mockRestore();
  });
});