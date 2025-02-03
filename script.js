// Espera a que el DOM se cargue
document.addEventListener("DOMContentLoaded", function () {
  /* ====================================================
     1. Typed.js para texto dinámico en la sección HERO
  ==================================================== */
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

  /* ====================================================
     2. Scroll suave para navegación
  ==================================================== */
  const navLinks = document.querySelectorAll("header .navbar a");
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      scrollToSection(targetId);
    });
  });

  window.scrollToSection = function (sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ====================================================
     3. Fondo animado con Particles.js en la sección HERO
  ==================================================== */
  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 100,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#ff6347"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000"
        }
      },
      "opacity": {
        "value": 0.5,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 1,
          "opacity_min": 0.1
        }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 5,
          "size_min": 0.1
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#ff6347",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 3,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "repulse"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        }
      }
    }
  });

  /* ====================================================
     4. Minijuego "Dispara y Evita"
  ==================================================== */
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  let bullets = [];
  let targets = [];
  let gameScore = 0;
  let gameRunning = false;

  // Clase para los objetivos
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

  // Clase para las balas
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

  // Genera un objetivo aleatorio
  function spawnTarget() {
    let x = Math.random() * (canvas.width - 40) + 20;
    targets.push(new Target(x, 50, 20, 2 + Math.random() * 2));
  }

  // Maneja disparo de balas al hacer clic
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

  // Detección de colisiones
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

  // Bucle del juego "Dispara y Evita"
  function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bullets.forEach(b => {
      b.update();
      b.draw();
    });
    targets.forEach(t => {
      t.update();
      t.draw();
    });
    detectCollisions();
    drawGameScore();
    requestAnimationFrame(gameLoop);
  }

  function drawGameScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Puntaje: " + gameScore, 10, 30);
    document.getElementById("gameScore").textContent = "Puntaje: " + gameScore;
  }

  window.startGame = function (gameType) {
    if (gameType === 'dispara') {
      // Reinicia el juego "Dispara y Evita"
      gameRunning = true;
      bullets = [];
      targets = [];
      gameScore = 0;
      spawnTarget();
      gameLoop();
      scrollToSection('games');
    } else if (gameType === 'star') {
      // Inicia el juego "Atrapa las Estrellas"
      startStarGame();
      scrollToSection('games');
    }
  };

  /* ====================================================
     5. Minijuego "Atrapa las Estrellas" (Ejemplo Adicional)
  ==================================================== */
  const starCanvas = document.getElementById("starGameCanvas");
  const starCtx = starCanvas.getContext("2d");
  let stars = [];
  let starPlayer = { x: starCanvas.width / 2, y: starCanvas.height - 50, size: 20 };
  let starScore = 0;
  let starGameRunning = false;

  // Genera estrellas aleatorias
  function spawnStar() {
    const x = Math.random() * (starCanvas.width - 20) + 10;
    stars.push({ x, y: 0, size: 10, speed: 2 + Math.random() * 3 });
  }

  // Mueve el jugador con el ratón
  starCanvas.addEventListener("mousemove", function (e) {
    const rect = starCanvas.getBoundingClientRect();
    starPlayer.x = e.clientX - rect.left;
  });

  // Bucle del juego "Atrapa las Estrellas"
  function starGameLoop() {
    if (!starGameRunning) return;
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    // Dibuja al jugador
    starCtx.fillStyle = "#ff6347";
    starCtx.fillRect(starPlayer.x - starPlayer.size / 2, starPlayer.y - starPlayer.size / 2, starPlayer.size, starPlayer.size);
    // Genera y dibuja estrellas
    if (Math.random() < 0.03) spawnStar();
    stars.forEach((star, index) => {
      star.y += star.speed;
      starCtx.fillStyle = "#ffff00";
      starCtx.beginPath();
      starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      starCtx.fill();
      // Detecta colisión
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
    document.getElementById("starGameScore").textContent = "Puntaje: " + starScore;
  }

  function startStarGame() {
    starGameRunning = true;
    stars = [];
    starScore = 0;
    starGameLoop();
  }
});
