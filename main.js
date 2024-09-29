import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LensflareElement, Lensflare } from 'three/examples/jsm/objects/Lensflare.js';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#firstCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;

// Earth
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Moon
const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
const moonTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/moon_1024.jpg');
const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(1.5, 0, 0);
scene.add(moon);

// Stars
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });

const starsVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Sun glow
const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(50, 20, 50);
scene.add(sun);

// Lens flare
const textureLoader = new THREE.TextureLoader();
const textureFlare0 = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');
const textureFlare3 = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare3.png');

const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, sun.material.color));
lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
sun.add(lensflare);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333, 1, 10);
ambientLight.position.set(5, 3, 5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xFFFFFF, 2, 300);
pointLight.position.set(5, 3, 5);
scene.add(pointLight);

camera.position.z = 5;

// Update sun's light
const sunLight = new THREE.PointLight(0xFFFFFF, 2, 0);
sunLight.position.copy(sun.position);
scene.add(sunLight);
// Add directional light for Earth illumination
const earthLight = new THREE.DirectionalLight(0xFFFFFF, 1);
earthLight.position.set(5, 3, 5);
scene.add(earthLight);


// Adjust Earth's material for better light response
earth.material.metalness = 0.1;
earth.material.roughness = 0.5;

// Update renderer to use physically correct lighting
// renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;


// Update Earth's material to be more responsive to light
earth.material.shininess = 1;
earth.material.reflectivity = 0.5;
earth.material.refractionRatio = 0.98;
earth.material.specular = new THREE.Color(0x333333);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



// Animation
function animate() {
    requestAnimationFrame(animate);

    // Rotate Earth
    earth.rotation.y += 0.005;

    // Rotate Moon
    moon.rotation.y += 0.003;
    const time = Date.now() * 0.0001;
    moon.position.x = Math.cos(time * 0.5) * 2;
    moon.position.z = Math.sin(time * 0.5) * 2;

    // Twinkle stars
    if (Math.random() > 0.95) {
        const randomStar = Math.floor(Math.random() * starsVertices.length / 3);
        starField.geometry.attributes.position.array[randomStar * 3 + 1] += (Math.random() - 0.5) * 0.5;
        starField.geometry.attributes.position.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

let scrollCount = 0;
const zoomBackIn = () => {
    const startingZoom = 5; // Assuming the initial camera.position.z was 5
    const zoomSpeed = 0.05;
    
    if (camera.position.z > startingZoom) {
        camera.position.z -= zoomSpeed;
        requestAnimationFrame(zoomBackIn);
    } else {
        camera.position.z = startingZoom;
        scrollCount = 0; // Reset scroll count
    }
};
window.addEventListener('wheel', (event) => {
    scrollCount++;
    if (scrollCount >= 25) {
      scrollCount--;
        camera.position.z += 1;
        if (camera.position.z > 20) {
            // Gradually zoom back in to the starting zoom conditions
            zoomBackIn();
        }
    }
});






