// --- INICIALIZACIONES DE TEXTO Y PARTÍCULAS ---
document.addEventListener("DOMContentLoaded", function () {
  // Typed.js para el texto dinámico
  var typed = new Typed(".typed-text", {
    strings: [
      "¡Únete a mis streams!",
      "¡Vamos a jugar juntos!",
      "¡Forma parte de la comunidad!"
    ],
    typeSpeed: 50,
    backSpeed: 25,
    loop: true
  });

  // Scroll suave para enlaces del menú
  const navLinks = document.querySelectorAll("header .navbar a");
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      // Si el href es de otra página (login, register, etc.), no se aplica scroll
      if (this.href.indexOf('http') !== -1 && !this.href.includes(location.host)) return;
      if (this.getAttribute("href").charAt(0) === "#") {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Inicializar Particles.js en la sección HERO
  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 100,
        "density": { "enable": true, "value_area": 800 }
      },
      "color": { "value": "#ff6347" },
      "shape": { "type": "circle" },
      "opacity": {
        "value": 0.5,
        "random": true,
        "anim": { "enable": true, "speed": 1, "opacity_min": 0.1 }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": { "enable": true, "speed": 5, "size_min": 0.1 }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#ff6347",
        "opacity": 0.4,
        "width": 1
      },
      "move": { "enable": true, "speed": 3, "direction": "none", "random": true, "out_mode": "out" }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": true, "mode": "repulse" },
        "onclick": { "enable": true, "mode": "push" }
      }
    }
  });
});

// --- MINIJUEGO: DISPARA Y EVITA ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
let bullets = [];
let targets = [];
let gameScore = 0;
let gameRunning = false;

class Target {
  constructor(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.direction = 1;
  }
  update() {
    this.x += this.speed * this.direction;
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.direction *= -1;
    }
  }
  draw() {
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = 5;
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;
  }
  draw() {
    ctx.fillStyle = "#ff6347";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
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
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const startX = canvas.width / 2;
    const startY = canvas.height - 30;
    const angle = Math.atan2(clickY - startY, clickX - startX);
    const speed = 7;
    const dx = speed * Math.cos(angle);
    const dy = speed * Math.sin(angle);
    bullets.push(new Bullet(startX, startY, dx, dy));
  });
}

function detectCollisions() {
  bullets.forEach((bullet, bIndex) => {
    targets.forEach((target, tIndex) => {
      const dist = Math.hypot(bullet.x - target.x, bullet.y - target.y);
      if (dist < bullet.radius + target.radius) {
        bullets.splice(bIndex, 1);
        targets.splice(tIndex, 1);
        gameScore += 10;
        spawnTarget();
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
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Puntaje: " + gameScore, 10, 30);
  const scoreElem = document.getElementById("gameScore");
  if (scoreElem) scoreElem.textContent = "Puntaje: " + gameScore;
}

window.startGame = function (gameType) {
  if (gameType === 'dispara') {
    gameRunning = true;
    bullets = [];
    targets = [];
    gameScore = 0;
    spawnTarget();
    gameLoop();
    document.getElementById("games").scrollIntoView({ behavior: "smooth" });
  } else if (gameType === 'star') {
    startStarGame();
    document.getElementById("games").scrollIntoView({ behavior: "smooth" });
  }
};

// --- MINIJUEGO: ATRAPA LAS ESTRELLAS ---
const starCanvas = document.getElementById("starGameCanvas");
const starCtx = starCanvas ? starCanvas.getContext("2d") : null;
let stars = [];
let starPlayer = { x: starCanvas ? starCanvas.width / 2 : 0, y: starCanvas ? starCanvas.height - 50 : 0, size: 20 };
let starScore = 0;
let starGameRunning = false;

function spawnStar() {
  const x = Math.random() * (starCanvas.width - 20) + 10;
  stars.push({ x, y: 0, size: 10, speed: 2 + Math.random() * 3 });
}

if (starCanvas) {
  starCanvas.addEventListener("mousemove", function (e) {
    const rect = starCanvas.getBoundingClientRect();
    starPlayer.x = e.clientX - rect.left;
  });
}

function starGameLoop() {
  if (!starGameRunning) return;
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  starCtx.fillStyle = "#ff6347";
  starCtx.fillRect(starPlayer.x - starPlayer.size / 2, starPlayer.y - starPlayer.size / 2, starPlayer.size, starPlayer.size);
  if (Math.random() < 0.03) spawnStar();
  stars.forEach((star, index) => {
    star.y += star.speed;
    starCtx.fillStyle = "#ffff00";
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starCtx.fill();
    if (star.y + star.size > starPlayer.y - starPlayer.size / 2 &&
        star.x > starPlayer.x - starPlayer.size / 2 &&
        star.x < starPlayer.x + starPlayer.size / 2) {
      stars.splice(index, 1);
      starScore += 5;
    }
  });
  drawStarScore();
  requestAnimationFrame(starGameLoop);
}

function drawStarScore() {
  starCtx.font = "20px Arial";
  starCtx.fillStyle = "#fff";
  starCtx.fillText("Puntaje: " + starScore, 10, 30);
  const scoreElem = document.getElementById("starGameScore");
  if (scoreElem) scoreElem.textContent = "Puntaje: " + starScore;
}

function startStarGame() {
  starGameRunning = true;
  stars = [];
  starScore = 0;
  starGameLoop();
}

// --- MINIJUEGO: MEMORIA (Juego de Tarjetas) ---
let memoryCards = [];
let memoryFlipped = [];
let memoryScore = 0;

function startMemoryGame() {
  const memoryContainer = document.getElementById("memory-game");
  memoryContainer.innerHTML = "";
  memoryCards = [];
  memoryFlipped = [];
  memoryScore = 0;
  // Crear 8 pares de tarjetas (total 16 tarjetas)
  const images = ["😀", "🎮", "🚀", "🌟", "🎵", "⚡", "🔥", "💎"];
  let cards = images.concat(images);
  cards.sort(() => 0.5 - Math.random());
  cards.forEach((img, index) => {
    const card = document.createElement("div");
    card.classList.add("memory-card");
    card.dataset.value = img;
    card.dataset.index = index;
    card.textContent = "";
    card.addEventListener("click", flipCard);
    memoryContainer.appendChild(card);
    memoryCards.push(card);
  });
}

function flipCard() {
  if (this.classList.contains("flipped")) return;
  this.classList.add("flipped");
  this.textContent = this.dataset.value;
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
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
    card1.textContent = "";
    card2.textContent = "";
  }
  memoryFlipped = [];
  document.getElementById("memoryScore").textContent = "Puntaje: " + memoryScore;
}

// --- REGISTRO E INICIO DE SESIÓN (LOCAL STORAGE) ---
function saveUser(user) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  // Evitar duplicados por nombre
  if (users.find(u => u.username === user.username)) {
    return false;
  }
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  return true;
}

function loginUser(username, password) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return true;
  }
  return false;
}

// Manejo de formularios en login.html y register.html
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("registerUsername").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value.trim();
      if (saveUser({ username, email, password, score: 0 })) {
        alert("Registro exitoso. Ahora inicia sesión.");
        location.href = "login.html";
      } else {
        alert("El nombre de usuario ya existe.");
      }
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      if (loginUser(username, password)) {
        alert("Bienvenido, " + username);
        location.href = "index.html";
      } else {
        alert("Credenciales incorrectas.");
      }
    });
  }
});

// --- NOTAS (GUARDAR EN LOCAL STORAGE) ---
const saveNoteBtn = document.getElementById("saveNoteBtn");
if (saveNoteBtn) {
  saveNoteBtn.addEventListener("click", function () {
    const noteText = document.getElementById("userNote").value.trim();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      alert("Debes iniciar sesión para guardar tu nota.");
      return;
    }
    localStorage.setItem("note_" + currentUser.username, noteText);
    document.getElementById("savedNote").textContent = "Nota guardada: " + noteText;
  });
}

// --- CARRITO DE COMPRAS (SIMULADO) ---
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const cartContent = document.getElementById("cartContent");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    cartContent.textContent = "El carrito está vacío.";
  } else {
    cartContent.innerHTML = "";
    cart.forEach((prod, index) => {
      const div = document.createElement("div");
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

document.addEventListener("DOMContentLoaded", function () {
  // En carrito.html cargar productos si existe
  if (document.getElementById("cartContent")) {
    loadCart();
  }

  // En carrito.html: Agregar producto desde query string
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("producto")) {
    addToCart(urlParams.get("producto"));
    // Redirigir al carrito
    location.href = "carrito.html";
  }
});
