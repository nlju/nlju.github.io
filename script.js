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
camera.position.z = 25; // Move camera back
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// =======================================================
// PART 2: CREATE THE PARTICLES (*** HEAVILY UPGRADED ***)
// =======================================================

// --- Create the particle texture ---
// We will create a texture programmatically using another canvas.
const particleCanvas = document.createElement('canvas');
const particleContext = particleCanvas.getContext('2d');
particleCanvas.width = 16;
particleCanvas.height = 16;

// Create a soft, circular, glowing gradient
const gradient = particleContext.createRadialGradient(
    particleCanvas.width / 2, // x0
    particleCanvas.height / 2, // y0
    0, // r0
    particleCanvas.width / 2, // x1
    particleCanvas.height / 2, // y1
    particleCanvas.width / 2  // r1
);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
particleContext.fillStyle = gradient;
particleContext.fillRect(0, 0, particleCanvas.width, particleCanvas.height);

const particleTexture = new THREE.CanvasTexture(particleCanvas);


const particlesCount = 5000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);
// --- NEW: Create an array for particle colors ---
const colors = new Float32Array(particlesCount * 3);
const themeColors = [new THREE.Color(0x00f0ff), new THREE.Color(0x915eff)]; // Cyan, Purple

for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3; // a shorthand for the current particle's index

    // Position
    positions[i3 + 0] = (Math.random() - 0.5) * 20; // x
    positions[i3 + 1] = (Math.random() - 0.5) * 20; // y
    positions[i3 + 2] = (Math.random() - 0.5) * 20; // z

    // --- NEW: Assign a random color from our theme ---
    const randomColor = themeColors[Math.floor(Math.random() * themeColors.length)];
    colors[i3 + 0] = randomColor.r; // r
    colors[i3 + 1] = randomColor.g; // g
    colors[i3 + 2] = randomColor.b; // b
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// --- NEW: Set the color attribute on our geometry ---
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));


// --- UPGRADED: The particle material ---
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    map: particleTexture, // Use our new circular texture
    transparent: true,    // Required for the texture's transparency
    blending: THREE.AdditiveBlending, // Makes overlapping particles glow brighter
    vertexColors: true    // Tell three.js to use the individual colors we set
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);


// =======================================================
// PART 3: THE ANIMATION LOOP (Unchanged for now)
// =======================================================
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


// =======================================================
// PART 4: EVENT LISTENERS (Unchanged)
// =======================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onWindowResize);


/* 
 * =======================================================
 * ESSENTIAL UTILITIES FROM V1 (DO NOT REMOVE)
 * =======================================================
 */
// (This section is unchanged and remains at the bottom)
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
