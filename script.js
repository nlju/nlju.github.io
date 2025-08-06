// ===== NEW: Smooth Plexus/Constellation Background =====
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let particlesArray;

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    if (numberOfParticles > 150) numberOfParticles = 150; // Cap particles for performance
    
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 1.5) + 0.5;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * .4) - .2;
        let directionY = (Math.random() * .4) - .2;
        let color = '#e0e0e0';

        particlesArray.push({x, y, directionX, directionY, size, color});
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            if (distance < (canvas.width/7) * (canvas.height/7)) {
                opacityValue = 1 - (distance/20000);
                ctx.strokeStyle = `rgba(0, 240, 255, ${opacityValue * 0.3})`; // Use primary color for lines
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
    requestAnimationFrame(animate);
    ctx.clearRect(0,0,innerWidth,innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        let particle = particlesArray[i];
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

setCanvasSize();
window.addEventListener('resize', setCanvasSize);
animate();


// ===== Reveal On Scroll Animation (Unchanged) =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1 // Trigger when 10% of the element is visible
});

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach((el) => observer.observe(el));
// ===== NEW: 3D Tilt Effect Initialization =====
document.addEventListener("DOMContentLoaded", function() {
    // We select all elements that have the class "card"
    const tiltElements = document.querySelectorAll(".card");

    // Apply the tilt effect to all selected cards
    VanillaTilt.init(tiltElements, {
        max: 15,          // Max tilt rotation (degrees)
        perspective: 1000, // Transform perspective, the lower the more extreme the tilt
        scale: 1.05,       // 1.05 = 5% increase on hover
        speed: 400,       // Speed of the enter/exit transition
        glare: true,      // If you want a glare effect
        "max-glare": 0.5  // From 0 to 1, the glare opacity
    });
});
