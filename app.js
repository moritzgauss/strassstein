import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Szene & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Licht für realistischere Papier-Optik
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// FontLoader für den 3D-Text
const fontLoader = new FontLoader();
fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", function (font) {
    
    // Visitenkarte mit Papieroptik (dünnere Geometrie)
    const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
    const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8, metalness: 0 });
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    scene.add(cardMesh);

    // Text mit „gestanzt“-Effekt (Negativprägung)
    function createEmbossedText(text, size, x, y) {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: size,
            height: 0.01, // Sehr dünn für den "gestanzt"-Effekt
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.002,
            bevelOffset: 0,
            bevelSegments: 3
        });

        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, 0.025); // Leicht in die Karte „eingestanzt“
        scene.add(textMesh);
    }

    // Texte auf der Karte platzieren
    createEmbossedText("Strassstein Call Center 📞💎", 0.2, -1.5, 0.5);
    createEmbossedText("For Graphic Swag 😎✨", 0.15, -1.2, 0.2);
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize-Handling
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});