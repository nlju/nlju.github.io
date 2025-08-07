// The starfield background code remains the same for now.
// We will integrate it into the 3D scene later if needed,
// but for now, it can stay as it is.

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

function animateBackground() {
    requestAnimationFrame(animateBackground);
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
animateBackground();

// ==========================================================
// THE 3D LOGIC WILL BE ADDED HERE IN THE NEXT STEPS
// ==========================================================
