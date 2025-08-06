/* 
 * =======================================================
 * VinskiNieminen.com - "The Bioluminescent Deep"
 *
 * Director's Cut - v2.0
 * =======================================================
 */

// =======================================================
// PART 1: SETUP (Largely the same, but with adjustments)
// =======================================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// START CLOSER: We start the camera inside the particle field for immersion.
camera.position.z = 5; 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    // NEW: Make the background transparent so we can use CSS for the base color
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// NEW: Use CSS for the background color so it's always there
canvas.style.backgroundColor = '#050816';


// =======================================================
// PART 2: PARTICLES (Unchanged)
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

// Create a much deeper field of particles
const particlesCount = 10000; 
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const themeColors = [new THREE.Color(0x00f0ff), new THREE.Color(0x915eff)];

for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    // Spread them out more, especially on the Z axis
    positions[i3 + 0] = (Math.random() - 0.5) * 30; // x
    positions[i3 + 1] = (Math.random() - 0.5) * 30; // y
    positions[i3 + 2] = (Math.random() - 0.5) * 80; // z (much deeper)
    
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
// PART 3: CINEMATIC CAMERA ENGINE (*** COMPLETELY NEW ***)
// =======================================================

// This object will store our scroll position
const scrollState = {
    y: 0
};

// This object will store the camera's target position
const cameraTarget = {
    z: 5 // The camera wants to be at z=5 initially
};

// Listen for the scroll event
window.addEventListener('scroll', () => {
    scrollState.y = window.scrollY;
    
    // As we scroll, update where the camera SHOULD be.
    // We move from z=5 towards z=-60 (the depth of our particle field)
    // The multiplier is much smaller for a slower, more cinematic feel.
    cameraTarget.z = 5 - scrollState.y * 0.015;
}, { passive: true });

// The "lerp" function: Linear Interpolation.
// This is the secret to smoothness. It moves a value (start) towards
// another value (end) by a small amount (t).
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // SMOOTHING: Instead of jumping, the camera's actual position
    // "lerps" towards its target position. 0.1 is the "smoothing factor".
    camera.position.z = lerp(camera.position.z, cameraTarget.z, 0.05);

    // Subtle passive rotation
    particles.rotation.y = elapsedTime * 0.01;
    
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


// =======================================================
// PART 4: UTILITIES (Listeners and V1 scripts)
// =======================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onWindowResize);

// Essential V1 Scripts
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
