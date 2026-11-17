import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { fireEvent, waitFor } from '@testing-library/dom';
import { renderitzarCartes, actualitzarCarta, eliminarCarta } from '../js/script.js';

const API = 'http://127.0.0.1:8000/cartas';

const carta = {
  id: 1,
  remitent: 'Maria',
  destinatari: 'Joan',
  contingut: 'Hola!',
  personatge: 'Cartero'
};

beforeEach(() => {
  document.body.innerHTML = `
    <div id="missatgeError" aria-live="polite"></div>
    <div id="contenidorCartes"></div>
    <table><tbody id="cosTaulaCartes"></tbody></table>
  `;
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('actualitzarCarta (PUT)', () => {
  test('envia un PUT amb les dades en JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const dades = { remitent: 'Ana', destinatari: 'Pere', contingut: 'Nou', personatge: 'X' };

    const resultat = await actualitzarCarta(1, dades);

    expect(global.fetch).toHaveBeenCalledWith(`${API}/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dades)
    });
    expect(resultat).toBe(true);
  });

  test('llança un error si el servidor respon amb 404', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Carta no trobada' })
    });

    await expect(actualitzarCarta(99, carta)).rejects.toThrow('La carta que busques no existeix.');
  });
});

describe('eliminarCarta (DELETE)', () => {
  test('fa el DELETE i refresca la llista', async () => {
    renderitzarCartes([carta]);
    expect(document.querySelectorAll('.carta').length).toBe(1);

    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true })                                // DELETE
      .mockResolvedValueOnce({ ok: true, json: async () => [] });         // GET

    await eliminarCarta(1);

    expect(global.fetch).toHaveBeenNthCalledWith(1, `${API}/1`, { method: 'DELETE' });
    expect(global.fetch).toHaveBeenNthCalledWith(2, API);
    expect(document.querySelectorAll('.carta').length).toBe(0);
  });

  test('mostra l\'error 404 si la carta no existeix', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Carta no trobada' })
    });

    const resultat = await eliminarCarta(999);

    expect(resultat).toBe(false);
    expect(document.querySelector('#missatgeError')).toHaveTextContent('La carta que busques no existeix.');
    expect(document.querySelector('#missatgeError')).toHaveClass('visible');
  });
});

describe('Edició inline', () => {
  test('el botó Editar mostra un formulari preomplert', () => {
    renderitzarCartes([carta]);

    fireEvent.click(document.querySelector('.btn-editar'));

    const form = document.querySelector('.form-edicio');
    expect(form).toBeInTheDocument();
    expect(form.elements['remitent'].value).toBe('Maria');
    expect(form.elements['destinatari'].value).toBe('Joan');
    expect(form.elements['contingut'].value).toBe('Hola!');
    expect(form.elements['personatge'].value).toBe('Cartero');
  });

  test('no envia res i mostra l\'error si hi ha un camp buit', () => {
    global.fetch = jest.fn();
    renderitzarCartes([carta]);
    fireEvent.click(document.querySelector('.btn-editar'));

    const form = document.querySelector('.form-edicio');
    form.elements['remitent'].value = '   ';
    fireEvent.submit(form);

    expect(document.querySelector('#missatgeError')).toHaveTextContent('Tots els camps són obligatoris!');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('en desar fa el PUT i refresca la llista amb les dades noves', async () => {
    const actualitzada = { ...carta, contingut: 'Contingut editat' };
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true })                                     // PUT
      .mockResolvedValueOnce({ ok: true, json: async () => [actualitzada] });  // GET

    renderitzarCartes([carta]);
    fireEvent.click(document.querySelector('.btn-editar'));

    const form = document.querySelector('.form-edicio');
    form.elements['contingut'].value = 'Contingut editat';
    fireEvent.submit(form);

    await waitFor(() => {
      expect(document.querySelector('.carta p').textContent).toBe('Contingut editat');
    });

    const [url, opcions] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API}/1`);
    expect(opcions.method).toBe('PUT');
    expect(JSON.parse(opcions.body).contingut).toBe('Contingut editat');
  });

  test('en desar mostra l\'error 422 si el servidor rebutja les dades', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: "El camp 'contingut' no pot estar buit" })
    });

    renderitzarCartes([carta]);
    fireEvent.click(document.querySelector('.btn-editar'));
    fireEvent.submit(document.querySelector('.form-edicio'));

    await waitFor(() => {
      expect(document.querySelector('#missatgeError')).toHaveTextContent('Les dades enviades no són vàlides');
    });
  });
});

describe('Indicador de càrrega', () => {
  test('mostra "Carregant…" i deshabilita els botons durant la petició', async () => {
    renderitzarCartes([carta]);

    let resoldre;
    global.fetch = jest.fn()
      .mockReturnValueOnce(new Promise((r) => { resoldre = r; }))             // DELETE pendent
      .mockResolvedValueOnce({ ok: true, json: async () => [] });             // GET

    const promesa = eliminarCarta(1);

    const indicador = document.querySelector('#indicadorCarrega');
    expect(indicador).toHaveTextContent('Carregant…');
    expect(indicador.style.display).toBe('block');
    expect(document.querySelector('.btn-editar')).toBeDisabled();
    expect(document.querySelector('.btn-eliminar')).toBeDisabled();

    resoldre({ ok: true });
    await promesa;

    expect(document.querySelector('#indicadorCarrega').style.display).toBe('none');
  });
});