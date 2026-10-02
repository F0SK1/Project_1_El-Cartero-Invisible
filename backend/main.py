from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()

# Definició dels models amb Pydantic
class CartaCreate(BaseModel):
    remitent: str
    destinatari: str
    contingut: str
    personatge: str

class Carta(CartaCreate):
    id: int

# Llista global amb dades simulades inicials
cartes: List[dict] = [
    {
        "id": 1,
        "remitent": "Einstein",
        "destinatari": "Anna",
        "contingut": "Hola Anna, quina teoria tan interessant!",
        "personatge": "Einstein"
    },
    {
        "id": 2,
        "remitent": "Curie",
        "destinatari": "Pau",
        "contingut": "Recorda revisar els experiments del laboratori.",
        "personatge": "Curie"
    }
]

@app.get("/")
def root():
    return {"missatge": "Hola, món!"}

# Endpoint GET /cartas amb paginació i filtratge per personatge
@app.get("/cartas")
def llistar_cartes(limit: int = 10, offset: int = 0, personatge: Optional[str] = None):
    if personatge:
        cartes_filtrades = [
            c for c in cartes 
            if c.get("personatge") == personatge or c.get("remitent") == personatge
        ]
    else:
        cartes_filtrades = cartes
    
    return cartes_filtrades[offset : offset + limit]

# Endpoint GET /cartas/{id} per obtenir una carta per ID
@app.get("/cartas/{id}")
def obtenir_carta(id: int):
    carta = next((c for c in cartes if c["id"] == id), None)
    if not carta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carta no trobada"
        )
    return carta

# Endpoint POST /cartas per crear una nova carta (Devolvent status 201)
@app.post("/cartas", status_code=status.HTTP_201_CREATED)
def crear_carta(carta_input: CartaCreate):
    nova_carta = carta_input.model_dump()
    nova_carta["id"] = len(cartes) + 1 if cartes else 1
    cartes.append(nova_carta)
    return nova_carta