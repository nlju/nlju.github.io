/* 
 * =======================================================
 * VinskiNieminen.com - "The Bioluminescent Deep"
 *
 * Director's Cut - v2.1 (Phase 2, Part A - CORRECTED)
 * =======================================================
 */

// =======================================================
// PART 1: SETUP
// =======================================================
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvas.style.backgroundColor = '#050816';


// =======================================================
// PART 2: PARTICLES
// =======================================================
const particleCanvas = document.createElement('canvas');
const particleContext = particleCanvas.getContext('2d');
particleCanvas.width = 16; particleCanvas.height = 16;
const gradient = particleContext.createRadialGradient(particleCanvas.width / 2, particleCanvas.height / 2, 0, particleCanvas.width / 2, particleCanvas.height / 2, particleCanvas.width / 2);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
particleContext.fillStyle = gradient;
particleContext.fillRect(0, 0, particleCanvas.width, particleCanvas.height);
const particleTexture = new THREE.CanvasTexture(particleCanvas);

const particlesCount = 10000; 
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);
const themeColors = [new THREE.Color(0x00f0ff), new THREE.Color(0x915eff)];

for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 30;
    positions[i3 + 1] = (Math.random() - 0.5) * 30;
    positions[i3 + 2] = (Math.random() - 0.5) * 80;
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
// PART 3: CINEMATIC CAMERA ENGINE
// =======================================================
const scrollState = { y: 0 };
const cameraTarget = { z: 5 };
window.addEventListener('scroll', () => {
    scrollState.y = window.scrollY;
    cameraTarget.z = 5 - scrollState.y * 0.015;
}, { passive: true });

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// =======================================================
// PART 4: ANIMATION LOOP (Will be upgraded in the final step)
// =======================================================
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();
    camera.position.z = lerp(camera.position.z, cameraTarget.z, 0.05);
    particles.rotation.y = elapsedTime * 0.01;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


// =======================================================
// PART 5: 3D-HTML SYNCHRONIZATION BRIDGE
// =======================================================

// 1. Find all HTML elements we want to control in our 3D scene.
const htmlElementsToTrack = document.querySelectorAll('.hero-section > *, #experience .card, #skills .card');

// 2. Create the data structure that links HTML elements to 3D positions.
const trackedObjects = [];

// 3. Define the "flight path" - where each object lives in 3D space.
const objectPositions = [
    // Profile Section (at the very start of the journey, z=0)
    { x: 0, y: 0, z: 0 },    // Profile Picture
    { x: 0, y: 0, z: 0 },    // Name
    { x: 0, y: 0, z: 0 },    // Subtitle
    { x: 0, y: 0, z: 0 },    // Contact Links
    { x: 0, y: 0, z: 0 },    // Scroll Indicator
    
    // Experience Cards (deeper in the scene)
    { x: 0, y: 0, z: -10 },   // Motonet
    { x: 0, y: 0, z: -20 },  // Snacky
    { x: 0, y: 0, z: -30 },  // Swimming Hall
    { x: 0, y: 0, z: -40 },  // HJT Ry
    { x: 0, y: 0, z: -50 },  // Laguuni
    { x: 0, y: 0, z: -60 },  // K-Supermarket
    
    // Competence Cards (at the very end of the journey)
    { x: -7, y: 0, z: -70 }, // Strengths (left)
    { x: 0, y: 0, z: -70 },  // Language (middle)
    { x: 7, y: 0, z: -70 }   // Education (right)
];

// 4. Populate the bridge array, linking each HTML element to its 3D position.
htmlElementsToTrack.forEach((element, index) => {
    if (objectPositions[index]) {
        trackedObjects.push({
            element: element,
            position3D: new THREE.Vector3(
                objectPositions[index].x,
                objectPositions[index].y,
                objectPositions[index].z
            )
        });
    }
});


// =======================================================
// PART 6: UTILITIES
// =======================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onWindowResize);

// We keep the tilt effect, but the "reveal" script is now obsolete.
document.addEventListener("DOMContentLoaded", function() {
    if (typeof VanillaTilt !== 'undefined') {
        const tiltElements = document.querySelectorAll(".card");
        VanillaTilt.init(tiltElements, {
            max: 15, perspective: 1000, scale: 1.05,
            speed: 400, glare: true, "max-glare": 0.5
        });
    }
});
