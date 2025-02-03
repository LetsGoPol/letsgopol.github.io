// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", function () {
  // Inicializa Typed.js
  new Typed(".typed-text", {
    strings: ["¡Únete a mis streams!", "¡Vamos a jugar juntos!", "¡Forma parte de la comunidad!"],
    typeSpeed: 50,
    backSpeed: 25,
    loop: true
  });
  // Inicializa Particles.js (la configuración ya está en index.html)
  updateUserCoinsDisplay();
  
  // Si estamos en la página de carrito, cargar el contenido
  if (document.getElementById("cartContent")) {
    loadCart();
  }
});

// SISTEMA DE USUARIOS
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

// Actualiza la visualización de monedas
function updateUserCoinsDisplay() {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let coins = currentUser ? (currentUser.coins || 0) : 0;
  let coinElem = document.getElementById("userCoins");
  if (coinElem) coinElem.textContent = coins;
}

// CARRITO DE COMPRAS
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
// Si se añade un producto mediante query string
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("producto")) {
    addToCart(urlParams.get("producto"));
    location.href = "cart.html";
  }
});

// MINIJUEGOS
// Variables y funciones para "Dispara y Evita"
const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let bullets = [], targets = [], gameScore = 0, gameRunning = false;
class Target {
  constructor(x, y, radius, speed) {
    this.x = x; this.y = y; this.radius = radius; this.speed = speed; this.direction = 1;
  }
  update() {
    this.x += this.speed * this.direction;
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.direction *= -1;
  }
  draw() {
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.radius = 5;
  }
  update() { this.x += this.dx; this.y += this.dy; }
  draw() {
    ctx.fillStyle = "#ff6347";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
function spawnTarget() {
  let x = Math.random() * (canvas.width - 40) + 20;
  targets.push(new Target(x, 50, 20, 2 + Math.random() * 2));
}
if (canvas) {
  canvas.addEventListener("click", function (e) {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    let clickX = e.clientX - rect.left, clickY = e.clientY - rect.top;
    let startX = canvas.width / 2, startY = canvas.height - 30;
    let angle = Math.atan2(clickY - startY, clickX - startX);
    let speed = 7;
    bullets.push(new Bullet(startX, startY, speed * Math.cos(angle), speed * Math.sin(angle)));
  });
}
function detectCollisions() {
  bullets.forEach((bullet, bi) => {
    targets.forEach((target, ti) => {
      if (Math.hypot(bullet.x - target.x, bullet.y - target.y) < bullet.radius + target.radius) {
        bullets.splice(bi, 1); targets.splice(ti, 1);
        gameScore += 10; spawnTarget();
      }
    });
  });
}
function gameLoop() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bullets.forEach(b => { b.update(); b.draw(); });
  targets.forEach(t => { t.update(); t.draw(); });
  detectCollisions();
  drawGameScore();
  requestAnimationFrame(gameLoop);
}
function drawGameScore() {
  if (!ctx) return;
  ctx.font = "20px Arial"; ctx.fillStyle = "#fff";
  ctx.fillText("Puntaje: " + gameScore, 10, 30);
  let scoreElem = document.getElementById("gameScore");
  if (scoreElem) scoreElem.textContent = "Puntaje: " + gameScore;
}
function startGame(gameType) {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) { alert("Debes iniciar sesión."); return; }
  let cost = gameType === 'dispara' ? 20 : (gameType === 'star' ? 15 : 25);
  if ((currentUser.coins || 0) < cost) { alert("No tienes suficientes monedas."); return; }
  currentUser.coins -= cost;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUserCoinsDisplay();
  if (gameType === 'dispara') {
    gameRunning = true; bullets = []; targets = []; gameScore = 0;
    spawnTarget(); gameLoop();
  } else if (gameType === 'star') {
    startStarGame();
  } else {
    startMemoryGame();
  }
}
// "Atrapa las Estrellas"
const starCanvas = document.getElementById("starGameCanvas");
const starCtx = starCanvas ? starCanvas.getContext("2d") : null;
let stars = [], starPlayer = { x: starCanvas ? starCanvas.width / 2 : 0, y: starCanvas ? starCanvas.height - 50 : 0, size: 20 }, starScore = 0, starGameRunning = false;
if (starCanvas) {
  starCanvas.addEventListener("mousemove", function (e) {
    let rect = starCanvas.getBoundingClientRect();
    starPlayer.x = e.clientX - rect.left;
  });
}
function spawnStar() {
  let x = Math.random() * (starCanvas.width - 20) + 10;
  stars.push({ x: x, y: 0, size: 10, speed: 2 + Math.random() * 3 });
}
function starGameLoop() {
  if (!starGameRunning) return;
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  starCtx.fillStyle = "#ff6347";
  starCtx.fillRect(starPlayer.x - starPlayer.size / 2, starPlayer.y - starPlayer.size / 2, starPlayer.size, starPlayer.size);
  if (Math.random() < 0.03) spawnStar();
  stars.forEach((star, i) => {
    star.y += star.speed;
    starCtx.fillStyle = "#ffff00";
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starCtx.fill();
    if (star.y + star.size > starPlayer.y - starPlayer.size / 2 &&
        star.x > starPlayer.x - starPlayer.size / 2 &&
        star.x < starPlayer.x + starPlayer.size / 2) {
      stars.splice(i, 1); starScore += 5;
    }
  });
  drawStarScore(); requestAnimationFrame(starGameLoop);
}
function drawStarScore() {
  if (!starCtx) return;
  starCtx.font = "20px Arial"; starCtx.fillStyle = "#fff";
  starCtx.fillText("Puntaje: " + starScore, 10, 30);
  let scoreElem = document.getElementById("starGameScore");
  if (scoreElem) scoreElem.textContent = "Puntaje: " + starScore;
}
function startStarGame() {
  starGameRunning = true; stars = []; starScore = 0;
  starGameLoop();
}
// Juego de Memoria (simplificado)
let memoryCards = [], memoryFlipped = [], memoryScore = 0;
function startMemoryGame() {
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) { alert("Debes iniciar sesión."); return; }
  if ((currentUser.coins || 0) < 25) { alert("No tienes suficientes monedas."); return; }
  currentUser.coins -= 25;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateUserCoinsDisplay();
  let container = document.getElementById("memory-game");
  container.innerHTML = "";
  memoryCards = []; memoryFlipped = []; memoryScore = 0;
  const images = ["😀","🎮","🚀","🌟","🎵","⚡","🔥","💎"];
  let cards = images.concat(images).sort(() => 0.5 - Math.random());
  cards.forEach((img, i) => {
    let card = document.createElement("div");
    card.classList.add("memory-card");
    card.dataset.value = img;
    card.dataset.index = i;
    card.textContent = "";
    card.addEventListener("click", flipCard);
    container.appendChild(card);
    memoryCards.push(card);
  });
}
function flipCard() {
  if (this.classList.contains("flipped")) return;
  this.classList.add("flipped"); this.textContent = this.dataset.value;
  memoryFlipped.push(this);
  if (memoryFlipped.length === 2) {
    setTimeout(checkMemoryMatch, 1000);
  }
}
function checkMemoryMatch() {
  const [card1, card2] = memoryFlipped;
  if (card1.dataset.value === card2.dataset.value) {
    memoryScore += 10;
  } else {
    card1.classList.remove("flipped"); card2.classList.remove("flipped");
    card1.textContent = ""; card2.textContent = "";
  }
  memoryFlipped = [];
  document.getElementById("memoryScore").textContent = "Puntaje: " + memoryScore;
}

// CANJE DE CÓDIGOS SECRETOS
function redeemSecretCode() {
  let code = document.getElementById("secretCode").value.trim();
  let validCodes = JSON.parse(localStorage.getItem("secretCodes")) || [];
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) { alert("Debes iniciar sesión."); return; }
  let found = validCodes.find(item => item.code === code);
  if (found) {
    currentUser.coins = (currentUser.coins || 0) + found.value;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateUserCoinsDisplay();
    alert("Código canjeado: +" + found.value + " monedas");
    validCodes = validCodes.filter(item => item.code !== code);
    localStorage.setItem("secretCodes", JSON.stringify(validCodes));
  } else { alert("Código incorrecto."); }
}
