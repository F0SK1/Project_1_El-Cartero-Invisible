# El Cartero Invisible - Setmana 8: El carnet de soci i el gran buzón

Aquest repositori conté la implementació de la **Setmana 8** del projecte **"El Cartero Invisible"**[cite: 102]. Aquesta setmana l'aplicació reconeix els usuaris mitjançant **cookies**[cite: 103], incorpora proves i diagnosi amb **Swagger, Network i els logs d'Uvicorn**[cite: 104, 111], i redissenya el buzón amb **CSS Grid avançat (`grid-template-areas`)**[cite: 103, 104].

---

## ✨ Novetats de la setmana 8

- **Client (Cookies):** funcions `getCookie`, `setCookie` i `esborrarCookie` per gestionar el carnet `usuari_id` (30 dies), missatge de benvinguda personalitzat al `<header>`, botó «Esborrar carnet» i enviament de `credentials: 'include'` a les peticions `fetch`[cite: 105, 106, 107, 108].
- **Servidor (Identitat):** lectura/escriptura de cookies amb `Request` i `Response`, associació de `usuari_id` a cada carta (`POST /cartas`), i nous endpoints `POST /login`, `GET /perfil` (retorna `401` si no hi ha sessió) i `DELETE /logout`[cite: 109, 110, 111].
- **Diagnosi:** verificació de les capçaleres `Cookie` / `Set-Cookie` a la pestanya *Network* del navegador i lectura dels logs d'Uvicorn.
- **Disseny (`#buzon`):** reestructuració interior del buzón amb `grid-template-areas`, `grid-area` i posicionament explícit (`grid-column` / `grid-row`), mantenint `position: fixed`[cite: 112, 113].

---

## 🏗️ Estructura del Projecte

```text
cartero-invisible/
├── .gitignore               # Ignora .env, .venv, node_modules, etc.
├── README.md                # Documentació del projecte
├── backend/                 # Servidor FastAPI
│   ├── .env                 # Variables d'entorn (no a Git)
│   ├── .env.example         # Plantilla de variables d'entorn
│   ├── main.py              # Endpoints CRUD + identitat (/login, /perfil, /logout)
│   ├── cartas.json          # Persistència de les cartes
│   ├── pytest.ini           # Configuració de pytest
│   ├── requirements.txt     # Dependències de Python
│   └── tests/test_main.py   # Tests d'endpoints i cookies (pytest)
└── frontend/                # Client web
    ├── assets/              # Recursos estàtics
    ├── css/style.css        # Variables CSS, tema fosc, Grid avançat i responsive
    ├── js/script.js         # Lògica CRUD, storage i gestió de cookies
    ├── html/index.html           # Estructura semàntica
    ├── package.json         # Dependències de Node.js (Jest)
    └── tests/               # Tests del client (setup.js, cookies.test.js)