function mostrarMensaje() {
    alert("¡Hola! Has hecho clic en el botón.");
}

function mostrarTienda() {
    let tienda = document.getElementById("productos");
    if (tienda.classList.contains("hidden")) {
        tienda.classList.remove("hidden");
    } else {
        tienda.classList.add("hidden");
    }
}

function registrarVoto(voto) {
    let resultado = document.getElementById("resultado");
    resultado.textContent = "Gracias por tu voto: " + voto;
}
