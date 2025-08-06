/* 
 * =======================================================
 * VinskiNieminen.com - "The Bioluminescent Deep"
 * =======================================================
 */

// =======================================================
// PART 1: SETUP THE 3D SCENE (Unchanged)
// =======================================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// =======================================================
// PART 2: CREATE THE PARTICLES (Unchanged)
// =======================================================
const particleCanvas = document.createElement('canvas');
const particleContext = particleCanvas.getContext('2d');
particleCanvas.width = 16;
particleCanvas.height = 16;
const gradient = particleContext.createRadialGradient(particleCanvas.width / 2, particleCanvas.height / 2, 0, particleCanvas.width / 2, particleCanvas.height / 2, particleCanvas.width / 2);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
particleContext.fillStyle = gradient;
particleContext.fillRect(0, 0, particleCanvas.width, particleCanvas.height);
const particleTexture = new THREE.CanvasTexture(particleCanvas);

const particlesCount = 5000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const themeColors = [new THREE.Color(0x00f0ff), new THREE.Color(0x915eff)];

for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
    const randomColor = themeColors[Math.floor(Math.random() * themeColors.length)];
    colors[i3 + 0] = randomColor.r;
    colors[i3 + 1] = randomColor.g;
    colors[i3 + 2] = randomColor.b;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1, sizeAttenuation: true, map: particleTexture,
    transparent: true, blending: THREE.AdditiveBlending, vertexColors: true
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);


// =======================================================
// PART 3: THE ANIMATION LOOP (*** HEAVILY UPGRADED ***)
// =======================================================

// A clock to keep track of time for smooth, consistent animation
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime(); // Time since the app started

    // --- Passive Animation: Gentle particle movement ---
    // We'll rotate the entire particle system slowly to give a sense of drift
    particles.rotation.y = elapsedTime * 0.05;
    particles.rotation.x = elapsedTime * 0.02;

    // This tells the browser we want to perform the next frame of animation
    requestAnimationFrame(animate);

    // Render the scene from the camera's perspective
    renderer.render(scene, camera);
}
// Start the animation loop!
animate();


// =======================================================
// PART 4: EVENT LISTENERS (*** UPGRADED ***)
// =======================================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onWindowResize);

// --- NEW: Scroll-based animation ---
function onScroll() {
    // Get how many pixels the user has scrolled down
    const scrollY = window.scrollY;
    
    // The main parallax effect: move the camera's Z position
    // As we scroll down (scrollY increases), we move the camera closer (z decreases)
    // This creates the illusion of flying forward through the particles.
    camera.position.z = 25 - scrollY * 0.04;
}
window.addEventListener('scroll', onScroll, { passive: true }); // Use passive for better performance


/* 
 * =======================================================
 * ESSENTIAL UTILITIES FROM V1 (DO NOT REMOVE)
 * =======================================================
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });
const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach((el) => observer.observe(el));
document.addEventListener("DOMContentLoaded", function() {
    if (typeof VanillaTilt !== 'undefined') {
        const tiltElements = document.querySelectorAll(".card");
        VanillaTilt.init(tiltElements, {
            max: 15, perspective: 1000, scale: 1.05,
            speed: 400, glare: true, "max-glare": 0.5
        });
    }
});
