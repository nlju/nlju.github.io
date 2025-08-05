// ===== NEW, OPTIMIZED: 3D Starfield Background =====
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

const stars = [];
const numStars = 800; // Increased star count for a fuller look
const speed = 0.5;
const focalLength = canvas.width / 2;

for (let i = 0; i < numStars; i++) {
    stars.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: Math.random() * canvas.width,
    });
}

function draw() {
    ctx.fillStyle = "#050816";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        star.z -= speed;

        if (star.z <= 0) {
            star.z = canvas.width;
        }

        const k = focalLength / star.z;
        const px = star.x * k;
        const py = star.y * k;

        const size = (1 - star.z / canvas.width) * 4;
        const shade = parseInt((1 - star.z / canvas.width) * 255);
        ctx.fillStyle = `rgba(0, 240, 255, ${shade / 255 * 0.7})`; // Use primary color with opacity
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
    requestAnimationFrame(draw);
}
draw();

// ===== Reveal On Scroll Animation (Unchanged) =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1
});

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach((el) => observer.observe(el));
