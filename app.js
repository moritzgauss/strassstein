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

// FontLoader für den 3D-Text
const fontLoader = new FontLoader();
fontLoader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", function (font) {
    
    // Visitenkarten-Rahmen (einfaches Rechteck)
    const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.1);
    const cardMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    scene.add(cardMesh);

    // Haupttext: "Strassstein Call Center 📞💎"
    const textGeometry = new TextGeometry("Strassstein Call Center 📞💎", {
        font: font,
        size: 0.2,
        height: 0.02,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-1.5, 0.5, 0.06);
    scene.add(textMesh);

    // Untertitel: "For Graphic Swag 😎✨"
    const subtitleGeometry = new TextGeometry("For Graphic Swag 😎✨", {
        font: font,
        size: 0.15,
        height: 0.02,
    });
    const subtitleMesh = new THREE.Mesh(subtitleGeometry, textMaterial);
    subtitleMesh.position.set(-1.2, 0.2, 0.06);
    scene.add(subtitleMesh);
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
