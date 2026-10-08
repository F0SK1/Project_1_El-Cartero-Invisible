# El Cartero Invisible - Setmana 1: Obrim l'oficina de correus

Aquest repositori conté la implementació de la **Setmana 3** del projecte **"El Cartero Invisible"**. Durant aquesta setmana s'ha configurat l'entorn de desenvolupament complet, establint les bases del projecte amb una arquitectura client-servidor, un backend en FastAPI, un frontend semàntic amb HTML/CSS/JS i els entorns de proves automàtiques configurats tant per al client com per al servidor[cite: 1, 5, 7, 11, 12].

---

## 🏗️ Estructura del Projecte

L'estructura de directoris del projecte s'organitza de la següent manera[cite: 1, 43]:

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
│   ├── package-lock.json    # Control de versions de dependències
│   ├── pytest.ini           # Configuració de rutes per a pytest
│   └── requirements.txt     # Dependències de Python del projecte
└── frontend/                # Client web (HTML, CSS, JS)
    ├── node_modules/        # Mòduls i dependències de Node.js instal·lats
    ├── test/                # Proves automàtiques del client (Jest)
    │   └── saluda.test.js   # Test de verificació de la funció de salutació en JS
    ├── index.html           # Estructura semàntica de la pàgina principal
    ├── package.json         # Configuració i dependències de Node.js (Jest, Testing Library)
    ├── package-lock.json    # Control de versions de dependències de Node.js
    ├── script.js            # Lògica i esdeveniments en JavaScript
    └── style.css            # Estils i disseny amb pseudoclasses
