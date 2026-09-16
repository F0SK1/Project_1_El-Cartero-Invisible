```python?code_reference&code_event_index=2
import os

readme_content = """# El Cartero Invisible - Setmana 1: Obrim l'oficina de correus

Aquest repositori conté la implementació de la **Setmana 1** del projecte **"El Cartero Invisible"**. Durant aquesta setmana s'ha configurat l'entorn de desenvolupament complet, establint les bases del projecte amb una arquitectura client-servidor, un backend en FastAPI, un frontend semàntic amb HTML/CSS/JS i els entorns de proves configurats.

---

## 🏗️ Estructura del Projecte

L'estructura de directoris del projecte s'organitza de la següent manera:

```text
cartero-invisible/
├── backend/                # Servidor FastAPI i lògica del backend
│   ├── venv/               # Entorn virtual de Python (aïllat)
│   ├── main.py             # Punt d'entrada del servidor FastAPI (endpoints)
│   ├── requirements.txt    # Dependències de Python del projecte
│   └── tests/              # Proves automàtiques del servidor (pytest)
│       └── test_main.py
├── frontend/               # Client web (HTML, CSS, JS)
│   ├── index.html          # Estructura semàntica de la pàgina principal
│   ├── style.css           # Estils i disseny amb pseudoclasses
│   └── script.js           # Lògica i esdeveniments en JavaScript
├── package.json            # Configuració i dependències de Node.js (Jest)
└── README.md               # Documentació oficial del projecte