import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { carregarCartes, actualitzarCarta } from '../js/script.js';

afterEach(() => jest.restoreAllMocks());

const resposta = (status, detail) => ({ ok: false, status, json: async () => ({ detail }) });

test('mostra el missatge específic per a un 404', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = jest.fn().mockResolvedValue(resposta(404, 'Carta no trobada'));

  await carregarCartes();

  expect(document.querySelector('#missatgeError')).toHaveTextContent('La carta que busques no existeix.');
});

test('mostra el missatge de dades invàlides per a un 422', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = jest.fn().mockResolvedValue(resposta(422, 'El contingut no pot estar buit'));

  await carregarCartes();

  expect(document.querySelector('#missatgeError')).toHaveTextContent('Les dades enviades no són vàlides');
});

test('mostra error de connexió si el servidor no respon', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

  await carregarCartes();

  expect(document.querySelector('#missatgeError'))
    .toHaveTextContent("No s'ha pogut connectar al servidor. Comprova que està en marxa.");
});

test('actualitzarCarta llança un error amb el missatge del servidor', async () => {
  global.fetch = jest.fn().mockResolvedValue(resposta(404, 'Carta no trobada'));

  await expect(actualitzarCarta(999, {})).rejects.toThrow('La carta que busques no existeix.');
});