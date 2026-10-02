// Array de cartes simulades inicials
const cartesSimulades = [
  { id: 1, remitent: "Maria", contingut: "Hola, com estàs? T'escric des del passat." },
  { id: 2, remitent: "Joan", contingut: "Recorda revisar el codi del servidor." },
  { id: 3, remitent: "Pau", contingut: "Una altra carta de prova per al buzón." }
];

function saluda() {
  alert("Hola, món!");
}

// Funció per renderitzar les cartes al DOM
function renderitzarCartes(cartes) {
  const contenidor = document.querySelector("#contenidorCartes");
  if (!contenidor) return;

  // Buidem el contenidor per no acumular elements anteriors
  contenidor.innerHTML = "";

  // 1. Creem i afegim el comptador primer utilitzant manipulació segura del DOM
  const pPendents = document.createElement("p");
  pPendents.textContent = `Cartes pendents: ${cartes.length}`;
  contenidor.appendChild(pPendents);

  // 2. Generem cada carta utilitzant manipulació segura del DOM
  cartes.forEach((carta) => {
    // Creem el div principal amb la classe 'carta'
    const divCarta = document.createElement("div");
    divCarta.classList.add("carta");

    // Creem el títol h3 per al remitent
    const h3Remitent = document.createElement("h3");
    h3Remitent.textContent = "De: " + carta.remitent;

    // Creem el paràgraf p per al contingut
    const pContingut = document.createElement("p");
    pContingut.textContent = carta.contingut;

    // Creem el span per a l'ID amb l'atribut data-id
    const spanId = document.createElement("span");
    spanId.textContent = "ID: " + carta.id;
    spanId.setAttribute("data-id", carta.id);

    // Unim tots els elements dins de la carta
    divCarta.appendChild(h3Remitent);
    divCarta.appendChild(pContingut);
    divCarta.appendChild(spanId);

    // Afegim la carta al contenidor
    contenidor.appendChild(divCarta);
  });
}

// Funció principal d'inicialització
function inicialitzar() {
  const boto = document.getElementById("btnSaluda");
  if (boto) {
    boto.addEventListener("click", saluda);
  }

  const titol = document.querySelector("#titolPrincipal");
  if (titol) {
    titol.textContent = "📮 El Cartero Invisible – Setmana 2";
    titol.setAttribute("data-role", "banner");
  }

  const info = document.querySelector(".info");
  if (info) {
    info.style.color = "#2c3e50";
  }

  // Renderització inicial de les cartes i del comptador
  renderitzarCartes(cartesSimulades);

  // Escoltador d'esdeveniments per al botó d'afegir
  const btnAfegir = document.querySelector("#btnAfegir");
  if (btnAfegir) {
    btnAfegir.addEventListener("click", () => {
      cartesSimulades.push({
        id: cartesSimulades.length + 1,
        remitent: "Carter " + (cartesSimulades.length + 1),
        contingut: "Aquesta carta s'acaba de crear dinàmicament!"
      });
      renderitzarCartes(cartesSimulades);
    });
  }
}

// Executa-ho només si estem al navegador (evitant problemes a Node/Jest)
if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", inicialitzar);
}

// Exporta el que necessitis per fer els tests
export { renderitzarCartes };