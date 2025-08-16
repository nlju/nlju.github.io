// ===== Smooth Plexus/Constellation Background =====
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let animationId = null;
let isAnimating = false;

const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = prefersReducedMotionQuery.matches;

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    if (numberOfParticles > 150) numberOfParticles = 150; // Cap particles for performance
    
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 1.5) + 0.5;
        const x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        const y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        const directionX = (Math.random() * 0.4) - 0.2;
        const directionY = (Math.random() * 0.4) - 0.2;
        const color = '#e0e0e0';

        particlesArray.push({ x, y, directionX, directionY, size, color });
    }
}

function drawParticlesOnce() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        const p = particlesArray[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) { // start at a+1 to skip self/dupes
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = (dx * dx) + (dy * dy);
            
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 20000);
                ctx.strokeStyle = `rgba(0, 240, 255, ${opacityValue * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        const particle = particlesArray[i];
        if (particle.x < 0 || particle.x > canvas.width) {
            particle.directionX = -particle.directionX;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
            particle.directionY = -particle.directionY;
        }
        particle.x += particle.directionX;
        particle.y += particle.directionY;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2, false);
        ctx.fillStyle = particle.color;
        ctx.fill();
    }
    connect();
}

function startAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    animate();
}

function stopAnimation() {
    if (animationId != null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    isAnimating = false;
}

function applyMotionPreference() {
    if (prefersReducedMotion) {
        stopAnimation();
        drawParticlesOnce();
        // Remove parallax and skip tilt init
        document.removeEventListener("mousemove", parallaxHandler);
    } else {
        startAnimation();
        // Ensure parallax is active
        document.addEventListener("mousemove", parallaxHandler);
    }
}

setCanvasSize();
window.addEventListener('resize', () => {
    setCanvasSize();
    if (prefersReducedMotion) {
        drawParticlesOnce();
    }
});

// Pause animation when tab is not visible (saves battery)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAnimation();
    } else if (!prefersReducedMotion) {
        startAnimation();
    }
});

// React to user changing reduced-motion preference live
if (typeof prefersReducedMotionQuery.addEventListener === 'function') {
    prefersReducedMotionQuery.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
        applyMotionPreference();
    });
}

// ===== Reveal On Scroll Animation =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach((el) => observer.observe(el));

// ===== 3D Tilt Effect Initialization =====
document.addEventListener("DOMContentLoaded", function() {
    const tiltElements = document.querySelectorAll(".card");
    if (!prefersReducedMotion && typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(tiltElements, {
            max: 15,
            perspective: 1000,
            scale: 1.05,
            speed: 400,
            glare: true,
            "max-glare": 0.5
        });
    }
});

// ===== Hero Section Parallax on Mouse Move =====
function parallaxHandler(e) {
    const parallaxElements = document.querySelectorAll("[data-parallax-speed]");

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const mouseX = (e.clientX - centerX) / centerX;
    const mouseY = (e.clientY - centerY) / centerY;

    parallaxElements.forEach(el => {
        const speed = Number(el.dataset.parallaxSpeed || 0);
        const x = speed * mouseX;
        const y = speed * mouseY;

        el.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// Apply motion preference on load
applyMotionPreference();
