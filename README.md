# El Cartero Invisible - Setmana 6: El cicle de vida complet de les cartes

Aquest repositori conté la implementació de la **Setmana 6** del projecte **"El Cartero Invisible"**. Aquesta setmana l'oficina de correus assoleix la maduresa operativa: les cartes ja tenen un **cicle de vida complet (CRUD)**. Neixen (`POST`), es llegeixen (`GET`), es corregeixen (`PUT`) i es destrueixen (`DELETE`), i cada canvi queda desat al fitxer `cartas.json`. A més, la interfície és **responsive** i s'adapta a mòbil, tauleta i escriptori.

---

## ✨ Novetats de la setmana 6

### Client (frontend)
- Botó **«Editar»** a cada carta (targetes) i a cada fila de la taula, al costat d'«Eliminar».
- **Formulari d'edició inline** preomplert amb remitent, destinatari, contingut i personatge, amb validació de camps buits i botons «Desar» / «Cancel·lar».
- Funció `actualitzarCarta(id, dades)` amb `fetch` + `PUT`, capçalera `Content-Type: application/json` i cos amb `JSON.stringify`.
- Funció `eliminarCarta(id)` amb `fetch` + `DELETE`.
- Patró **«operació → refresc»**: després de cada `POST`, `PUT` o `DELETE` es crida `carregarCartes()` perquè la UI mostri exactament el que hi ha al servidor.
- **Indicador de càrrega** («Carregant…») mentre hi ha peticions `fetch` en curs, i **botons deshabilitats** durant les operacions.
- **Disseny responsive**: meta tag `viewport` i mediaqueries per a mòbil, tauleta i escriptori.

### Servidor (backend)
- Nou endpoint `PUT /cartas/{id}` que actualitza una carta i desa el fitxer JSON.
- `DELETE /cartas/{id}` desa el fitxer després d'eliminar.
- Tots els endpoints d'escriptura (`POST`, `PUT`, `DELETE`) persisteixen a `cartas.json`.
- Errors amb `HTTPException` i codis específics (`404`, `422`).

---

## 🏗️ Estructura del Projecte

```text
First Project/
├── .vscode/                 # Configuració de l'editor Visual Studio Code
├── .gitignore               # Arxius i directoris ignorats per Git
├── README.md                # Documentació oficial del projecte
├── backend/                 # Servidor FastAPI i lògica del backend
│   ├── .venv/               # Entorn virtual de Python (aïllat)
│   ├── tests/               # Proves automàtiques del servidor (pytest)
│   │   └── test_main.py     # Tests dels endpoints (GET, POST, PUT, DELETE)
│   ├── main.py              # Punt d'entrada del servidor FastAPI (endpoints CRUD)
│   ├── cartas.json          # Persistència de les cartes
│   ├── package-lock.json    # Control de versions de dependències
│   ├── pytest.ini           # Configuració de rutes per a pytest
│   └── requirements.txt     # Dependències de Python del projecte
└── frontend/                # Client web (HTML, CSS, JS)
    ├── node_modules/        # Mòduls i dependències de Node.js instal·lats
    ├── test/                # Proves automàtiques del client (Jest)
    │   └── saluda.test.js   # Tests del client (salutació, renderitzat, CRUD...)
    ├── index.html           # Estructura semàntica de la pàgina principal
    ├── package.json         # Configuració i dependències de Node.js (Jest, Testing Library)
    ├── package-lock.json    # Control de versions de dependències de Node.js
    ├── script.js            # Lògica, esdeveniments i peticions fetch (CRUD)
    └── style.css            # Estils, variables CSS i mediaqueries (responsive)
```

---

## 🔌 Arquitectura client-servidor

```text
┌──────────────────────┐    fetch (JSON)    ┌──────────────────────┐    llegeix/escriu    ┌─────────────┐
│  Frontend (navegador)│ ─────────────────► │  Backend (FastAPI)   │ ───────────────────► │ cartas.json │
│  HTML + CSS + JS     │ ◄───────────────── │  http://127.0.0.1:8000│ ◄─────────────────── │ (persistència)│
└──────────────────────┘   resposta JSON    └──────────────────────┘                       └─────────────┘
```

El client mai accedeix directament al fitxer: sempre passa pel servidor, que és la **font de veritat**.

---

## 📡 Endpoints de l'API

**URL base:** `http://127.0.0.1:8000`
**Documentació interactiva (Swagger):** `http://127.0.0.1:8000/docs`

### Model `Carta`

| Camp         | Tipus  | Descripció                          |
|--------------|--------|-------------------------------------|
| `id`         | int    | Identificador (l'assigna el servidor; no es pot canviar) |
| `remitent`   | string | Qui envia la carta                  |
| `destinatari`| string | A qui va dirigida                   |
| `contingut`  | string | Text de la carta                    |
| `personatge` | string | Personatge al qual s'escriu         |

### Resum

| Operació             | Mètode   | URL               | Èxit                         | Errors comuns              |
|----------------------|----------|-------------------|------------------------------|----------------------------|
| Llistar cartes       | `GET`    | `/cartas`         | `200` + llista               | —                          |
| Obtenir una carta    | `GET`    | `/cartas/{id}`    | `200` + carta                | `404` si no existeix       |
| Crear una carta      | `POST`   | `/cartas`         | `201` + carta creada         | `422` dades invàlides      |
| Actualitzar una carta| `PUT`    | `/cartas/{id}`    | `200` + carta actualitzada   | `404` / `422`              |
| Eliminar una carta   | `DELETE` | `/cartas/{id}`    | `200` (o `204`)              | `404` si no existeix       |

### `GET /cartas`
Retorna la llista de cartes.

- **Paràmetres (query, opcionals):** `limit` (màxim de cartes, per defecte `10`) i `offset` (quantes se salten, per defecte `0`), per a la paginació.
- **Exemple:** `GET /cartas?limit=1&offset=1`

```json
[
  {
    "id": 1,
    "remitent": "Maria",
    "destinatari": "Einstein",
    "contingut": "Hola, com estàs?",
    "personatge": "Einstein"
  }
]
```

### `GET /cartas/{id}`
Retorna una carta concreta.

- **Paràmetres (path):** `id` (int) — identificador de la carta.
- **Resposta `200`:**

```json
{
  "id": 1,
  "remitent": "Maria",
  "destinatari": "Einstein",
  "contingut": "Hola, com estàs?",
  "personatge": "Einstein"
}
```

- **Resposta `404`:**

```json
{ "detail": "Carta no trobada" }
```

### `POST /cartas`
Crea una carta nova i la desa a `cartas.json`.

- **Cos (JSON):** `remitent`, `destinatari`, `contingut`, `personatge` (tots obligatoris).
- **Exemple de petició:**

```json
{
  "remitent": "Maria",
  "destinatari": "Einstein",
  "contingut": "Hola, com estàs?",
  "personatge": "Einstein"
}
```

- **Resposta `201`:** la carta creada, amb el seu `id`.
- **Resposta `422`:** si falten camps o els tipus són incorrectes (validació automàtica de Pydantic).

### `PUT /cartas/{id}`
Actualitza **totes** les dades d'una carta existent (excepte l'`id`) i desa el fitxer.

- **Paràmetres (path):** `id` (int) — identificador de la carta a modificar.
- **Cos (JSON):** `remitent`, `destinatari`, `contingut`, `personatge` (tots obligatoris).
- **Exemple de petició** (`PUT /cartas/1`):

```json
{
  "remitent": "Maria",
  "destinatari": "Newton",
  "contingut": "Corregeixo l'adreça: la carta és per a Newton.",
  "personatge": "Newton"
}
```

- **Resposta `200`:**

```json
{
  "id": 1,
  "remitent": "Maria",
  "destinatari": "Newton",
  "contingut": "Corregeixo l'adreça: la carta és per a Newton.",
  "personatge": "Newton"
}
```

- **Resposta `404`:** `{ "detail": "Carta no trobada" }` si l'`id` no existeix.
- **Resposta `422`:** si el cos és invàlid.
- **Nota:** l'`id` mai canvia; sempre es manté el de la URL, encara que el client n'enviï un altre al cos.

### `DELETE /cartas/{id}`
Elimina una carta i desa el fitxer.

- **Paràmetres (path):** `id` (int) — identificador de la carta a eliminar.
- **Resposta `200`:**

```json
{ "missatge": "Carta eliminada" }
```

- **Resposta `404`:** `{ "detail": "Carta no trobada" }` si l'`id` no existeix.

---

## 📱 Disseny responsive

La pàgina inclou la meta tag `viewport` a l'`<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Les mediaqueries defineixen tres breakpoints:

| Dispositiu | Amplada de pantalla     | Disseny                                   |
|------------|-------------------------|-------------------------------------------|
| Mòbil      | `max-width: 768px`      | Una columna, tot apilat; botons a tota l'amplada |
| Tauleta    | `769px – 1024px`        | Dues columnes de cartes                   |
| Escriptori | `min-width: 1025px`     | Tres columnes i més espai                 |

S'han adaptat per a cada breakpoint el contenidor principal (`max-width` i `padding`), les targetes de cartes, el formulari (de dues columnes a una a mòbil), la barra de botons, la taula (amb scroll horitzontal a mòbil) i el buzón 📬 fixat.

---

## 🎨 Extres implementats

- **Tema clar/fosc:** botó `#btnTema` a dalt a la dreta. En fer clic s'afegeix o es treu la classe `tema-fosc` al `<body>`, i la preferència es desa a `localStorage` (clau `tema`, valor `"fosc"` o `"clar"`). Els estils es basen en variables CSS que el tema fosc redefineix.
- **Últim personatge:** en enviar una carta, es desa el personatge a `localStorage` (clau `ultimPersonatge`) i es preomple al formulari en carregar la pàgina.
- **Esborrany de la carta:** mentre s'escriu al `textarea`, el text es desa a `sessionStorage` (clau `cartaEnProces`) i es recupera en carregar la pàgina. S'esborra quan la carta s'envia correctament.

---

## 🐳 Docker (primers passos)

Aquesta setmana s'introdueix el concepte de **contenidor** i les primeres comandes. L'ús real amb Docker Compose arribarà més endavant.

```bash
# Descarrega i executa un servidor web nginx en segon pla,
# mapejant el port 8080 de la màquina al port 80 del contenidor
docker run -d -p 8080:80 nginx
```

Després, obre `http://localhost:8080` al navegador. El flag `-p 8080:80` és imprescindible: sense ell, el port del contenidor no és accessible des de la màquina.

---

## 🚀 Com executar el projecte

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload
```

El servidor queda disponible a `http://127.0.0.1:8000`.

### Frontend

Obre `frontend/index.html` amb un servidor local (per exemple, l'extensió *Live Server* de VS Code), ja que `script.js` es carrega com a mòdul ES. El backend ha d'estar en marxa perquè es carreguin les cartes.

---

## 🧪 Proves automàtiques

```bash
# Servidor (pytest + httpx)
cd backend
pytest

# Client (Jest + Testing Library)
cd frontend
npm test
```

---

## ✅ Checklist de la setmana 6

- [x] Botó «Editar» a cada carta que mostra un formulari preomplert.
- [x] Funció `actualitzarCarta()` amb `fetch` + `PUT`.
- [x] Edició de cartes integrada i llista refrescada després d'actualitzar.
- [x] Indicador de càrrega mentre es fan peticions.
- [x] Endpoint `PUT /cartas/{id}` al servidor, que actualitza el fitxer JSON.
- [x] Tots els endpoints (`GET`, `POST`, `PUT`, `DELETE`) funcionen i persisteixen.
- [x] Meta tag `viewport` a l'HTML.
- [x] Mediaqueries per a mòbil, tauleta i escriptori.
- [x] Disseny de les cartes, el buzón i el formulari adaptat a cada breakpoint.
- [x] Responsivitat provada amb les eines del navegador.
- [x] Tests de validació passats (client i servidor).