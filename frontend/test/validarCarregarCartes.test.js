import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { carregarCartes } from '../js/script.js';

beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
        <div id="missatgeError" aria-live="polite"></div>
        <div id="contenidorCartes"></div>
    `;
});

afterEach(() => jest.restoreAllMocks());

test('carregarCartes carrega les cartes correctament i actualitza el DOM', async () => {
    const mockCartes = [
        { id: 1, remitent: 'Maria', contingut: 'Hola' },
        { id: 2, remitent: 'Joan', contingut: 'Adéu' }
    ];

    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCartes,
    });

    await carregarCartes();

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/cartas');
    expect(document.querySelectorAll('.carta').length).toBe(2);
    expect(document.querySelector('#missatgeError')).not.toHaveClass('visible');
});

test('carregarCartes mostra l\'error de connexió si falla la xarxa', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await carregarCartes();

    const error = document.querySelector('#missatgeError');
    expect(error).toHaveTextContent("No s'ha pogut connectar al servidor. Comprova que està en marxa.");
    expect(error).toHaveClass('visible');
    expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(TypeError));
});

test('carregarCartes mostra l\'error del servidor si respon amb un 500', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Internal Server Error' })
    });

    await carregarCartes();

    expect(document.querySelector('#missatgeError')).toHaveTextContent('Error intern del servidor (500)');
});

test('carregarCartes amaga l\'error anterior quan la petició torna a funcionar', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await carregarCartes();
    expect(document.querySelector('#missatgeError')).toHaveClass('visible');

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    await carregarCartes();
    expect(document.querySelector('#missatgeError')).not.toHaveClass('visible');
});