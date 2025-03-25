import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Scene, Camera & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting (Restored)
const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(0, 3, 3);
scene.add(mainLight);

const frontLight = new THREE.PointLight(0xffffff, 2, 15);
frontLight.position.set(0, 3, 3);
scene.add(frontLight);

const backLight = new THREE.PointLight(0xffffff, 4, 20);
backLight.position.set(0, -3, -3);
scene.add(backLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Card Material & Geometry
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Font Loader
const fontLoader = new FontLoader();
fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json", (font) => {
  // **Front Side**
  createText("STRASSSTEIN CALL CENTER", { x: 0, y: 0.6, z: 0.03 }, font);
  createText("FOR GRAPHIC SWAG", { x: 0, y: 0.2, z: 0.03 }, font);
  createText("CLICK ME", { x: 0, y: -0.2, z: 0.03 }, font, "https://example.com");

  // **Back Side (Flipped Correctly)**
  createText("CONTACT DETAILS", { x: 0, y: 0.6, z: -0.03 }, font, null, true);
  createText("Phone: +123 456 789", { x: 0, y: 0.2, z: -0.03 }, font, null, true);
  createText("Email: example@email.com", { x: 0, y: -0.2, z: -0.03 }, font, null, true);
  createText("Instagram", { x: 0, y: -0.5, z: -0.03 }, font, "https://instagram.com/strasssteincallcenter", true);
});

// **Create Text Function**
function createText(text, position, font, url = null, flip = false) {
  const color = url ? 0x00ff00 : 0x000000; // Links are green, others black
  const textMaterial = new THREE.MeshStandardMaterial({ color });
  const textGeometry = new TextGeometry(text, {
    font,
    size: 0.15,
    height: 0.01,
    bevelEnabled: false
  });

  textGeometry.center();
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(position.x, position.y, position.z);

  if (flip) textMesh.rotation.y = Math.PI; // Flip text for back of the card

  card.add(textMesh);

  if (url) setupHoverAndClick(textMesh, textMaterial, url);
}

// **Handle Hover & Click Effects**
function setupHoverAndClick(textMesh, textMaterial, url) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (raycaster.intersectObject(textMesh).length > 0) {
      textMaterial.color.set(0x0000ff); // Change to blue on hover
      document.body.style.cursor = "pointer";
    } else {
      textMaterial.color.set(0x00ff00); // Reset to green
      document.body.style.cursor = "default";
    }
  }

  function onMouseClick(event) {
    if (raycaster.intersectObject(textMesh).length > 0) {
      window.open(url, "_blank");
    }
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onMouseClick);
}

// **Sound Effect**
const sound = new Audio("https://raw.githubusercontent.com/moritzgauss/strassstein/refs/heads/main/Effet.mp3");
sound.loop = false;

// **Play Sound Every 10 Seconds**
setInterval(() => {
  sound.play().catch((err) => console.error("Failed to play audio:", err));
}, 10000);

// **Random Card Rotation Animation**
let isRotating = false;
setInterval(() => {
  if (isRotating) return;
  isRotating = true;

  const initialRotationX = card.rotation.x;
  const initialRotationY = card.rotation.y;
  const duration = 2000;
  const startTime = performance.now();

  const animateRotation = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const easing = 1 - Math.pow(1 - progress, 3);

    card.rotation.x = initialRotationX + easing * Math.PI * 2;
    card.rotation.y = initialRotationY + easing * Math.PI * 2;

    if (progress < 1) {
      requestAnimationFrame(animateRotation);
    } else {
      isRotating = false;
    }
  };

  requestAnimationFrame(animateRotation);
}, 10000);

// **Render Loop**
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();

// **Resize Handling**
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});