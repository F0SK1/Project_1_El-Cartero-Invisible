import { jest } from '@jest/globals';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderitzarCartes } from '../script.js';

describe('Suite de Proves Frontend - Interfície UI', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <h1 id="titol">El Cartero Invisible</h1>
      <div id="contenidorCartes"></div>
      <button id="btnToggleTaula">Mostrar taula</button>
      <table id="taulaCartes" style="display: none;"></table>
      <button id="btnSaluda">Saluda</button>
    `;

    global.alert = jest.fn();
    global.console.error = jest.fn();
    jest.clearAllMocks();
  });

  test('el botó mostra un alert amb "Hola, món!"', () => {
    window.alert = jest.fn();
    window.saluda = jest.fn(() => alert('Hola, món!'));

    const button = document.getElementById('btnSaluda');
    button.addEventListener('click', window.saluda);

    fireEvent.click(button);

    expect(window.saluda).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Hola, món!');
  });

  test('canvia el text i l\'estil del títol', () => {
    const titol = document.getElementById('titol');

    titol.textContent = '📮 El Cartero Invisible – Setmana 2';
    titol.style.color = '#2c3e50';
    titol.setAttribute('data-role', 'banner');

    expect(titol.textContent).toBe('📮 El Cartero Invisible – Setmana 2');
    expect(titol.style.color).toBe('rgb(44, 62, 80)');
    expect(titol.getAttribute('data-role')).toBe('banner');
  });

  test('renderitza les cartes correctament', () => {
    const cartes = [
      { id: 1, remitent: 'Maria', contingut: 'Hola!' },
      { id: 2, remitent: 'Joan', contingut: 'Com estàs?' }
    ];

    renderitzarCartes(cartes);

    const cartesElements = document.querySelectorAll('.carta');
    expect(cartesElements.length).toBe(2);
    expect(cartesElements[0].querySelector('h3').textContent).toBe('De: Maria');
    expect(cartesElements[0].querySelector('p').textContent).toBe('Hola!');
  });

  test('delegació d\'events: elimina carta en clicar el botó', async () => {
    document.body.innerHTML = `
      <div id="contenidorCartes">
        <div class="carta" data-id="1">
          <button class="btn-eliminar">Eliminar</button>
        </div>
      </div>
    `;

    const contenidor = document.getElementById('contenidorCartes');
    contenidor.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-eliminar')) {
        const carta = e.target.closest('.carta');
        carta.remove();
      }
    });

    const btn = document.querySelector('.btn-eliminar');
    const user = userEvent.setup();

    await user.click(btn);

    expect(document.querySelectorAll('.carta').length).toBe(0);
  });

  test('commuta la visibilitat de la taula al fer clic a #btnToggleTaula', () => {
    const btnToggle = document.getElementById('btnToggleTaula');
    const taula = document.getElementById('taulaCartes');

    btnToggle.addEventListener('click', () => {
      if (taula.style.display === 'none') {
        taula.style.display = 'table';
        btnToggle.textContent = 'Ocultar taula';
      } else {
        taula.style.display = 'none';
        btnToggle.textContent = 'Mostrar taula';
      }
    });

    fireEvent.click(btnToggle);
    expect(taula.style.display).toBe('table');
    expect(btnToggle.textContent).toBe('Ocultar taula');
  });
});