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
    const createText = (text, yOffset, size = 0.2) => {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: size, // Kleinere Schriftgröße
            height: -0.01, // Negative Höhe für gestanzten Effekt
            bevelEnabled: false
        });

        textGeometry.center();
        textGeometry.translate(0, yOffset, 0.025); // Leicht in die Karte "gesenkt"

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        card.add(textMesh);
    };

    // Text hinzufügen
    createText("STRASSSTEIN CALL CENTER", 0.6, 0.2); // Kleinere Schriftgröße
    createText("For Graphic Swag", 0.2, 0.15); // Kleinere Schriftgröße
    createText("<3 ‹› $$", -0.2, 0.15); // Kleinere Schriftgröße

    // Link hinzufügen
    const linkGeometry = new TextGeometry("Watch 'What Do You Mean?' Music Video", {
        font: font,
        size: 0.1, // Noch kleinere Schriftgröße für den Link
        height: -0.01,
        bevelEnabled: false
    });

    linkGeometry.center();
    linkGeometry.translate(0, -0.6, 0.025);

    const linkMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blau für den Link
    const linkMesh = new THREE.Mesh(linkGeometry, linkMaterial);
    card.add(linkMesh);

    // Interaktivität für den Link
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        // Mausposition normalisieren
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(linkMesh);

        if (intersects.length > 0) {
            // Link öffnen
            window.open('https://www.youtube.com/watch?v=DK_0jXPuIr0', '_blank');
        }
    }

    window.addEventListener('click', onMouseClick, false);
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
`` 