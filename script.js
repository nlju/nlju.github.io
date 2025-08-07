// --- Global variables for the 3D scene ---
let camera, scene, renderer;
const objects = [];
let currentIndex = 0;
let isAnimating = false;

// --- Global variables for the background ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let particlesArray;

// --- Main execution ---
init();

function init() {
    init3D();
    initBackground();
    animate();
}

function init3D() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    const elementIDs = ['profile-card', 'experience-card', 'competence-card'];
    
    for (let i = 0; i < elementIDs.length; i++) {
        const element = document.getElementById(elementIDs[i]);
        
        // CORRECTED: Using the proper THREE. prefix, which now works
        const object = new THREE.CSS3DObject(element); 

        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;

        if (i > 0) {
            object.element.style.visibility = 'hidden';
        }

        scene.add(object);
        objects.push(object);
    }

    // CORRECTED: Using the proper THREE. prefix
    renderer = new THREE.CSS3DRenderer(); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    window.addEventListener('wheel', onMouseWheel, { passive: false });
    window.addEventListener('resize', onWindowResize, false);
}

function initBackground() {
    setCanvasSize();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    setCanvasSize();
}

function onMouseWheel(event) {
    event.preventDefault();
    if (isAnimating) return;

    const scrollDown = event.deltaY > 0;

    if (scrollDown && currentIndex < objects.length - 1) {
        transitionTo(currentIndex + 1);
    } else if (!scrollDown && currentIndex > 0) {
        transitionTo(currentIndex - 1);
    }
}

function transitionTo(nextIndex) {
    isAnimating = true;

    const currentObject = objects[currentIndex];
    const nextObject = objects[nextIndex];
    const isGoingForward = nextIndex > currentIndex;

    nextObject.element.style.visibility = 'visible';

    new TWEEN.Tween(currentObject.rotation)
        .to({ x: isGoingForward ? -Math.PI / 2 : Math.PI / 2 }, 1000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

    new TWEEN.Tween(currentObject.position)
        .to({ z: isGoingForward ? 2000 : -2000 }, 1000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onComplete(() => {
            currentObject.element.style.visibility = 'hidden';
        })
        .start();

    nextObject.rotation.x = isGoingForward ? Math.PI / 2 : -Math.PI / 2;
    nextObject.position.z = isGoingForward ? -2000 : 2000;

    new TWEEN.Tween(nextObject.rotation)
        .to({ x: 0 }, 1000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

    new TWEEN.Tween(nextObject.position)
        .to({ z: 0 }, 1000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onComplete(() => {
            isAnimating = false;
            currentIndex = nextIndex;
        })
        .start();
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    animateBackground();
    renderer.render(scene, camera);
}

// --- Starfield Background Functions ---
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

function animateBackground() {
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
