import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Szene, Kamera & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Hintergrund von Three.js entfernen (transparent)
document.body.appendChild(renderer.domElement);

// OrbitControls für Interaktivität
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lichtquellen
const directLight = new THREE.DirectionalLight(0xffffff, 1.2);
directLight.position.set(0, 2, 2); // Direkt von oben auf die Karte
scene.add(directLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Dezentes Umgebungslicht
scene.add(ambientLight);

// Material für Visitenkarte (weiß, matt)
const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

// Visitenkarte als dünne Box
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, paperMaterial);
scene.add(card);

// FontLoader für Oswald
const fontLoader = new FontLoader();
fontLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json", function (font) {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Schwarz für besseren Kontrast

    // Funktion für gestanzten Text (negative Extrusion für "tiefe" Optik)
    const createText = (text, yOffset) => {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.25, // Etwas kleiner
            height: -0.01, // Negative Höhe für gestanzten Effekt
            bevelEnabled: false
        });

        textGeometry.center();
        textGeometry.translate(0, yOffset, 0.025); // Leicht in die Karte "gesenkt"

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        card.add(textMesh);
    };

    // Text hinzufügen
    createText("STRASSSTEIN CALL CENTER", 0.5);
    createText("For Graphic Swag", 0);
    createText("<3 ‹› $$", -0.5);
});

// Animation & Responsiveness
const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});