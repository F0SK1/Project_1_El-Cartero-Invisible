const API_URL = "http://127.0.0.1:8000/cartas";
const PERFIL_URL = "http://127.0.0.1:8000/perfil/json";

// Últimes cartes rebudes del servidor (per numerar les cartes de prova)
let cartesActuals = [];

// ---------------------------------------------------------------------------
// Gestió d'errors (únic lloc on es mostren errors a l'usuari)
// ---------------------------------------------------------------------------

// Error HTTP amb el codi d'estat associat
class ErrorHTTP extends Error {
  constructor(missatge, estat) {
    super(missatge);
    this.name = "ErrorHTTP";
    this.estat = estat;
  }
}

// Missatge per a l'usuari segons el codi d'estat HTTP.
// "detail" és el missatge del servidor (només s'usa als 422 i al cas per defecte).
function missatgePerCodi(codi, detail = null) {
  const extra = typeof detail === "string" && detail.trim() !== "" ? detail : null;

  switch (codi) {
    case 400:
      return "Petició incorrecta (400). Revisa les dades enviades.";
    case 401:
      return "No estàs autenticat (401). Inicia sessió per continuar.";
    case 403:
      return "No tens permís per fer aquesta acció (403).";
    case 404:
      return "La carta que busques no existeix.";
    case 422:
      return extra
        ? `Les dades enviades no són vàlides: ${extra}`
        : "Les dades enviades no són vàlides. Revisa els camps del formulari.";
    case 500:
      return "Error intern del servidor (500). Torna-ho a provar més tard.";
    case 503:
      return "El servei no està disponible (503). Torna-ho a provar més tard.";
    default:
      return extra || `Error inesperat del servidor (codi ${codi}).`;
  }
}

// Retorna el div#missatgeError (si no existeix a l'HTML, el crea)
function obtenirElementError() {
  if (typeof document === "undefined") return null;
  let element = document.querySelector("#missatgeError");
  if (!element) {
    element = document.createElement("div");
    element.id = "missatgeError";
    element.setAttribute("aria-live", "polite");
    const contenidor = document.querySelector("#contenidorCartes");
    if (contenidor && contenidor.parentNode) {
      contenidor.parentNode.insertBefore(element, contenidor);
    } else if (document.body) {
      document.body.prepend(element);
    }
  }
  return element;
}

// Únic lloc on es mostren errors (es fa visible amb la classe "visible")
function mostrarError(missatge) {
  const element = obtenirElementError();
  if (!element) return;
  element.textContent = missatge;
  element.classList.add("visible");
}

function amagarError() {
  if (typeof document === "undefined") return;
  const element = document.querySelector("#missatgeError");
  if (!element) return;
  element.textContent = "";
  element.classList.remove("visible");
}

// Comprova la resposta: si no és OK, llança un ErrorHTTP amb el missatge
// corresponent al codi (i el "detail" del servidor quan s'hi afegeix).
async function comprovarResposta(response) {
  if (response.ok) return response;

  let detail = null;
  try {
    const cos = await response.json();
    detail = cos ? cos.detail : null;
  } catch (_) {
    // El cos no és JSON: s'usarà el missatge genèric
  }

  throw new ErrorHTTP(missatgePerCodi(response.status, detail), response.status);
}

// Converteix qualsevol error en un missatge per a l'usuari i el mostra
function gestionarError(error) {
  console.error("Error:", error);

  let missatge;
  if (error instanceof ErrorHTTP) {
    missatge = error.message;
  } else if (error instanceof TypeError) {
    // fetch llança TypeError quan no hi ha connexió amb el servidor
    missatge = "No s'ha pogut connectar al servidor. Comprova que està en marxa.";
  } else {
    missatge = (error && error.message) || "S'ha produït un error inesperat.";
  }

  mostrarError(missatge);
}

// ---------------------------------------------------------------------------
// Indicador de càrrega + bloqueig de botons durant les peticions fetch
// ---------------------------------------------------------------------------
let peticionsEnCurs = 0;

function obtenirIndicadorCarrega() {
  if (typeof document === "undefined") return null;
  let indicador = document.querySelector("#indicadorCarrega");
  if (!indicador) {
    indicador = document.createElement("p");
    indicador.id = "indicadorCarrega";
    indicador.className = "indicador-carrega";
    indicador.textContent = "Carregant…";
    indicador.style.display = "none";
    const contenidor = document.querySelector("#contenidorCartes");
    if (contenidor && contenidor.parentNode) {
      contenidor.parentNode.insertBefore(indicador, contenidor);
    } else if (document.body) {
      document.body.appendChild(indicador);
    }
  }
  return indicador;
}

function canviarEstatCarrega(carregant) {
  if (typeof document === "undefined") return;

  const indicador = obtenirIndicadorCarrega();
  if (indicador) {
    indicador.style.display = carregant ? "block" : "none";
  }
  document.querySelectorAll("button").forEach((b) => {
    b.disabled = carregant;
  });
}

function iniciarCarrega() {
  peticionsEnCurs++;
  if (peticionsEnCurs === 1) canviarEstatCarrega(true);
}

function acabarCarrega() {
  peticionsEnCurs = Math.max(0, peticionsEnCurs - 1);
  if (peticionsEnCurs === 0) canviarEstatCarrega(false);
}

// ---------------------------------------------------------------------------
// Peticions al backend
// ---------------------------------------------------------------------------

// Carrega les cartes des del servidor (GET)
async function carregarCartes() {
  amagarError();
  iniciarCarrega();
  try {
    const response = await fetch(API_URL);
    await comprovarResposta(response);
    const cartes = await response.json();
    actualitzarVistes(cartes);
    return cartes;
  } catch (error) {
    gestionarError(error);
    return [];
  } finally {
    acabarCarrega();
  }
}

// Carrega una carta concreta per ID (GET /cartas/{id})
async function carregarCartaPerId(id) {
  amagarError();
  iniciarCarrega();
  try {
    const response = await fetch(`${API_URL}/${id}`);
    await comprovarResposta(response);
    return await response.json();
  } catch (error) {
    gestionarError(error);
    return null;
  } finally {
    acabarCarrega();
  }
}

// Crea una carta nova (POST). Retorna true si ha anat bé, false si ha fallat.
async function crearCarta(dades) {
  amagarError();
  iniciarCarrega();
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dades)
    });
    await comprovarResposta(response);
    return true;
  } catch (error) {
    gestionarError(error);
    return false;
  } finally {
    acabarCarrega();
  }
}

// Àlies amb el nom de l'enunciat
const enviarCarta = crearCarta;

// Actualitza una carta existent (PUT).
// Llança un error si el servidor respon amb error: el gestiona qui la crida.
async function actualitzarCarta(id, dades) {
  amagarError();
  iniciarCarrega();
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dades)
    });
    await comprovarResposta(response);
    return true;
  } finally {
    acabarCarrega();
  }
}

// Elimina una carta (DELETE) i refresca la llista
async function eliminarCarta(id) {
  if (id === undefined || id === null || id === "") return false;

  amagarError();
  iniciarCarrega();
  let correcte = false;
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });
    await comprovarResposta(response);
    correcte = true;
  } catch (error) {
    gestionarError(error);
  } finally {
    acabarCarrega();
  }

  if (correcte) {
    await carregarCartes();
  }
  return correcte;
}

function saluda() {
  alert("Hola, món!");
}

// ---------------------------------------------------------------------------
// Comptador de visites (el servidor incrementa la cookie `visites`)
// ---------------------------------------------------------------------------

// Fa GET /perfil/json: el servidor suma 1 a la cookie i en retorna el valor
export async function carregarVisites() {
  try {
    const response = await fetch(PERFIL_URL, { credentials: "include" });
    await comprovarResposta(response);
    const dades = await response.json();
    const element = document.querySelector("#visitesNum");
    if (element) element.textContent = dades.visites;
    return dades.visites;
  } catch (error) {
    // Funció secundària: només es registra a consola per no duplicar l'error de carregarCartes
    console.error("Error en carregar el comptador de visites:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Tema clar / fosc (localStorage)
// ---------------------------------------------------------------------------

// Aplica el tema fosc en carregar la pàgina si estava guardat
export function aplicarTemaGuardat() {
  if (localStorage.getItem("tema") === "fosc") {
    document.body.classList.add("tema-fosc");
  }
}

// Alterna la classe tema-fosc al <body> i en guarda la preferència
export function canviarTema() {
  document.body.classList.toggle("tema-fosc");
  const esFosc = document.body.classList.contains("tema-fosc");
  localStorage.setItem("tema", esFosc ? "fosc" : "clar");
}

// ---------------------------------------------------------------------------
// Últim personatge (localStorage) i esborrany de la carta (sessionStorage)
// ---------------------------------------------------------------------------

export function guardarUltimPersonatge(personatge) {
  localStorage.setItem("ultimPersonatge", personatge);
}

export function preomplirUltimPersonatge() {
  const ultim = localStorage.getItem("ultimPersonatge");
  const camp = document.querySelector("#personatge");
  if (ultim && camp) camp.value = ultim;
}

export function guardarCartaEnProces(text) {
  sessionStorage.setItem("cartaEnProces", text);
}

export function recuperarCartaEnProces() {
  const text = sessionStorage.getItem("cartaEnProces");
  const camp = document.querySelector("#contingut");
  if (text && camp) camp.value = text;
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

export function setCookie(nom, valor, dies) {
  const data = new Date();
  data.setTime(data.getTime() + dies * 24 * 60 * 60 * 1000);
  document.cookie = `${nom}=${encodeURIComponent(valor)}; expires=${data.toUTCString()}; path=/; SameSite=Lax`;
}

export function getCookie(nom) {
  const trobada = document.cookie
    .split("; ")
    .find((fila) => fila.startsWith(nom + "="));
  return trobada ? decodeURIComponent(trobada.substring(nom.length + 1)) : null;
}

export function esborrarCookie(nom) {
  document.cookie = `${nom}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Usuari (cookie + localStorage)
// ---------------------------------------------------------------------------

export function generarIdUsuari() {
  return "user_" + Math.random().toString(36).substring(2, 10);
}

export function mostrarBenvinguda(usuariId) {
  const element = document.querySelector("#benvinguda");
  if (element) element.textContent = `Benvingut de nou, ${usuariId}!`;
}

export function inicialitzarUsuari() {
  const existent = getCookie("usuari_id");
  if (existent) {
    mostrarBenvinguda(existent);
    return existent;
  }
  const nou = generarIdUsuari();
  setCookie("usuari_id", nou, 30);        // cookie de 30 dies
  localStorage.setItem("usuariId", nou);  // còpia a localStorage
  return nou;
}

export function esborrarCarnet() {
  esborrarCookie("usuari_id");
  location.reload();
}

// ---------------------------------------------------------------------------
// Edició inline
// ---------------------------------------------------------------------------

function crearCampEdicio(etiqueta, nom, valor, multilinia = false) {
  const label = document.createElement("label");
  label.textContent = etiqueta + " ";

  const camp = multilinia
    ? document.createElement("textarea")
    : document.createElement("input");
  if (!multilinia) camp.type = "text";
  camp.name = nom;
  camp.value = valor || "";
  camp.className = "camp-edicio";

  label.appendChild(camp);
  return label;
}

// Substitueix el contingut de la carta (o fila de taula) per un formulari preomplert
function mostrarFormulariEdicio(elementContenidor, carta) {
  elementContenidor.innerHTML = "";

  const form = document.createElement("form");
  form.className = "form-edicio";
  form.dataset.id = carta.id;

  form.appendChild(crearCampEdicio("Remitent:", "remitent", carta.remitent));
  form.appendChild(crearCampEdicio("Destinatari:", "destinatari", carta.destinatari));
  form.appendChild(crearCampEdicio("Contingut:", "contingut", carta.contingut, true));
  form.appendChild(crearCampEdicio("Personatge:", "personatge", carta.personatge));

  const btnDesar = document.createElement("button");
  btnDesar.type = "submit";
  btnDesar.textContent = "Desar";
  btnDesar.className = "btn-desar";

  const btnCancelar = document.createElement("button");
  btnCancelar.type = "button";
  btnCancelar.textContent = "Cancel·lar";
  btnCancelar.className = "btn-cancelar";
  btnCancelar.addEventListener("click", () => {
    carregarCartes();
  });

  const accions = document.createElement("div");
  accions.className = "carta-acciones";
  accions.appendChild(btnDesar);
  accions.appendChild(btnCancelar);
  form.appendChild(accions);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const dades = {
      remitent: form.elements["remitent"].value.trim(),
      destinatari: form.elements["destinatari"].value.trim(),
      contingut: form.elements["contingut"].value.trim(),
      personatge: form.elements["personatge"].value.trim()
    };

    // Validació: cap camp pot estar buit
    if (Object.values(dades).some((valor) => valor === "")) {
      mostrarError("Tots els camps són obligatoris!");
      return;
    }

    try {
      await actualitzarCarta(carta.id, dades);
    } catch (error) {
      gestionarError(error);
      return;
    }
    await carregarCartes();
  });

  // Si l'element és una fila de la taula (TR), embolcallem el formulari en un TD
  if (elementContenidor.tagName === "TR") {
    const tdForm = document.createElement("td");
    tdForm.colSpan = 5;
    tdForm.appendChild(form);
    elementContenidor.appendChild(tdForm);
  } else {
    elementContenidor.appendChild(form);
  }
}

// ---------------------------------------------------------------------------
// Renderitzat
// ---------------------------------------------------------------------------

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

    // Botó d'editar
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar";
    btnEditar.className = "btn-editar";
    btnEditar.dataset.id = carta.id;
    btnEditar.addEventListener("click", () => {
      mostrarFormulariEdicio(divCarta, carta);
    });

    // Botó d'eliminar blindat amb type="button"
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.dataset.id = carta.id;

    const filaAcciones = document.createElement("div");
    filaAcciones.className = "carta-acciones";
    filaAcciones.appendChild(spanId);
    filaAcciones.appendChild(btnEditar);
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

    // Cel·la d'accions de la taula
    const tdAccions = document.createElement("td");

    // 1. Botó d'editar
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar";
    btnEditar.className = "btn-editar";
    btnEditar.dataset.id = carta.id;
    btnEditar.addEventListener("click", () => {
      mostrarFormulariEdicio(tr, carta);
    });

    // 2. Botó d'eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar";
    btnEliminar.dataset.id = carta.id;

    // S'afegeix primer el d'Editar i després el d'Eliminar
    tdAccions.appendChild(btnEditar);
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
  cartesActuals = Array.isArray(cartes) ? cartes : [];
  renderitzarCartes(cartes);
  renderitzarTaula(cartes);
}

// ---------------------------------------------------------------------------
// Inicialització
// ---------------------------------------------------------------------------

function inicialitzar() {
  // Usuari (cookie + localStorage) i botó per esborrar el carnet
  inicialitzarUsuari();
  const btnEsborrarCarnet = document.querySelector("#btnEsborrarCarnet");
  if (btnEsborrarCarnet) {
    btnEsborrarCarnet.type = "button";
    btnEsborrarCarnet.addEventListener("click", esborrarCarnet);
  }

  // Comptador de visites (només si existeix l'element #visitesNum a la pàgina)
  if (document.querySelector("#visitesNum")) {
    carregarVisites();
  }

  // Tema: aplica el tema guardat i enllaça el botó
  aplicarTemaGuardat();
  const btnTema = document.querySelector("#btnTema");
  if (btnTema) {
    btnTema.type = "button";
    btnTema.addEventListener("click", canviarTema);
  }

  // Últim personatge i esborrany de la carta
  preomplirUltimPersonatge();
  recuperarCartaEnProces();
  const campContingut = document.querySelector("#contingut");
  if (campContingut) {
    campContingut.addEventListener("input", (e) => guardarCartaEnProces(e.target.value));
  }

  const boto = document.getElementById("btnSaluda");
  if (boto) {
    boto.type = "button";
    boto.addEventListener("click", saluda);
  }

  const titol = document.querySelector("#titolPrincipal");
  if (titol) {
    titol.textContent = "📮 El Cartero Invisible – Setmana 9";
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
        mostrarError("Els camps Remitent i Contingut són obligatoris!");
        return;
      }

      const correcte = await enviarCarta({
        remitent: remitent,
        destinatari: destinatari || "Desconegut",
        contingut: contingut,
        personatge: personatge || "Desconegut",
        usuari_id: getCookie("usuari_id") // associa la carta a l'usuari
      });

      if (correcte) {
        // Carta enviada correctament: desa l'últim personatge i esborra l'esborrany
        guardarUltimPersonatge(personatge);
        sessionStorage.removeItem("cartaEnProces");

        await carregarCartes();
        formCarta.reset();
        preomplirUltimPersonatge(); // torna a preomplir el personatge després del reset
      }
      // Si ha fallat, enviarCarta ja ha cridat gestionarError()
    });
  }

  // Botó #btnAfegir: afegeix una carta de prova (com a la setmana 3)
  const btnAfegir = document.querySelector("#btnAfegir");
  if (btnAfegir) {
    btnAfegir.type = "button";
    btnAfegir.addEventListener("click", async () => {
      const numero = cartesActuals.length + 1;

      const correcte = await enviarCarta({
        remitent: "Carter " + numero,
        destinatari: "Desconegut",
        contingut: "Aquesta carta s'acaba de crear dinàmicament!",
        personatge: "Desconegut",
        usuari_id: getCookie("usuari_id")
      });

      if (correcte) {
        await carregarCartes();
      }
    });
  }

  // 4. Delegació d'esdeveniments per eliminar cartes (DELETE)
  document.addEventListener("click", async (event) => {
    const btnEliminar = event.target.closest(".btn-eliminar");
    if (btnEliminar) {
      await eliminarCarta(btnEliminar.dataset.id);
    }
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", inicialitzar);
}

// Per poder provar des de la consola del navegador (p. ex. carregarCartaPerId(9999))
if (typeof window !== 'undefined') {
  window.carregarCartaPerId = carregarCartaPerId;
}

export {
  renderitzarCartes,
  renderitzarVistaCartes,
  renderitzarTaula,
  renderitzarTaulaCartes,
  carregarCartes,
  carregarCartaPerId,
  crearCarta,
  enviarCarta,
  actualitzarCarta,
  eliminarCarta,
  actualitzarVistes,
  comprovarResposta,
  missatgePerCodi,
  gestionarError,
  mostrarError,
  amagarError
};