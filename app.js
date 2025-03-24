import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Szene, Kamera & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Licht für bessere Papieroptik
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Papiermaterial (leicht grau, matte Oberfläche)
const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 });

// Visitenkarte (dünne Box)
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, paperMaterial);
scene.add(card);

// FontLoader für Oswald
const fontLoader = new FontLoader();
fontLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json", function (font) {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    // Gestanzter Effekt durch Subtraktion
    const createText = (text, yOffset) => {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.3,
            height: 0.01, // Dünne Extrusion für gestanzten Effekt
            bevelEnabled: false
        });

        textGeometry.center();
        textGeometry.translate(0, yOffset, 0.026); // Minimal über die Karte legen

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        card.add(textMesh);
    };

    createText("Strassstein Call Center", 0.3);
    createText("For Graphic Swag", -0.2);
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