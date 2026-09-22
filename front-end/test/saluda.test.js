import { jest } from '@jest/globals';
import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

test('el botó mostra un alert amb "Hola, món!"', () => {
  document.body.innerHTML = `<button id="btnSaluda">Saluda</button>`;

  // Mock de window.alert per poder-lo verificar
  window.alert = jest.fn();
  window.saluda = jest.fn(() => alert('Hola, món!'));

  const button = document.getElementById('btnSaluda');
  button.addEventListener('click', window.saluda);

  fireEvent.click(button);

  expect(window.saluda).toHaveBeenCalled();
  expect(window.alert).toHaveBeenCalledWith('Hola, món!');
});
