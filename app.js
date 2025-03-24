import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Szene, Kamera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lichtquelle
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// **Font Loader für Text**
const fontLoader = new FontLoader();
fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json", (font) => {
  
  // **Eigentliche Text-Mesh**
  const textGeometry = new TextGeometry("apinchofsalt.de", {
    font: font,
    size: 1,
    height: 0.2,
    curveSegments: 12,
  });

  const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(0, 3, 0);
  scene.add(textMesh);

  // **Unsichtbare Hitbox hinter dem Text**
  const hitboxGeometry = new THREE.PlaneGeometry(5, 1.5);
  const hitboxMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  hitbox.position.set(0, 3, 0.1); // Leicht vor dem Text platzieren
  hitbox.userData.isLink = true;
  scene.add(hitbox);

  // **Raycasting für Maus-Interaktion**
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(hitbox);

    if (intersects.length > 0) {
      textMaterial.color.set(0x0000ff); // Blau auf Hover
      document.body.style.cursor = "pointer";
    } else {
      textMaterial.color.set(0x00ff00); // Zurück zu Grün
      document.body.style.cursor = "default";
    }
  }

  function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(hitbox);

    if (intersects.length > 0) {
      window.open("https://apinchofsalt.de/", "_blank");
    }
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onMouseClick);
});

// **Render Loop**
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();

// **Fenstergröße anpassen**
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});