# El Cartero Invisible - Setmana 5: Editem i eliminem cartes

Aquest repositori conté la implementació del projecte **"El Cartero Invisible"**. S'ha configurat l'entorn de desenvolupament complet, amb una arquitectura client-servidor, un backend en FastAPI, un frontend semàntic amb HTML/CSS/JS i els entorns de proves automàtiques configurats tant per al client com per al servidor.

---

## 🏗️ Estructura del Projecte

L'estructura de directoris del projecte s'organitza de la següent manera:

```text
First Project/
├── .vscode/                 # Configuració de l'editor Visual Studio Code
├── .gitignore               # Arxius i directoris ignorats per Git
├── README.md                # Documentació oficial del projecte
├── backend/                 # Servidor FastAPI i lògica del backend
│   ├── .venv/               # Entorn virtual de Python (aïllat)
│   ├── tests/               # Proves automàtiques del servidor (pytest)
│   │   └── test_main.py     # Test de verificació de l'endpoint inicial
│   ├── main.py              # Punt d'entrada del servidor FastAPI (endpoints)
│   ├── cartas.json          # Persistència de les cartes
│   ├── package-lock.json    # Control de versions de dependències
│   ├── pytest.ini           # Configuració de rutes per a pytest
│   └── requirements.txt     # Dependències de Python del projecte
└── frontend/                # Client web (HTML, CSS, JS)
    ├── node_modules/        # Mòduls i dependències de Node.js instal·lats
    ├── test/                # Proves automàtiques del client (Jest)
    ├── index.html           # Estructura semàntica de la pàgina principal
    ├── package.json         # Configuració i dependències de Node.js (Jest, Testing Library)
    ├── package-lock.json    # Control de versions de dependències de Node.js
    ├── script.js            # Lògica i esdeveniments en JavaScript
    └── style.css            # Estils i disseny amb pseudoclasses
```

---

## 📡 API REST

URL base: `http://127.0.0.1:8000`. Documentació interactiva (Swagger): `http://127.0.0.1:8000/docs`.

Totes les operacions d'escriptura (POST, PUT, DELETE) guarden els canvis al fitxer `cartas.json`.

| Mètode | URL            | Descripció                                  |
|--------|----------------|---------------------------------------------|
| GET    | `/cartas`      | Llista les cartes (`limit`, `offset`, `personatge` opcionals) |
| GET    | `/cartas/{id}` | Retorna una carta per ID                    |
| POST   | `/cartas`      | Crea una carta nova                         |
| PUT    | `/cartas/{id}` | Actualitza una carta existent               |
| DELETE | `/cartas/{id}` | Elimina una carta                           |

### PUT `/cartas/{id}`

Actualitza totes les dades d'una carta existent. L'ID no es pot modificar.

- **URL:** `http://127.0.0.1:8000/cartas/{id}`
- **Mètode:** `PUT`
- **Paràmetre de ruta:** `id` (enter): ID de la carta a modificar.
- **Cos (JSON):**

| Camp          | Tipus  | Obligatori | Descripció                          |
|---------------|--------|------------|-------------------------------------|
| `remitent`    | string | Sí         | Qui envia la carta                  |
| `destinatari` | string | No         | Qui la rep (per defecte `""`)       |
| `contingut`   | string | Sí         | Text de la carta                    |
| `personatge`  | string | No         | Personatge (per defecte `"Desconegut"`) |

**Exemple de petició** (`PUT /cartas/1`):

```json
{
  "remitent": "Ana",
  "destinatari": "Pere",
  "contingut": "Hola de nou, Pere!",
  "personatge": "Cartero"
}
```

**Exemple de resposta** (`200 OK`):

```json
{
  "remitent": "Ana",
  "destinatari": "Pere",
  "contingut": "Hola de nou, Pere!",
  "personatge": "Cartero",
  "id": 1
}
```

**Errors:**
- `404 Not Found`: no existeix cap carta amb aquest ID.

```json
{ "detail": "Carta no trobada" }
```

- `422 Unprocessable Entity`: falten camps obligatoris o tenen un tipus incorrecte.

### DELETE `/cartas/{id}`

Elimina una carta i guarda el resultat a `cartas.json`.

- **URL:** `http://127.0.0.1:8000/cartas/{id}`
- **Mètode:** `DELETE`
- **Paràmetre de ruta:** `id` (enter): ID de la carta a eliminar.

**Exemple de resposta** (`200 OK`):

```json
{
  "missatge": "Carta eliminada",
  "id": 1
}
```

**Errors:**
- `404 Not Found`: no existeix cap carta amb aquest ID.

```json
{ "detail": "Carta no trobada" }
```