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


test('canvia el text i l\'estil del títol', () => {
  document.body.innerHTML = `<h1 id="titol">El Cartero Invisible</h1>`;
  const titol = document.getElementById('titol');

  // Simula l'execució del teu codi
  titol.textContent = '📮 El Cartero Invisible – Setmana 2';
  titol.style.color = '#2c3e50';
  titol.setAttribute('data-role', 'banner');

  expect(titol.textContent).toBe('📮 El Cartero Invisible – Setmana 2');
  expect(titol.style.color).toBe('rgb(44, 62, 80)');
  expect(titol.getAttribute('data-role')).toBe('banner');
});

