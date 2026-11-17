# El Cartero Invisible - Setmana 9: La sang freda davant els contratemps

Aquest repositori conté la implementació de la **Setmana 9** del projecte **"El Cartero Invisible"**. Aquesta setmana l'aplicació es torna **robusta i professional**: el client gestiona els errors amb `async/await` i `try/catch` mostrant missatges clars, el servidor segella cada resposta amb el codi d'estat correcte mitjançant `HTTPException`, i el formulari es maqueta amb **Flexbox**.

---

## ✨ Novetats de la setmana 9

- **Client (gestió d'errors):** totes les peticions `fetch` (`carregarCartes`, `enviarCarta`, `actualitzarCarta`, `eliminarCarta`) estan refactoritzades amb `async/await` i `try/catch`. Les funcions `comprovarResposta()`, `missatgePerCodi()` i `gestionarError()` tradueixen cada error (404, 422, 500 i errors de xarxa) en un missatge amigable. `mostrarError()` és l'únic lloc on es mostren errors: ja no queda cap `alert()` al projecte.
- **Servidor (`HTTPException`):** els endpoints llancen `HTTPException` amb el codi i el missatge adequats (`404` «Carta no trobada», `422` per a dades invàlides) i retornen els codis d'èxit correctes (`201` per a `POST`, `204` per a `DELETE`). A més de Pydantic, hi ha una validació addicional que rebutja un `contingut` format només per espais.
- **Disseny (`#formCarta`):** formulari reestructurat amb **Flexbox**: contenidor `flex` en columna amb `gap`, files de camps (`.fila-camps`) amb `flex-wrap`, camps amb `flex: 1` i `min-width`, `textarea` amb `flex-grow` i botó d'enviament alineat a la dreta amb `align-self: flex-end`. En mòbil les files passen a columna.
- **Accessibilitat:** el `div#missatgeError` porta `aria-live="polite"` perquè els lectors de pantalla anunciïn els errors.
- **Tests:** la suite de `pytest` + `httpx` cobreix ara la gestió d'errors (404, 422 i contingut buit) i els codis d'estat correctes. Actualment: **22 tests en verd**.

---

## 📋 Codis d'estat de l'API

| Endpoint | Èxit | Errors |
| --- | --- | --- |
| `GET /cartas` | `200` + llista (admet `limit` i `offset`) | — |
| `GET /cartas/{id}` | `200` + carta | `404` si no existeix |
| `POST /cartas` | `201` + carta creada | `422` dades invàlides |
| `PUT /cartas/{id}` | `200` + carta actualitzada | `404` / `422` |
| `DELETE /cartas/{id}` | `204` (sense cos) | `404` si no existeix |
| `POST /login` | `200` + cookie `usuari_id` | — |
| `GET /perfil` | `200` + dades de l'usuari | `401` si no hi ha cookie |
| `DELETE /logout` | `200` + cookie esborrada | — |
| `GET /config` | `200` (indica si la IA està configurada, mai exposa la clau) | — |

Quan hi ha un error, el servidor respon amb un JSON de l'estil `{ "detail": "Carta no trobada" }`, que el client llegeix per construir el missatge per a l'usuari.

### Missatges d'error al client

| Situació | Missatge per a l'usuari |
| --- | --- |
| `404` | «La carta que busques no existeix.» |
| `422` | «Les dades enviades no són vàlides. Revisa els camps.» |
| `500` | «Hi ha hagut un error al servidor. Torna a provar més tard.» |
| Error de xarxa | «No s'ha pogut connectar al servidor. Comprova que està en marxa.» |

---

## 🧱 Funcionalitats heretades (setmanes 1–8)

- **CRUD de cartes** amb FastAPI i persistència en `cartas.json`, pintades al client com a targetes amb **CSS Grid**.
- **Identitat amb cookies:** carnet `usuari_id` (30 dies), missatge de benvinguda, botó «Esborrar carnet» i `credentials: 'include'` a les peticions. Endpoints `POST /login`, `GET /perfil` i `DELETE /logout`.
- **Comptador de visites** amb la cookie `visites`, que el servidor incrementa a cada `GET /perfil`.
- **Tema clar/fosc** amb variables CSS i pseudo-elements.
- **Buzón fix** maquetat amb `grid-template-areas`, `grid-area` i posicionament explícit (`grid-column` / `grid-row`).
- **Disseny responsiu** amb *media queries* (escriptori, tauleta i mòbil).
- **Taula de cartes** amb `overflow` i truncat de text, i `z-index` per al buzón.
- **Emmagatzematge al client:** cookies, `localStorage` i `sessionStorage`.

---

## 🏗️ Estructura del Projecte

```text
cartero-invisible/
├── .gitignore               # Ignora .env, .venv, node_modules, etc.
├── README.md                # Documentació del projecte
├── backend/                 # Servidor FastAPI
│   ├── .env                 # Variables d'entorn (no a Git)
│   ├── .env.example         # Plantilla de variables d'entorn
│   ├── main.py              # Endpoints CRUD + HTTPException + identitat (/login, /perfil, /logout)
│   ├── cartas.json          # Persistència de les cartes
│   ├── pytest.ini           # Configuració de pytest
│   ├── requirements.txt     # Dependències de Python
│   └── tests/test_main.py   # Tests d'endpoints, errors i cookies (pytest + httpx)
└── frontend/                # Client web
    ├── assets/              # Recursos estàtics
    ├── css/style.css        # Variables CSS, tema fosc, Grid, Flexbox i responsive
    ├── js/script.js         # Lògica CRUD, gestió d'errors (async/await), storage i cookies
    ├── html/index.html      # Estructura semàntica
    ├── package.json         # Dependències de Node.js (Jest)
    └── tests/               # Tests del client (setup.js, cookies.test.js)
```

---

## 🚀 Posada en marxa

### Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate     # Windows (Git Bash). A Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # i omple les variables necessàries
uvicorn main:app --reload
```

El servidor queda disponible a `http://127.0.0.1:8000` i la documentació interactiva (Swagger) a `http://127.0.0.1:8000/docs`.

### Frontend

Serveix la carpeta del projecte amb una extensió com *Live Server* (per defecte, `http://127.0.0.1:5500`, que és l'origen permès per CORS) i obre `index.html`.

---

## 🧪 Tests

### Servidor (pytest + httpx)

```bash
cd backend
pytest
```

Cobreix, entre d'altres:

- CRUD complet (`POST` → `GET` → `PUT` → `DELETE`) i persistència real a `cartas.json`.
- Gestió d'errors: `404` amb el missatge `Carta no trobada`, `422` per dades incompletes i per contingut buit.
- Codis d'estat d'èxit: `201` per a `POST` i `204` per a `DELETE`.
- Cookies: `Set-Cookie` a `/login`, lectura a `/perfil` i `401` sense cookie.
- `/config` no exposa mai la clau de l'API.
- Capçaleres CORS.

### Client (Jest)

```bash
cd frontend
npm install
npm test
```

---

## ✅ Checklist de la setmana 9

- [x] Peticions `fetch` refactoritzades amb `async/await` i `try/catch`.
- [x] `mostrarError()` com a únic lloc on es mostren errors (cap `alert()`).
- [x] Gestió específica dels codis 404, 422, 500 i errors de xarxa.
- [x] `div#missatgeError` revisat, amb `aria-live="polite"`.
- [x] `HTTPException` als endpoints del servidor amb codis d'estat adequats.
- [x] Codis d'èxit ajustats (`201` per a `POST`, `204` per a `DELETE`).
- [x] Formulari redissenyat amb Flexbox, organitzat i responsiu.
- [x] Formulari provat en diferents mides de pantalla.
- [x] Tests de validació passant (client i servidor).

---

## 🔭 Què ve després

- **Setmana 10:** codi modular (mòduls ES6 `api.js`, `dom.js`, `utils.js`, `app.js`), API separada en `routers` de FastAPI, documentació al README i BEM al CSS amb fonts web.
- **Setmana 11:** integració de la IA, reutilitzant la gestió d'errors d'aquesta setmana per a casos com la clau invàlida o la quota esgotada.