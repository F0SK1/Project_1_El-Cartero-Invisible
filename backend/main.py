from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/")
def root():
    return {"missatge": "Hola, món!"}

@app.get("/cartas/{id}")
def obtenir_carta(id: int):
    cartes = [
        {"id": 1, "remitent": "Maria", "contingut": "Hola, com estàs?"},
        {"id": 2, "remitent": "Joan", "contingut": "T'escric des del passat."}
    ]

    for c in cartes:
        if c["id"] == id:
            return c

    raise HTTPException(
        status_code=404,
        detail="Carta no trobada"
    )

@app.get("/cartas")
def llistar_cartes(limit: int = 10, offset: int = 0):
    cartes = [
        {"id": 1, "remitent": "Maria", "contingut": "Hola, com estàs?"},
        {"id": 2, "remitent": "Joan", "contingut": "T'escric des del passat."},
        {"id": 3, "remitent": "Anna", "contingut": "Com va tot?"},
        {"id": 4, "remitent": "Pere", "contingut": "Ens veiem aviat!"},
        {"id": 5, "remitent": "Laura", "contingut": "Feliç aniversari!"}
        # Afegeix més dades de prova si vols
    ]
    return cartes[offset:offset+limit]
    