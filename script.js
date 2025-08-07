// ==========================================================
// IMPORT 3D LIBRARIES
// ==========================================================
import * as THREE from 'three';
import { TWEEN } from 'three/addons/libs/tween.module.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// ==========================================================
// STARFIELD BACKGROUND (No Changes)
// ==========================================================
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let particlesArray;

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    if (numberOfParticles > 150) numberOfParticles = 150;
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 1.5) + 0.5;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * .4) - .2;
        let directionY = (Math.random() * .4) - .2;
        let color = '#e0e0e0';
        particlesArray.push({x, y, directionX, directionY, size, color});
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width/7) * (canvas.height/7)) {
                opacityValue = 1 - (distance/20000);
                ctx.strokeStyle = `rgba(0, 240, 255, ${opacityValue * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateBackground() {
    requestAnimationFrame(animateBackground);
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        let particle = particlesArray[i];
        if (particle.x < 0 || particle.x > canvas.width) particle.directionX = -particle.directionX;
        if (particle.y < 0 || particle.y > canvas.height) particle.directionY = -particle.directionY;
        particle.x += particle.directionX;
        particle.y += particle.directionY;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2, false);
        ctx.fillStyle = particle.color;
        ctx.fill();
    }
    connect();
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);
animateBackground();


// ==========================================================
// 3D SCENE LOGIC
// ==========================================================

let camera, scene, renderer;
const objects = [];
let currentIndex = 0; // Tracks which card is currently visible
let isAnimating = false; // Prevents triggering animation while one is running

init3D();
animate3D();

function init3D() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    // Position the camera and leave it static.
    camera.position.z = 1000;

    scene = new THREE.Scene();

    const elementIDs = ['profile-card', 'experience-card', 'competence-card'];
    
    for (let i = 0; i < elementIDs.length; i++) {
        const element = document.getElementById(elementIDs[i]);
        const object = new CSS3DObject(element);

        // All objects start at the center.
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;

        // Hide all cards except the first one initially.
        if (i > 0) {
            object.element.style.visibility = 'hidden';
        }

        scene.add(object);
        objects.push(object);
    }

    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // --- NEW: Add scroll listener ---
    window.addEventListener('wheel', onMouseWheel, { passive: false });
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- NEW: Function to handle scroll events ---
function onMouseWheel(event) {
    event.preventDefault(); // Prevent default page scroll

    if (isAnimating) {
        return; // Don't do anything if an animation is in progress
    }

    const scrollDown = event.deltaY > 0;

    if (scrollDown && currentIndex < objects.length - 1) {
        // If scrolling down and not on the last card, go to the next one.
        transitionTo(currentIndex + 1);
    } else if (!scrollDown && currentIndex > 0) {
        // If scrolling up and not on the first card, go to the previous one.
        transitionTo(currentIndex - 1);
    }
}

// --- NEW: The core animation function ---
function transitionTo(nextIndex) {
    isAnimating = true;

    const currentObject = objects[currentIndex];
    const nextObject = objects[nextIndex];

    const isGoingForward = nextIndex > currentIndex;

    // Make the next card visible before it animates in
    nextObject.element.style.visibility = 'visible';

    // 1. ANIMATE THE CURRENT CARD (the one leaving)
    new TWEEN.Tween(currentObject.rotation)
        .to({ x: isGoingForward ? -Math.PI / 2 : Math.PI / 2 }, 1000) // Flip backwards if going forward, forwards if going back
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

    new TWEEN.Tween(currentObject.position)
        .to({ z: isGoingForward ? 2000 : -2000 }, 1000) // Move far away
        .easing(TWEEN.Easing.Exponential.InOut)
        .onComplete(() => {
            // Hide the card completely after it has animated away
            currentObject.element.style.visibility = 'hidden';
        })
        .start();

    // 2. ANIMATE THE NEXT CARD (the one arriving)
    // It starts from a flipped and far-away position
    nextObject.rotation.x = isGoingForward ? Math.PI / 2 : -Math.PI / 2;
    nextObject.position.z = isGoingForward ? -2000 : 2000;

    new TWEEN.Tween(nextObject.rotation)
        .to({ x: 0 }, 1000) // Flip to face the camera
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

    new TWEEN.Tween(nextObject.position)
        .to({ z: 0 }, 1000) // Move to the center
        .easing(TWEEN.Easing.Exponential.InOut)
        .onComplete(() => {
            // Animation is finished
            isAnimating = false;
            currentIndex = nextIndex;
        })
        .start();
}


function animate3D() {
    requestAnimationFrame(animate3D);
    
    // --- NEW: This line is required to update the animations ---
    TWEEN.update();

    renderer.render(scene, camera);
}
