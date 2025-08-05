// ===== SETUP PROFESSIONAL LIBRARIES =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl-container'), antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// ===== 3D OBJECTS =====
// Central Data Orb
const geometry = new THREE.IcosahedronGeometry(10, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x915eff, wireframe: true });
const orb = new THREE.Mesh(geometry, material);
scene.add(orb);

// Cosmic Nebula Background (Simplified for performance)
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.1 });
const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(pointLight, ambientLight);

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// ===== ANIMATION LOOP =====
function animate() {
    requestAnimationFrame(animate);
    orb.rotation.x += 0.001;
    orb.rotation.y += 0.001;
    
    // Subtle mouse parallax effect
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

// ===== SCROLL-BASED CAMERA ANIMATION (GSAP) =====
gsap.registerPlugin(ScrollTrigger);
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".content-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Define camera waypoints for the journey
const cameraPositions = [
    { z: 30, x: 0, y: 0, orbScale: 1 }, // Start: Hero section
    { z: 15, x: 25, y: -10, orbScale: 0.3 }, // Middle: Experience section
    { z: 15, x: -25, y: 10, orbScale: 0.3 }  // End: Skills section
];

// Animate the camera and orb
tl.to(camera.position, { z: cameraPositions[1].z, x: cameraPositions[1].x, y: cameraPositions[1].y }, 0)
  .to(orb.scale, { x: cameraPositions[1].orbScale, y: cameraPositions[1].orbScale, z: cameraPositions[1].orbScale }, 0)
  .to(camera.position, { z: cameraPositions[2].z, x: cameraPositions[2].x, y: cameraPositions[2].y }, 1)
  .to(orb.scale, { x: cameraPositions[2].orbScale, y: cameraPositions[2].orbScale, z: cameraPositions[2].orbScale }, 1);

// Fade in/out content sections based on scroll position
const sections = document.querySelectorAll('.content-section');
gsap.to(sections[0], { autoAlpha: 1, scrollTrigger: { trigger: 'body', start: 'top top', end: '25% top', scrub: true } });
gsap.to(sections[1], { autoAlpha: 1, scrollTrigger: { trigger: 'body', start: '30% top', end: '60% top', scrub: true } });
gsap.to(sections[2], { autoAlpha: 1, scrollTrigger: { trigger: 'body', start: '65% top', end: 'bottom bottom', scrub: true } });

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
