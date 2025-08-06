/*
 * =======================================================
 * VinskiNieminen.com - FINAL 3D ENGINE v4.0
 * Using CSS3DRenderer for stable, correct 3D HTML
 * =======================================================
 */

// =======================================================
// PART 1: SETUP RENDERERS AND SCENE
// =======================================================
let scene, camera, renderer, cssRenderer;
let webGLContainer, cssContainer;

// WebGL (Particles)
webGLContainer = document.getElementById('bg-canvas');
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 900;
renderer = new THREE.WebGLRenderer({ canvas: webGLContainer, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// CSS3D (HTML Content)
cssContainer = document.getElementById('css-renderer');
cssRenderer = new THREE.CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssContainer.appendChild(cssRenderer.domElement);

// =======================================================
// PART 2: PARTICLES
// =======================================================
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 15000;
const positions = new Float32Array(particlesCount * 3);
const themeColors = [new THREE.Color(0x00f0ff), new THREE.Color(0x915eff)];

for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 2000; // Spread them far and wide
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 2,
    sizeAttenuation: true,
    color: 0x00f0ff,
    transparent: true,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// =======================================================
// PART 3: 3D HTML OBJECTS
// =======================================================
const objects = [];
const objectPositions = [
    { selector: '.hero-section', z: 0 },
    { selector: '#experience', z: -1000 },
    { selector: '#skills', z: -2000 },
    { selector: 'footer', z: -2500 }
];

objectPositions.forEach(objInfo => {
    const element = document.querySelector(objInfo.selector);
    if (element) {
        const object = new THREE.CSS3DObject(element);
        object.position.z = objInfo.z;
        scene.add(object);
        objects.push(object);
    }
});

// =======================================================
// PART 4: VIRTUAL SCROLL AND ANIMATION ENGINE
// =======================================================
const scrollHeight = 3000; // This defines the total length of our "journey"
document.getElementById('scroll-container').style.height = scrollHeight + 'px';

let targetZ = 900;
let currentZ = 900;
const lerpFactor = 0.08;

window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (scrollHeight - window.innerHeight);
    targetZ = 900 - scrollPercent * (scrollHeight + 500);
});

const clock = new THREE.Clock();
function animate() {
    // Smooth the camera movement
    currentZ = lerp(currentZ, targetZ, lerpFactor);
    camera.position.z = currentZ;

    // Animate particles
    const elapsedTime = clock.getElapsedTime();
    particles.rotation.y = -elapsedTime * 0.02;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}
animate();

// =======================================================
// PART 5: UTILITIES
// =======================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onWindowResize);

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}
