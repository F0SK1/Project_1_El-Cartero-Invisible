import { getCookie, setCookie, esborrarCookie } from '../script.js';

beforeEach(() => {
    esborrarCookie('usuari_id');
    esborrarCookie('tema');
});

test('setCookie i getCookie funcionen amb cookies individuals', () => {
    setCookie('usuari_id', 'user_123', 30);
    setCookie('tema', 'fosc', 30);

    expect(getCookie('usuari_id')).toBe('user_123');
    expect(getCookie('tema')).toBe('fosc');
    expect(getCookie('no_existeix')).toBeNull();
});

test('les cookies codifiquen i descodifiquen els espais', () => {
    setCookie('nom', 'Maria Antònia', 1);
    expect(getCookie('nom')).toBe('Maria Antònia');
    esborrarCookie('nom');
});

test('esborrarCookie elimina la cookie', () => {
    setCookie('usuari_id', 'user_123', 30);
    esborrarCookie('usuari_id');
    expect(getCookie('usuari_id')).toBeNull();
});