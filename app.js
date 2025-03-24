import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/geometries/TextGeometry.js';

// Szene, Kamera & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Hintergrund
const backgroundTexture = new THREE.TextureLoader().load('https://i.pinimg.com/736x/7d/c3/75/7dc3759b60b2918c657830fcf8ec70af.jpg');
backgroundTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = backgroundTexture;

// Lichtquelle
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);

// Visitenkarte
const cardGeometry = new THREE.BoxGeometry(5, 3, 0.1);
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(cardMesh);

// Schriftart laden
const fontLoader = new FontLoader();
fontLoader.load('https://cdn.jsdelivr.net/npm/three@latest/examples/fonts/Oswald_Regular.json', (font) => {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    // STRASSSTEIN CALL CENTER
    const textGeo1 = new TextGeometry('STRASSSTEIN', {
        font: font,
        size: 0.3,
        height: 0.02
    });
    const textMesh1 = new THREE.Mesh(textGeo1, textMaterial);
    textMesh1.position.set(-2, 0.5, 0.06);
    scene.add(textMesh1);

    const textGeo2 = new TextGeometry('CALL CENTER', {
        font: font,
        size: 0.3,
        height: 0.02
    });
    const textMesh2 = new THREE.Mesh(textGeo2, textMaterial);
    textMesh2.position.set(-2, 0, 0.06);
    scene.add(textMesh2);

    // FOR GRAPHIC SWAG
    const textGeo3 = new TextGeometry('FOR GRAPHIC SWAG', {
        font: font,
        size: 0.2,
        height: 0.02
    });
    const textMesh3 = new THREE.Mesh(textGeo3, textMaterial);
    textMesh3.position.set(-2, -0.5, 0.06);
    scene.add(textMesh3);
});

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

camera.position.set(0, 0, 6);
controls.update();

// Raycaster für Klick-Interaktion
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cardMesh);

    if (intersects.length > 0) {
        window.open('https://apinchofsalt.de', '_blank');
    }
});

// Render-Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();