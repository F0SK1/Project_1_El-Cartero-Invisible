from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"missatge": "Hola, món!"}


@app.get("/cartas/{id}")
def obtenir_carta(id: int):
    # Dades simulades (més endavant es llegiran de fitxer)
    cartes = [
        {"id": 1, "remitent": "Maria", "contingut": "Hola, com estàs?"},
        {"id": 2, "remitent": "Joan", "contingut": "T'escric des del passat."}
    ]
    for c in cartes:
        if c["id"] == id:
            return c
    return {"error": "Carta no trobada"}, 404



@app.get("/cartas")
def llistar_cartes(limit: int = 10, offset: int = 0):
    cartes = [
        {"id": 1, "remitent": "Maria", "contingut": "Hola, com estàs?"},
        {"id": 2, "remitent": "Joan", "contingut": "T'escric des del passat."},
        # Afegeix més dades de prova si vols
    ]
    return cartes[offset:offset+limit]