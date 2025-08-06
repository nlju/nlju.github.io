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

// =======================================================
// PART 1: SETUP THE 3D SCENE
// =======================================================

// Find the <canvas> element in our HTML
const canvas = document.getElementById('bg-canvas');

// Scene: This is the container for all our 3D objects
const scene = new THREE.Scene();

// Camera: This is the user's viewpoint. 
// A "PerspectiveCamera" is designed to mimic the human eye.
// Parameters: Field of View (fov), Aspect Ratio, Near Clip, Far Clip
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer: This draws the scene from the camera's perspective onto the canvas.
// We are enabling antialiasing for smooth edges.
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

// Set the size of the renderer to match the window
renderer.setSize(window.innerWidth, window.innerHeight);
// Set the pixel ratio for high-density displays (like mobile phones)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


// =======================================================
// PART 2: CREATE THE PARTICLES ("BIOLUMINESCENT PLANKTON")
// =======================================================

// We will create a large number of particles
const particlesCount = 5000;

// Geometry: This holds the position of all particles.
// We use a BufferGeometry because it's highly efficient for this many objects.
const particlesGeometry = new THREE.BufferGeometry();

// We need an array to hold the X, Y, Z coordinates of each particle.
// Since each particle has 3 coordinates, the array size is particlesCount * 3.
const positions = new Float32Array(particlesCount * 3);

// Loop through and create each particle's position
for (let i = 0; i < particlesCount * 3; i++) {
    // Assign a random position between -10 and 10 on all 3 axes
    // This creates a cube-shaped distribution of particles.
    positions[i] = (Math.random() - 0.5) * 20;
}

// Set the positions attribute on our geometry
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material: This defines the appearance of the particles.
// We'll use PointsMaterial.
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02, // How large each particle should be
    sizeAttenuation: true // Particles further away appear smaller
});

// The final Particles object (also called a "Point Cloud")
const particles = new THREE.Points(particlesGeometry, particlesMaterial);

// Add the finished particles to our scene
scene.add(particles);


// =======================================================
// PART 3: THE ANIMATION LOOP
// =======================================================

// This function will be called on every frame (about 60 times per second)
function animate() {
    // This tells the browser we want to perform an animation
    requestAnimationFrame(animate);

    // In future steps, we'll add particle movement logic here.

    // Render the scene from the camera's perspective
    renderer.render(scene, camera);
}

// Start the animation loop!
animate();


// =======================================================
// PART 4: EVENT LISTENERS
// =======================================================

// This function handles the window being resized
function onWindowResize() {
    // Update camera's aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer's size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Listen for the 'resize' event on the window
window.addEventListener('resize', onWindowResize);


/* 
 * =======================================================
 * ESSENTIAL UTILITIES FROM V1 (DO NOT REMOVE)
 * =======================================================
 */

// ===== 1. Reveal On Scroll Animation =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach((el) => observer.observe(el));

// ===== 2. 3D Tilt Effect Initialization =====
document.addEventListener("DOMContentLoaded", function() {
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
