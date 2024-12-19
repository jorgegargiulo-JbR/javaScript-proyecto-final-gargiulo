// Lista de monedas y banderas
const monedas = [
    { codigo: "ARS", pais: "ar", nombre: "Peso Argentino" },
    { codigo: "USD", pais: "us", nombre: "Dólar Estadounidense" },
    { codigo: "EUR", pais: "eu", nombre: "Euro" },
    { codigo: "CLP", pais: "cl", nombre: "Peso Chileno" },
    { codigo: "UYU", pais: "uy", nombre: "Peso Uruguayo" },
    { codigo: "GBP", pais: "gb", nombre: "Libra Esterlina" },
    { codigo: "JPY", pais: "jp", nombre: "Yen Japonés" },
    { codigo: "CAD", pais: "ca", nombre: "Dólar Canadiense" },
    { codigo: "AUD", pais: "au", nombre: "Dólar Australiano" },
    { codigo: "MXN", pais: "mx", nombre: "Peso Mexicano" },
    { codigo: "BRL", pais: "br", nombre: "Real Brasileño" },
    { codigo: "CHF", pais: "ch", nombre: "Franco Suizo" }
];

// Elementos del DOM
const formulario = document.getElementById("formulario-conversion");
const entradaCantidad = document.getElementById("cantidad");
const monedaOrigen = document.getElementById("moneda-origen");
const monedaDestino = document.getElementById("moneda-destino");
const banderaOrigen = document.getElementById("bandera-origen");
const banderaDestino = document.getElementById("bandera-destino");
const resultadoDiv = document.getElementById("resultado");
const botonLimpiar = document.getElementById("boton-limpiar");

// Función para rellenar los selectores de monedas
function llenarOpcionesMoneda(selector) {
    selector.innerHTML = monedas
        .map(({ codigo, nombre }) => `<option value="${codigo}">${nombre} (${codigo})</option>`);
}
llenarOpcionesMoneda(monedaOrigen);
llenarOpcionesMoneda(monedaDestino);

// Función para actualizar banderas según la moneda seleccionada
function actualizarBandera(elementoBandera, codigoMoneda) {
    const moneda = monedas.find(({ codigo }) => codigo === codigoMoneda);
    if (moneda) {
        elementoBandera.src = `https://flagcdn.com/w40/${moneda.pais}.png`;
        elementoBandera.alt = `Bandera de ${moneda.nombre}`;
    } else {
        elementoBandera.src = "";
        elementoBandera.alt = "Sin bandera";
    }
}

// Inicializar valores y banderas desde LocalStorage
function inicializarDesdeLocalStorage() {
    const cantidadGuardada = localStorage.getItem("cantidad") || "";
    const origenGuardado = localStorage.getItem("monedaOrigen") || monedas[0].codigo;
    const destinoGuardado = localStorage.getItem("monedaDestino") || monedas[1].codigo;

    entradaCantidad.value = cantidadGuardada;
    monedaOrigen.value = origenGuardado;
    monedaDestino.value = destinoGuardado;

    actualizarBandera(banderaOrigen, origenGuardado);
    actualizarBandera(banderaDestino, destinoGuardado);
}
inicializarDesdeLocalStorage();

// Guardar valores en LocalStorage al realizar cambios
function guardarEnLocalStorage() {
    localStorage.setItem("cantidad", entradaCantidad.value);
    localStorage.setItem("monedaOrigen", monedaOrigen.value);
    localStorage.setItem("monedaDestino", monedaDestino.value);
}

// Eventos para actualizar banderas y LocalStorage
monedaOrigen.addEventListener("change", (e) => {
    actualizarBandera(banderaOrigen, e.target.value);
    guardarEnLocalStorage();
});
monedaDestino.addEventListener("change", (e) => {
    actualizarBandera(banderaDestino, e.target.value);
    guardarEnLocalStorage();
});
entradaCantidad.addEventListener("input", guardarEnLocalStorage);

const toastLiveExample = document.getElementById('liveToast')
// Función para mostrar el toast con mensaje dinámico
function mostrarToast(mensaje) {
    const toastMessage = document.getElementById("toast-message");
    toastMessage.textContent = mensaje;

    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
}

// Función para obtener la tasa de cambio desde la API
const obtenerTasaCambio = async (origen, destino) => {
    const API_KEY = 'bae8d8bdcc114bb8a26b50d686cec7bc'; 
    const url = `https://openexchangerates.org/api/latest.json?app_id=${API_KEY}`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.rates && datos.rates[destino]) {
            const tasa = datos.rates[destino] / datos.rates[origen];
            return tasa;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error en la solicitud: ", error);
        return null;
    }
};

// Función para realizar la conversión
const convertirMoneda = async (cantidad, origen, destino) => {
    const tasa = await obtenerTasaCambio(origen, destino);
    if (tasa) {
        return cantidad * tasa;
    } else {
        return null;
    }
};

// Función para separar los miles
function separarMiles(numero) {
    return parseFloat(numero).toLocaleString();
}

// Manejo del formulario
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cantidad = parseFloat(entradaCantidad.value);
    const origen = monedaOrigen.value;
    const destino = monedaDestino.value;

    if (!cantidad || cantidad <= 0 || !origen || !destino) {
        mostrarToast("Por favor, ingresa valores válidos.")
        return;
    }

    if (origen === destino) {
        mostrarToast("Por favor, selecciona monedas diferentes.")
        return;
    }

    const resultado = await convertirMoneda(cantidad, origen, destino);

    if (resultado !== null) {
        const resultadoFormateado = separarMiles(resultado.toFixed(2));
        const cantidadFormateada = separarMiles(cantidad.toFixed(2));
        resultadoDiv.textContent = `${cantidadFormateada} ${origen} equivale a ${resultadoFormateado} ${destino}`;
    } else {
        mostrarToast("Hubo un problema con la conversión. Inténtalo de nuevo más tarde.")
    }
});

// Botón para limpiar los datos
botonLimpiar.addEventListener("click", () => {
    entradaCantidad.value = "";
    resultadoDiv.textContent = "El resultado aparecerá aquí...";
    monedaOrigen.selectedIndex = 0;
    monedaDestino.selectedIndex = 1;

    actualizarBandera(banderaOrigen, monedaOrigen.value);
    actualizarBandera(banderaDestino, monedaDestino.value);

    // Limpiar LocalStorage
    localStorage.clear();
});
