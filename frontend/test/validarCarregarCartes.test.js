import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { carregarCartes } from '../script.js';

global.alert = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="contenidorCartes"></div>';
    document.getElementById('contenidorCartes').innerHTML = '';
});

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
    const cartesElements = document.querySelectorAll('.carta');
    expect(cartesElements.length).toBe(2);
});

// test('carregarCartes mostra un alert si falla la xarxa', async () => {
//     global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
//     await carregarCartes();
//     expect(global.alert).toHaveBeenCalledWith("No s'han pogut carregar les cartes. Comprova que el servidor està en marxa.");
// });

test('carregarCartes mostra un alert si falla la xarxa', async () => {
    const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => { });


    try {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));


        await carregarCartes();


        expect(global.alert).toHaveBeenCalledWith(
            "No s'han pogut carregar les cartes. Comprova que el servidor està en marxa."
        );


        expect(consoleSpy).toHaveBeenCalledWith(
            'Error en carregar les cartes des del servidor:',
            expect.any(Error)
        );
    } finally {
        consoleSpy.mockRestore();
    }
});
