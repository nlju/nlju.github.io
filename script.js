// ===== Reveal On Scroll Animation =====
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

// ===== 3D Tilt Effect Initialization =====
document.addEventListener("DOMContentLoaded", function() {
    const tiltElements = document.querySelectorAll(".card");

    VanillaTilt.init(tiltElements, {
        max: 15,
        perspective: 1000,
        scale: 1.05,
        speed: 400,
        glare: true,
        "max-glare": 0.5
    });
});

// ===== Hero Section Parallax on Mouse Move =====
document.addEventListener("mousemove", function(e) {
    const parallaxElements = document.querySelectorAll("[data-parallax-speed]");

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const mouseX = (e.clientX - centerX) / centerX;
    const mouseY = (e.clientY - centerY) / centerY;

    parallaxElements.forEach(el => {
        const speed = el.dataset.parallaxSpeed;
        const x = speed * mouseX;
        const y = speed * mouseY;

        el.style.transform = `translate(${x}px, ${y}px)`;
    });
});
