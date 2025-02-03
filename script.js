// Typed.js for dynamic text
var options = {
    strings: ["¡Únete a mis streams!", "¡Vamos a jugar juntos!", "¡Haz parte de la comunidad!"],
    typeSpeed: 50,
    backSpeed: 25,
    loop: true
};

var typed = new Typed(".typed-text", options);

// Minijuego interactivo
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var score = 0;
var bullets = [];

canvas.addEventListener('click', function(event) {
    var bullet = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        radius: 5,
        color: "#ff6347",
        speed: 5,
        dx: (event.clientX - canvas.offsetLeft - canvas.width / 2) / 10,
        dy: (event.clientY - canvas.offsetTop - canvas.height / 2) / 10
    };
    bullets.push(bullet);
});

function drawBullet(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.closePath();
}

function updateGameArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Move bullets
    bullets.forEach(function(bullet) {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        drawBullet(bullet);
    });
    
    // Score
    score++;
    document.getElementById('score').textContent = "Puntaje: " + score;
    requestAnimationFrame(updateGameArea);
}

updateGameArea();
