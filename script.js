// Espera a que el DOM se cargue completamente
document.addEventListener("DOMContentLoaded", function() {
  /* ====================================================
     1. Typed.js para el texto dinámico
  ==================================================== */
  var typed = new Typed(".typed-text", {
    strings: [
      "¡Únete a mis streams!", 
      "¡Vamos a jugar juntos!", 
      "¡Haz parte de la comunidad!"
    ],
    typeSpeed: 50,
    backSpeed: 25,
    loop: true
  });

  /* ====================================================
     2. Navegación con scroll suave
  ==================================================== */
  const navLinks = document.querySelectorAll("header .navbar a");
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ====================================================
     3. Código del Minijuego: ¡Dispara y evita!
  ==================================================== */
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  let bullets = [];
  let targets = [];
  let score = 0;
  let gameRunning = true;

  // Objeto para el objetivo
  function Target(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.direction = 1; // 1 = derecha, -1 = izquierda
  }

  // Función para generar un objetivo en la parte superior del canvas
  function spawnTarget() {
    let targetX = Math.random() * (canvas.width - 40) + 20;
    let target = new Target(targetX, 50, 20, 2 + Math.random() * 2);
    targets.push(target);
  }

  // Actualiza la posición de los objetivos
  function updateTargets() {
    targets.forEach(target => {
      target.x += target.speed * target.direction;
      // Cambia de dirección si alcanza los bordes
      if (target.x + target.radius > canvas.width || target.x - target.radius < 0) {
        target.direction *= -1;
      }
    });
  }

  // Dibuja los objetivos en el canvas
  function drawTargets() {
    ctx.fillStyle = "#00ff00"; // Color verde para el objetivo
    targets.forEach(target => {
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });
  }

  // Objeto para la bala
  function Bullet(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = 5;
  }

  // Crea una bala al hacer click en el canvas
  canvas.addEventListener("click", function(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const startX = canvas.width / 2;
    const startY = canvas.height - 30;

    // Calcula el ángulo y la velocidad de la bala
    let angle = Math.atan2(clickY - startY, clickX - startX);
    let speed = 7;
    let dx = speed * Math.cos(angle);
    let dy = speed * Math.sin(angle);
    let bullet = new Bullet(startX, startY, dx, dy);
    bullets.push(bullet);
  });

  // Actualiza la posición de las balas y elimina las que salgan del canvas
  function updateBullets() {
    bullets = bullets.filter(bullet => {
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;
      return (bullet.x > 0 && bullet.x < canvas.width &&
              bullet.y > 0 && bullet.y < canvas.height);
    });
  }

  // Dibuja las balas en el canvas
  function drawBullets() {
    ctx.fillStyle = "#ff6347"; // Color para las balas (tomate)
    bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });
  }

  // Detección de colisiones entre balas y objetivos
  function detectCollisions() {
    // Recorre cada bala y cada objetivo para ver si hay colisión
    bullets.forEach((bullet, bIndex) => {
      targets.forEach((target, tIndex) => {
        let dx = bullet.x - target.x;
        let dy = bullet.y - target.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bullet.radius + target.radius) {
          // Se detecta colisión: se elimina la bala y el objetivo
          bullets.splice(bIndex, 1);
          targets.splice(tIndex, 1);
          score += 10;
          // Genera un nuevo objetivo tras una colisión
          spawnTarget();
        }
      });
    });
  }

  // Dibuja el puntaje en el canvas
  function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Puntaje: " + score, 10, 30);
  }

  // Bucle principal del juego
  function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBullets();
    updateTargets();
    detectCollisions();
    drawBullets();
    drawTargets();
    drawScore();
    requestAnimationFrame(gameLoop);
  }

  // Inicializa el juego
  spawnTarget();
  gameLoop();

  // Función para reiniciar o iniciar el juego (puede ser llamada desde el botón)
  window.startGame = function() {
    if (!gameRunning) {
      gameRunning = true;
      bullets = [];
      targets = [];
      score = 0;
      spawnTarget();
      gameLoop();
    }
    // Desplaza suavemente hasta la sección del juego
    document.getElementById("game").scrollIntoView({ behavior: "smooth" });
  };

});

