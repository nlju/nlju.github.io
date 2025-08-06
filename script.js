/* 
 * =======================================================
 * VinskiNieminen.com - "The Bioluminescent Deep"
 *
 * FINAL ENGINE - v3.0 (CORRECTED AND STABLE)
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
// This section is unchanged and correct.
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
// PART 3: 3D-HTML BRIDGE AND POSITIONS
// =======================================================

// Create the new container for our HTML elements
const contentContainer = document.createElement('div');
contentContainer.className = 'webgl-content';
document.body.appendChild(contentContainer);

// Move the existing sections INTO our new container
const sectionsToMove = document.querySelectorAll('.hero-section, #experience, #skills');
sectionsToMove.forEach(section => {
    contentContainer.appendChild(section);
});

// Now, we track the elements *within* the container
const htmlElementsToTrack = document.querySelectorAll('.hero-section > *, #experience .card, #skills .card');
const trackedObjects = [];
// This Z-positioning is based on a scroll height of approx 5000px
const objectPositions = [
    { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: -17 }, { x: 0, y: 0, z: -24 },
    { x: 0, y: 0, z: -31 }, { x: 0, y: 0, z: -38 }, { x: 0, y: 0, z: -45 },
    { x: -7, y: 0, z: -55 }, { x: 0, y: 0, z: -55 }, { x: 7, y: 0, z: -55 }
];

htmlElementsToTrack.forEach((element, index) => {
    if (objectPositions[index]) {
        trackedObjects.push({
            element: element,
            position3D: new THREE.Vector3(objectPositions[index].x, objectPositions[index].y, objectPositions[index].z)
        });
    }
});


// =======================================================
// PART 4: THE FINAL ANIMATION ENGINE
// =======================================================

let scrollY = window.scrollY;
let targetScrollY = window.scrollY;
let lerpFactor = 0.1; // Smoothing factor

window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
});

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

const clock = new THREE.Clock();
function animate() {
    // Smooth the scroll value
    scrollY = lerp(scrollY, targetScrollY, lerpFactor);
    
    // Move camera based on the smoothed scroll value
    camera.position.z = 5 - scrollY * 0.012;

    const elapsedTime = clock.getElapsedTime();
    particles.rotation.y = elapsedTime * 0.01;

    // --- The Corrected Positioning Loop ---
    for (const tracked of trackedObjects) {
        const object3DPosition = tracked.position3D.clone();
        const screenPosition = object3DPosition.project(camera);
        const x = (screenPosition.x * window.innerWidth / 2);
        const y = -(screenPosition.y * window.innerHeight / 2);
        
        // ** THE CRITICAL FIX IS HERE **
        // This CSS transform first centers the element's anchor point,
        // then moves it to the correct projected position.
        tracked.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        
        const distance = tracked.position3D.distanceTo(camera.position);
        let opacity = 0;
        
        if (distance < 7) {
            opacity = Math.pow(1 - (distance / 7), 2);
        }
        
        tracked.element.style.opacity = opacity;
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();


// =======================================================
// PART 5: UTILITIES
// =======================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onWindowResize);
// Tilt effect does not work well with CSS transforms, so we will disable it for now.
// We can re-add it later if needed.
/*
document.addEventListener("DOMContentLoaded", function() {
    if (typeof VanillaTilt !== 'undefined') {
        const tiltElements = document.querySelectorAll(".card");
        VanillaTilt.init(tiltElements, { ... });
    }
});
*/

// Finally, we need to give the page a fake height to enable scrolling.
// This should be based on our last Z position.
const fakeScroll = document.createElement('div');
fakeScroll.style.height = '5000px'; // Approx. journey length
document.body.appendChild(fakeScroll);
