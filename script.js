/* 
 * =======================================================
 * VinskiNieminen.com - "The Bioluminescent Deep"
 *
 * FINAL SCRIPT - v2.2 (Phase 2, Part B)
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
    // The final Z position is -75 to ensure we see the last cards.
    cameraTarget.z = 5 - scrollState.y * 0.02; 
}, { passive: true });

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}


// =======================================================
// PART 4: THE ANIMATION LOOP (*** THE FINAL UPGRADE ***)
// =======================================================
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();
    
    // Smoothly move the camera to its target position
    camera.position.z = lerp(camera.position.z, cameraTarget.z, 0.05);
    
    // Add subtle rotation to the particles
    particles.rotation.y = elapsedTime * 0.01;
    
    // === THE CORE OF THE 3D-HTML BRIDGE ===
    // For each tracked object...
    for (const tracked of trackedObjects) {
        // 1. Get the 3D position of the object
        const object3DPosition = tracked.position3D.clone();
        
        // 2. Project this 3D position into 2D screen space
        const screenPosition = object3DPosition.project(camera);
        
        // 3. Convert the normalized screen coordinates (-1 to 1) to pixel coordinates
        const x = (screenPosition.x * window.innerWidth / 2);
        const y = -(screenPosition.y * window.innerHeight / 2);
        
        // 4. Apply the calculated position to the HTML element
        tracked.element.style.transform = `translate(${x}px, ${y}px)`;
        
        // 5. Calculate the distance from the camera to the object
        const distance = tracked.position3D.distanceTo(camera.position);

        // 6. Calculate opacity and scale based on distance
        // This makes the element fade and scale in as it gets closer
        let opacity = 0;
        let scale = 0;
        
        // If the object is within a certain range (e.g., 8 units)
        if (distance < 8) {
            // Calculate a fade-in factor (0 when far, 1 when close)
            opacity = 1 - (distance / 8); 
            scale = 1 - (distance / 8);
            tracked.element.style.pointerEvents = 'all'; // Make it clickable
        } else {
            tracked.element.style.pointerEvents = 'none'; // Make it not clickable
        }
        
        tracked.element.style.opacity = opacity;
        // We add the position transform and the scale transform together
        tracked.element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }

    // Render the 3D scene
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate(); // Start the engine!


// =======================================================
// PART 5: 3D-HTML SYNCHRONIZATION BRIDGE
// =======================================================
const htmlElementsToTrack = document.querySelectorAll('.hero-section > *, #experience .card, #skills .card');
const trackedObjects = [];
const objectPositions = [
    // Profile Section
    { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -5 }, // Hide scroll indicator slightly behind
    // Experience Cards
    { x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: -20 }, { x: 0, y: 0, z: -30 },
    { x: 0, y: 0, z: -40 }, { x: 0, y: 0, z: -50 }, { x: 0, y: 0, z: -60 },
    // Competence Cards
    { x: -7, y: 0, z: -70 }, { x: 0, y: 0, z: -70 }, { x: 7, y: 0, z: -70 }
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
// PART 6: UTILITIES
// =======================================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onWindowResize);
document.addEventListener("DOMContentLoaded", function() {
    if (typeof VanillaTilt !== 'undefined') {
        const tiltElements = document.querySelectorAll(".card");
        VanillaTilt.init(tiltElements, {
            max: 15, perspective: 1000, scale: 1.05,
            speed: 400, glare: true, "max-glare": 0.5
        });
    }
});
