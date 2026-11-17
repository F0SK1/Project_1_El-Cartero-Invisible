import json
import os
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Cookie, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# 1. Carregar les variables d'entorn des del fitxer .env
load_dotenv()

# Lectura de les variables d'entorn
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

app = FastAPI(title="El Cartero Invisible API")

# 2. Configuració de CORS per a la comunicació amb el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fitxer per a la persistència de dades
DATA_FILE = "cartas.json"


# Funcions auxiliars per a carregar i guardar en JSON
def cargar_cartes() -> List[dict]:
    """Llegeix les cartes del fitxer JSON. Retorna una llista buida si no existeix."""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return []
                return json.loads(content)
        except (json.JSONDecodeError, OSError):
            return []
    return []


def guardar_cartes(cartes: List[dict]) -> None:
    """Escriu la llista de cartes al fitxer JSON."""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(cartes, f, indent=2, ensure_ascii=False)


# Models Pydantic
# Field(min_length=1) fa que Pydantic rebutgi els camps buits amb un 422 automàtic.
class CartaCreate(BaseModel):
    remitent: str = Field(min_length=1)
    destinatari: str = Field(min_length=1)
    contingut: str = Field(min_length=1)
    personatge: str = Field(min_length=1)
    usuari_id: Optional[str] = None


class Carta(CartaCreate):
    id: int


# Validació addicional (més enllà de Pydantic): cap camp pot ser només espais en blanc
def validar_carta(carta: CartaCreate) -> None:
    camps = {
        "remitent": carta.remitent,
        "destinatari": carta.destinatari,
        "contingut": carta.contingut,
        "personatge": carta.personatge,
    }
    for nom, valor in camps.items():
        if not valor.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"El camp '{nom}' no pot estar buit",
            )


@app.get("/")
def root():
    return {"missatge": "Hola, món!"}


# Endpoint GET /config
# Llegeix GEMINI_API_KEY a cada petició (no una còpia calculada a l'import),
# així els tests poden canviar-la amb monkeypatch. Mai retorna la clau.
@app.get("/config")
def config():
    return {
        "debug": DEBUG,
        "ia_configurada": bool(GEMINI_API_KEY),
        "gemini_model": GEMINI_MODEL,
    }


# Endpoint POST /login: el servidor estableix la cookie d'usuari
@app.post("/login", status_code=status.HTTP_200_OK)
def login(nom_usuari: str, response: Response):
    response.set_cookie(
        key="usuari_id",
        value=nom_usuari,
        max_age=30 * 24 * 60 * 60,  # 30 dies
        httponly=True,
        samesite="lax",
    )
    return {"missatge": "Sessió iniciada", "usuari_id": nom_usuari}


# Endpoint GET /perfil: llegeix la cookie i retorna les cartes de l'usuari
@app.get("/perfil", status_code=status.HTTP_200_OK)
def perfil(usuari_id: Optional[str] = Cookie(default=None)):
    if not usuari_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No hi ha sessió"
        )
    cartes = [c for c in cargar_cartes() if c.get("usuari_id") == usuari_id]
    return {"usuari_id": usuari_id, "cartes": cartes}


# Endpoint DELETE /logout: elimina la cookie d'usuari
@app.delete("/logout")
def logout(response: Response):
    response.delete_cookie(key="usuari_id", path="/")   # la caduca automàticament
    return {"missatge": "Sessió tancada"}


# Endpoint GET /cartas (amb paginació opcional i filtratge)
@app.get("/cartas", status_code=status.HTTP_200_OK)
def llistar_cartes(
    limit: Optional[int] = None,
    offset: int = 0,
    personatge: Optional[str] = None,
):
    cartes = cargar_cartes()
    if personatge:
        cartes_filtrades = [
            c
            for c in cartes
            if c.get("personatge") == personatge
            or c.get("remitent") == personatge
        ]
    else:
        cartes_filtrades = cartes

    if limit is not None:
        return cartes_filtrades[offset : offset + limit]
    return cartes_filtrades[offset:]


# Endpoint GET /cartas/{id}: 404 si no existeix
@app.get("/cartas/{id}", status_code=status.HTTP_200_OK)
def obtenir_carta(id: int):
    cartes = cargar_cartes()
    carta = next((c for c in cartes if c.get("id") == id), None)
    if carta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Carta no trobada"
        )
    return carta


# Endpoint POST /cartas (201 Created)
# 422 si les dades són invàlides (Pydantic + validació addicional).
# Si hi ha cookie "usuari_id", la carta s'associa a aquest usuari;
# si no, es manté l'usuari_id que enviï el frontend al cos (si n'hi ha).
@app.post("/cartas", status_code=status.HTTP_201_CREATED)
def crear_carta(
    carta_input: CartaCreate,
    usuari_id: Optional[str] = Cookie(default=None),
):
    validar_carta(carta_input)

    cartes = cargar_cartes()
    nova_carta = carta_input.model_dump()

    if usuari_id:
        nova_carta["usuari_id"] = usuari_id

    existing_ids = [
        c["id"] for c in cartes if "id" in c and isinstance(c["id"], int)
    ]
    nova_carta["id"] = (max(existing_ids) + 1) if existing_ids else 1

    cartes.append(nova_carta)
    guardar_cartes(cartes)
    return nova_carta


# Endpoint PUT /cartas/{id}: 404 si no existeix, 422 si les dades són invàlides
@app.put("/cartas/{id}", status_code=status.HTTP_200_OK)
def actualitzar_carta(id: int, carta_input: CartaCreate):
    cartes = cargar_cartes()
    index = next((i for i, c in enumerate(cartes) if c.get("id") == id), None)

    if index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Carta no trobada"
        )

    validar_carta(carta_input)

    carta_actualitzada = carta_input.model_dump()
    carta_actualitzada["id"] = id  # L'ID no es pot canviar
    # Conserva l'usuari propietari si l'edició no n'envia cap
    carta_actualitzada["usuari_id"] = (
        carta_input.usuari_id or cartes[index].get("usuari_id")
    )

    cartes[index] = carta_actualitzada
    guardar_cartes(cartes)
    return carta_actualitzada


# Endpoint DELETE /cartas/{id}: 204 No Content (sense cos), 404 si no existeix
@app.delete("/cartas/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_carta(id: int):
    cartes = cargar_cartes()
    carta_a_eliminar = next((c for c in cartes if c.get("id") == id), None)

    if carta_a_eliminar is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Carta no trobada"
        )

    cartes = [c for c in cartes if c.get("id") != id]
    guardar_cartes(cartes)
    return Response(status_code=status.HTTP_204_NO_CONTENT)