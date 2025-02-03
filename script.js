// -------------------------
// INICIALIZACIÓN GLOBAL
// -------------------------
document.addEventListener("DOMContentLoaded", function () {
  // Inicialización de Typed.js
  new Typed(".typed-text", {
    strings: ["¡Únete a mis streams!", "¡Vamos a jugar juntos!", "¡Forma parte de la comunidad!"],
    typeSpeed: 50,
    backSpeed: 25,
    loop: true
  });
  
  // Inicialización de Particles.js ya se realizó en index.html
  // Cargar monedas del usuario (simulado, se guarda en localStorage)
  updateUserCoinsDisplay();
});

// Función para actualizar la visualización de monedas
function updateUserCoinsDisplay() {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let coins = currentUser ? (currentUser.coins || 0) : 0;
  let coinElem = document.getElementById("userCoins");
  if (coinElem) coinElem.textContent = coins;
}

// -------------------------
// SISTEMA DE MONEDAS Y CÓDIGOS SECRETOS
// -------------------------
function redeemSecretCode() {
  let code = document.getElementById("secretCode").value.trim();
  let validCodes = JSON.parse(localStorage.getItem("secretCodes")) || [];
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Debes iniciar sesión.");
    return;
  }
  let found = validCodes.find(item => item.code === code);
  if (found) {
    // Sumar monedas al usuario y eliminar el código (si se usa solo una vez)
    currentUser.coins = (currentUser.coins || 0) + found.value;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateUserCoinsDisplay();
    alert("Código canjeado: +" + found.value + " monedas");
    // Remover el código de la lista
    validCodes = validCodes.filter(item => item.code !== code);
    localStorage.setItem("secretCodes", JSON.stringify(validCodes));
  } else {
    alert("Código incorrecto.");
  }
}

// -------------------------
// REGISTRO E INICIO DE SESIÓN
// -------------------------
function saveUser(user) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.username === user.username)) return false;
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  return true;
}

function loginUser(username, password) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return true;
  }
  return false;
}

// Manejo de formularios en login.html y register.html (ya implementado en esos archivos)

// -------------------------
// CARRITO DE COMPRAS
// -------------------------
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const cartContent = document.getElementById("cartContent");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cartContent) return;
  if (cart.length === 0) {
    cartContent.textContent = "El carrito está vacío.";
  } else {
    cartContent.innerHTML = "";
    cart.forEach((prod, index) => {
      let div = document.createElement("div");
      div.textContent = (index + 1) + ". " + prod;
      cartContent.appendChild(div);
    });
  }
}

function confirmarCompra() {
  alert("Compra confirmada. ¡Gracias por tu compra!");
  localStorage.removeItem("cart");
  loadCart();
}

// En cart.html, al cargar se llama loadCart() y se agrega el producto si existe query string
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("producto")) {
    addToCart(urlParams.get("producto"));
    location.href = "cart.html";
  }
});

// -------------------------
// MINIJUEGOS: DISPARA Y EVITA, ATRAPA LAS ESTRELLAS, MEMORIA
// Cada juego verificará si el usuario tiene suficientes monedas, deducirá el coste y luego iniciará el juego.
// (Los juegos se encuentran en juegos.html; funciones startGame, startStarGame, startMemoryGame se definen aquí)
// Ejemplo para Dispara y Evita:
function startGame(gameType) {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) { alert("Debes iniciar sesión."); return; }
  let cost = gameType === 'dispara' ? 20 : (gameType === 'star' ? 15 : 25);
  if ((currentUser.coins || 0) < cost) { alert("No tienes suficientes monedas."); return; }
  currentUser.coins -= cost;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUserCoinsDisplay();
  // Iniciar el juego correspondiente (las funciones gameLoop, starGameLoop, etc. ya definidas)
  if (gameType === 'dispara') {
    gameRunning = true;
    bullets = [];
    targets = [];
    gameScore = 0;
    spawnTarget();
    gameLoop();
  } else if (gameType === 'star') {
    starGameRunning = true;
    stars = [];
    starScore = 0;
    starGameLoop();
  }
}

function startMemoryGame() {
  // Verificar monedas y deducir coste (25 monedas)
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) { alert("Debes iniciar sesión."); return; }
  if ((currentUser.coins || 0) < 25) { alert("No tienes suficientes monedas."); return; }
  currentUser.coins -= 25;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUserCoinsDisplay();
  // Iniciar juego de memoria (ya definido)
  // ...
  // Se llama a startMemoryGame() que genera las tarjetas
}

// -------------------------
// (Aquí se incluyen las funciones para los juegos Dispara y Evita, Atrapa las Estrellas, y Memoria)
// El código de ejemplo para Dispara y Evita y Atrapa las Estrellas se ha presentado en la versión anterior.
// Para el juego de memoria se generan tarjetas y se evalúan pares, etc.

// -------------------------
// SORTEOS: TRAGAPERRAS
document.getElementById("slotSpinBtn") && document.getElementById("slotSpinBtn").addEventListener("click", function(){
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) { alert("Debes iniciar sesión."); return; }
  if ((currentUser.coins || 0) < 10) { alert("No tienes suficientes monedas."); return; }
  currentUser.coins -= 10;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUserCoinsDisplay();
  // Simular giro de tragaperras
  let result = Math.random() < 0.3 ? "¡Ganaste 50 monedas!" : "No ganaste, intenta de nuevo.";
  if (result.includes("50")) { currentUser.coins += 50; localStorage.setItem("currentUser", JSON.stringify(currentUser)); updateUserCoinsDisplay(); }
  document.getElementById("slotResult").textContent = result;
});

// Botón para PayPal (paypalSpinBtn) redirige a PayPal; este botón está en giveaways.html

// -------------------------
// FIN DE script.js
