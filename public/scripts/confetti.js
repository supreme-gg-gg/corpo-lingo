/*
 * script for confetti animation
 * Call startConfetti() to start a full-screen confetti effect
 * Call stopConfetti() to stop animation
 * Place a <canvas></canvas> in the html body in order for this to work
*/

const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const confettiPieces = [];
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
let isAnimating = false;
let animationId = null;

class ConfettiPiece {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.width = Math.random() * 10 + 5;
        this.height = Math.random() * 10 + 5;
        this.speed = Math.random() * 3 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.restore();
    }
}

// Create initial confetti pieces
for (let i = 0; i < 420; i++) {
    confettiPieces.push(new ConfettiPiece());
}

function animate() {
    if (!isAnimating) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiPieces.forEach(piece => {
        piece.update();
        piece.draw();
    });

    animationId = requestAnimationFrame(animate);
}

function startConfetti() {
    if (!isAnimating) {
        isAnimating = true;
        animate();
    }
}

function stopConfetti() {
    isAnimating = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Reset all confetti pieces to top
    confettiPieces.forEach(piece => piece.reset());
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});