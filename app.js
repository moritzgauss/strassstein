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
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lichter
const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(0, 3, 3);
scene.add(mainLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Visitenkarte (leicht nach links/unten verschoben)
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0 });
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Funktion zur Anpassung der Position und Skalierung der Karte
const updateCardTransform = () => {
  if (window.innerWidth < 768) {
    // Mobile: Behalte die aktuelle Position und Skalierung
    card.position.set(-0.5, -0.1, 0);
    card.scale.set(0.5, 0.5, 0.5);
    card.rotation.x = -0.5;
  } else {
    // Desktop: Zentriere die Karte
    card.position.set(0, 0, 0);
    card.scale.set(1, 1, 1);
    card.rotation.x = 0;
  }
};
updateCardTransform();
window.addEventListener("resize", updateCardTransform);

// Lade die Schriftart
const fontLoader = new FontLoader();

// Funktion zum Erstellen von Text auf der Karte
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json",
  function (font) {
    const createText = (text, yOffset, size = 0.15, color = 0xff0000, outlineColor = 0xffff00, url = null) => {
      // Haupttext-Material und Geometrie
      const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.5 });
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.002,
        bevelSegments: 3,
      });

      textGeometry.center(); // Zentriert den Text
      textGeometry.translate(0, yOffset, 0.03);

      const textMesh = new THREE.Mesh(textGeometry, material);
      textMesh.userData = { color, outlineColor, url }; // Speichert die Originalfarben und URL

      // Outline-Material und Geometrie
      const outlineMaterial = new THREE.MeshStandardMaterial({ color: outlineColor, roughness: 0.5, metalness: 0.3 });
      const outlineGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.005,
        bevelSize: 0.002,
        bevelSegments: 3,
      });

      outlineGeometry.center(); // Zentriert die Outline-Geometrie
      outlineGeometry.translate(0, yOffset, 0.03); // Gleiche Position wie der Haupttext
      outlineGeometry.scale(1.05, 1.05, 1.05); // Skaliert die Outline leicht

      const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
      textMesh.add(outlineMesh); // Fügt die Outline als Kind des Textes hinzu

      card.add(textMesh);
      return textMesh;
    };

    // Vorderseite der Karte: "STRASSSTEIN VALENTE"
    createText("STRASSSTEIN VALENTE", 0.4, 0.2);

    // Rückseite der Karte: Kontaktdetails und Link
    createText("Contact: info@strassstein.com", -0.2, 0.12);
    createText("Visit: www.strassstein.com", -0.35, 0.12);

    // Klickbarer Link-Text - auf der Rückseite
    const linkMesh = createText("-->ENTER<--", -0.6, 0.12, 0xff0000, 0xffff00, "https://youtu.be/U_IbIMUbh-k");

    // Positioniere den Text auf der Rückseite der Karte (negative Z-Achse)
    linkMesh.position.set(0, 0, -0.06); // Z-Achse auf der Rückseite

    // Raycaster für Klicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;

    function onPointerMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(card.children);

      let foundLink = false;
      for (let obj of intersects) {
        if (obj.object.userData.url) {
          foundLink = true;
          if (hoveredObject !== obj.object) {
            if (hoveredObject) {
              // Setze vorherige Farben zurück
              hoveredObject.material.color.set(hoveredObject.userData.color);
            }
            // Ändere Farben für Hover-Effekt
            obj.object.material.color.set(0xffff00); // Gelber Text
            hoveredObject = obj.object;
          }
          break;
        }
      }

      if (!foundLink && hoveredObject) {
        // Farben zurücksetzen, wenn kein Link gefunden wird
        hoveredObject.material.color.set(hoveredObject.userData.color);
        hoveredObject = null;
      }

      document.body.style.cursor = foundLink ? "pointer" : "default";
    }

    function onPointerClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(card.children);

      for (let intersect of intersects) {
        if (intersect.object.userData.url) {
          window.open(intersect.object.userData.url, "_blank");
          return;
        }
      }
    }

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("click", onPointerClick);
    window.addEventListener("touchmove", onPointerMove);
    window.addEventListener("touchstart", onPointerClick);
  }
);

// Animation
let time = 0;
const animate = () => {
  requestAnimationFrame(animate);

  time += 0.02;
  card.rotation.y = Math.sin(time) * 0.2;

  controls.update();
  renderer.render(scene, camera);
};
animate();

// Fenstergröße anpassen
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});