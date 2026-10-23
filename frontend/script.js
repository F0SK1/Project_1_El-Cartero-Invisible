// Funció per carregar les cartes des del servidor backend (GET)
async function carregarCartes() {
  try {
    const response = await fetch("http://127.0.0.1:8000/cartas");
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const cartes = await response.json();
    actualitzarVistes(cartes);
    return cartes;
  } catch (error) {
    console.error("Error en carregar les cartes des del servidor:", error);
    
    // Actualitza el DOM amb el missatge d'error
    const contenidor = document.querySelector("#contenidorCartes");
    if (contenidor) {
      contenidor.innerHTML = '<p class="error-missatge">No s\'han pogut carregar les cartes. Comprova que el servidor està en marxa.</p>';
    }

    // Mostra l'alert esperat pels tests
    alert("No s'han pogut carregar les cartes. Comprova que el servidor està en marxa.");
    return [];
  }
}

function saluda() {
  alert("Hola, món!");
}

// Funció per renderitzar les cartes al DOM (format targetes)
function renderitzarCartes(cartes = []) {
  const contenidor = document.querySelector("#contenidorCartes");
  if (!contenidor) return;

  contenidor.innerHTML = "";

  // 1. Comptador de cartes pendents
  const pPendents = document.createElement("p");
  pPendents.className = "cartes-pendents";
  pPendents.textContent = `Cartes pendents: ${cartes.length}`;
  contenidor.appendChild(pPendents);

  if (!Array.isArray(cartes) || cartes.length === 0) {
    const pBuit = document.createElement("p");
    pBuit.className = "missatge-buit";
    pBuit.textContent = "Encara no hi ha cap carta al buzón.";
    contenidor.appendChild(pBuit);
    return;
  }

  // 2. Generació dinàmica de cada carta
  cartes.forEach((carta) => {
    const divCarta = document.createElement("div");
    divCarta.classList.add("carta");

    const h3Remitent = document.createElement("h3");
    h3Remitent.textContent = "De: " + (carta.remitent || "");

    const pContingut = document.createElement("p");
    pContingut.textContent = carta.contingut || "";

    const spanId = document.createElement("span");
    spanId.textContent = "ID: " + carta.id;
    spanId.setAttribute("data-id", carta.id);

    // Botó d'eliminar blindat amb type="button"
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.dataset.id = carta.id;

    const filaAcciones = document.createElement("div");
    filaAcciones.className = "carta-acciones";
    filaAcciones.appendChild(spanId);
    filaAcciones.appendChild(btnEliminar);

    divCarta.appendChild(h3Remitent);
    divCarta.appendChild(pContingut);
    divCarta.appendChild(filaAcciones);

    contenidor.appendChild(divCarta);
  });
}

// Funció per renderitzar la taula de cartes
function renderitzarTaula(cartes = []) {
  const cosTaula = document.querySelector("#cosTaulaCartes");
  if (!cosTaula) return;

  cosTaula.innerHTML = "";

  if (!Array.isArray(cartes)) return;

  cartes.forEach((carta) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = carta.id;

    const tdRemitent = document.createElement("td");
    tdRemitent.textContent = carta.remitent || "";

    const tdDestinatari = document.createElement("td");
    tdDestinatari.textContent = carta.destinatari || "-";

    const tdContingut = document.createElement("td");
    tdContingut.textContent = carta.contingut || "";
    tdContingut.className = "contingut-cell";

    const tdAccions = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.dataset.id = carta.id;
    tdAccions.appendChild(btnEliminar);

    tr.appendChild(tdId);
    tr.appendChild(tdRemitent);
    tr.appendChild(tdDestinatari);
    tr.appendChild(tdContingut);
    tr.appendChild(tdAccions);

    cosTaula.appendChild(tr);
  });
}

// Àlies per compatibilitat amb tests
const renderitzarVistaCartes = renderitzarCartes;
const renderitzarTaulaCartes = renderitzarTaula;

// Funció auxiliar per actualitzar targetes i taula simultàniament
function actualitzarVistes(cartes) {
  renderitzarCartes(cartes);
  renderitzarTaula(cartes);
}

// Funció principal d'inicialització
function inicialitzar() {
  const boto = document.getElementById("btnSaluda");
  if (boto) {
    boto.type = "button";
    boto.addEventListener("click", saluda);
  }

  const titol = document.querySelector("#titolPrincipal");
  if (titol) {
    titol.textContent = "📮 El Cartero Invisible – Setmana 5";
    titol.setAttribute("data-role", "banner");
  }

  const info = document.querySelector(".info");
  if (info) {
    info.style.color = "var(--color-principal)";
  }

  // 1. Mostrar / Ocultar la taula de cartes
  const btnToggleTaula = document.querySelector("#btnToggleTaula");
  const taulaCartes = document.querySelector("#taulaCartes");
  if (btnToggleTaula && taulaCartes) {
    btnToggleTaula.type = "button";
    btnToggleTaula.addEventListener("click", () => {
      if (taulaCartes.style.display === "none" || taulaCartes.style.display === "") {
        taulaCartes.style.display = "table";
        btnToggleTaula.textContent = "Ocultar taula";
      } else {
        taulaCartes.style.display = "none";
        btnToggleTaula.textContent = "Mostrar taula";
      }
    });
  }

  // 2. Càrrega inicial de cartes des de l'API real (FastAPI)
  carregarCartes();

  // 3. Captura del formulari per crear noves cartes (POST)
  const formCarta = document.querySelector("#formCarta");
  if (formCarta) {
    formCarta.addEventListener("submit", async (event) => {
      event.preventDefault();

      const remitentInput = document.querySelector("#remitent");
      const destinatariInput = document.querySelector("#destinatari");
      const contingutInput = document.querySelector("#contingut");
      const personatgeInput = document.querySelector("#personatge");

      const remitent = remitentInput ? remitentInput.value.trim() : "";
      const destinatari = destinatariInput ? destinatariInput.value.trim() : "";
      const contingut = contingutInput ? contingutInput.value.trim() : "";
      const personatge = personatgeInput ? personatgeInput.value.trim() : "";

      if (remitent === "" || contingut === "") {
        alert("Els camps Remitent i Contingut són obligatoris!");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/cartas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            remitent: remitent,
            destinatari: destinatari || "Desconegut",
            contingut: contingut,
            personatge: personatge || "Desconegut"
          })
        });

        if (response.ok) {
          await carregarCartes();
          formCarta.reset();
        } else {
          alert("Error en enviar la carta al servidor.");
        }
      } catch (error) {
        console.error("Error en la petició POST:", error);
        alert("Error de connexió en enviar la carta.");
      }
    });
  }

  // Enllaç del botó #btnAfegir per activar l'enviament del formulari #formCarta
  const btnAfegir = document.querySelector("#btnAfegir");
  if (btnAfegir && formCarta) {
    btnAfegir.type = "button";
    btnAfegir.addEventListener("click", () => {
      if (typeof formCarta.requestSubmit === "function") {
        formCarta.requestSubmit();
      } else {
        formCarta.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    });
  }

  // 4. Delegació d'esdeveniments per eliminar cartes (DELETE)
  document.addEventListener("click", async (event) => {
    const btnEliminar = event.target.closest(".btn-eliminar");
    if (btnEliminar) {
      const idAEliminar = btnEliminar.dataset.id;
      if (!idAEliminar) return;

      try {
        const response = await fetch(`http://127.0.0.1:8000/cartas/${idAEliminar}`, {
          method: "DELETE"
        });

        if (response.ok) {
          await carregarCartes();
        } else {
          alert("Error en eliminar la carta del servidor.");
        }
      } catch (error) {
        console.error("Error en la petició DELETE:", error);
        alert("Error de connexió en eliminar la carta.");
      }
    }
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", inicialitzar);
}

export {
  renderitzarCartes,
  renderitzarVistaCartes,
  renderitzarTaula,
  renderitzarTaulaCartes,
  carregarCartes,
  actualitzarVistes
};