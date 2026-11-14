import { navigateTo, registerNavigationHandler } from './session-handler';

describe('session-handler', () => {
  afterEach(() => registerNavigationHandler(null));

  it('usa la función de navegación registrada por el router', () => {
    const navegar = jest.fn();
    registerNavigationHandler(navegar);
    navigateTo('/login');
    expect(navegar).toHaveBeenCalledWith('/login');
  });
});