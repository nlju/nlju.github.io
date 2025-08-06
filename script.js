/* 
 * =======================================================
 * VinskiNieminen.com - "The Bioluminescent Deep"
 * =======================================================
 * 
 * This script uses the three.js library to create a
 * procedural 3D environment of floating, glowing
 * particles that react to user scrolling.
 * 
 */

// THREE.JS SCENE WILL GO HERE IN THE NEXT STEP


/* 
 * =======================================================
 * ESSENTIAL UTILITIES FROM V1
 * =======================================================
 * 
 * These are scripts from the original site that are
 * required for basic functionality like animations.
 * 
 */

// ===== 1. Reveal On Scroll Animation =====
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


// ===== 2. 3D Tilt Effect Initialization =====
// We need to re-import the vanilla-tilt.js library for this to work.
document.addEventListener("DOMContentLoaded", function() {
    // Check if VanillaTilt is available before trying to use it
    if (typeof VanillaTilt !== 'undefined') {
        const tiltElements = document.querySelectorAll(".card");
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
