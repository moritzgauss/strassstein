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

// Lighting
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

// Card
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Store clickable elements
const clickableElements = [];

// Font Loader (using Oswald font)
const fontLoader = new FontLoader();
fontLoader.load("https://fonts.gstatic.com/s/oswald/v48/TK3pXvHf49KHT1yF7K7J6iYoxw.ttf", (font) => {
  // **Front Side**
  createText("STRASSSTEIN CALL CENTER", { x: 0, y: 0.6, z: 0.03 }, font);
  createText("FOR GRAPHIC SWAG", { x: 0, y: 0.2, z: 0.03 }, font);
  createText("CLICK ME", { x: 0, y: -0.2, z: 0.03 }, font, "https://example.com");

  // **Back Side (Flipped)**
  createText("CONTACT DETAILS", { x: 0, y: 0.6, z: -0.03 }, font, null, true);
  createText("Phone: +123 456 789", { x: 0, y: 0.2, z: -0.03 }, font, null, true);
  createText("Email: example@email.com", { x: 0, y: -0.2, z: -0.03 }, font, null, true);
  createText("Instagram", { x: 0, y: -0.5, z: -0.03 }, font, "https://instagram.com/strasssteincallcenter", true);
});

// **Create Text Function (Clickable)**
function createText(text, position, font, url = null, flip = false) {
  const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const textGeometry = new TextGeometry(text, {
    font,
    size: 0.15,
    height: 0.01,
    bevelEnabled: false
  });

  textGeometry.center();
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(position.x, position.y, position.z);

  if (flip) textMesh.rotation.y = Math.PI; // Flip text for back side

  card.add(textMesh);

  if (url) createClickableArea(textMesh, url);
}

// **Create a Transparent Clickable Area Behind Text**
function createClickableArea(textMesh, url) {
  const planeGeometry = new THREE.PlaneGeometry(1.5, 0.3); // Adjust size as needed
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

  planeMesh.position.copy(textMesh.position);
  card.add(planeMesh);

  clickableElements.push({ mesh: planeMesh, url });
}

// **Handle Clicks Without Raycasting**
window.addEventListener("click", (event) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Convert screen coordinates to world coordinates
  const vector = new THREE.Vector3(x, y, 0.5).unproject(camera);

  // Check which clickable element was clicked
  clickableElements.forEach(({ mesh, url }) => {
    const distance = mesh.position.distanceTo(vector);
    if (distance < 1) {
      window.open(url, "_blank");
    }
  });
});

// Also add touch event for mobile
window.addEventListener("touchstart", (event) => {
  const x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  const y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;

  const vector = new THREE.Vector3(x, y, 0.5).unproject(camera);

  clickableElements.forEach(({ mesh, url }) => {
    const distance = mesh.position.distanceTo(vector);
    if (distance < 1) {
      window.open(url, "_blank");
    }
  });
});

// **Sound Effect**
const sound = new Audio("https://raw.githubusercontent.com/moritzgauss/strassstein/refs/heads/main/Effet.mp3");
sound.loop = false;

// **Play Sound Every Click with 50% Volume**
window.addEventListener("click", () => {
  sound.volume = 0.5;
  sound.play().catch((err) => console.error("Failed to play audio:", err));
});

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