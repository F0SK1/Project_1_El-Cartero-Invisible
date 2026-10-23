import json
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="El Cartero Invisible API")

# 1. Configuració de CORS per a la comunicació amb el frontend
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
class CartaCreate(BaseModel):
    remitent: str
    destinatari: Optional[str] = ""
    contingut: str
    personatge: Optional[str] = "Desconegut"

class Carta(CartaCreate):
    id: int

@app.get("/")
def root():
    return {"missatge": "Hola, món!"}

# Endpoint GET /cartas (amb paginació opcional i filtratge)
@app.get("/cartas", status_code=status.HTTP_200_OK)
def llistar_cartes(limit: Optional[int] = None, offset: int = 0, personatge: Optional[str] = None):
    cartes = cargar_cartes()
    if personatge:
        cartes_filtrades = [
            c for c in cartes 
            if c.get("personatge") == personatge or c.get("remitent") == personatge
        ]
    else:
        cartes_filtrades = cartes
    
    if limit is not None:
        return cartes_filtrades[offset : offset + limit]
    return cartes_filtrades[offset:]

# Endpoint GET /cartas/{id}
@app.get("/cartas/{id}", status_code=status.HTTP_200_OK)
def obtenir_carta(id: int):
    cartes = cargar_cartes()
    carta = next((c for c in cartes if c.get("id") == id), None)
    if not carta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carta no trobada"
        )
    return carta

# Endpoint POST /cartas (status 201 Created)
@app.post("/cartas", status_code=status.HTTP_201_CREATED)
def crear_carta(carta_input: CartaCreate):
    cartes = cargar_cartes()
    nova_carta = carta_input.model_dump()
    
    existing_ids = [c["id"] for c in cartes if "id" in c and isinstance(c["id"], int)]
    nova_carta["id"] = (max(existing_ids) + 1) if existing_ids else 1
    
    cartes.append(nova_carta)
    guardar_cartes(cartes)
    return nova_carta

# Endpoint DELETE /cartas/{id}
@app.delete("/cartas/{id}", status_code=status.HTTP_200_OK)
def eliminar_carta(id: int):
    cartes = cargar_cartes()
    carta_a_eliminar = next((c for c in cartes if c.get("id") == id), None)
    
    if not carta_a_eliminar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carta no trobada"
        )
        
    cartes = [c for c in cartes if c.get("id") != id]
    guardar_cartes(cartes)
    return {"missatge": "Carta eliminada", "id": id}