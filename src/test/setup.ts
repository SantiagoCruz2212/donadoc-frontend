import '@testing-library/jest-dom';

// jsdom reporta "en-US"; las pruebas arrancan en español como un navegador de Colombia.
Object.defineProperty(window.navigator, 'language', { value: 'es-CO', configurable: true });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
