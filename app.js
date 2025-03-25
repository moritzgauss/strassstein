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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Card Material & Geometry
const cardMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.3,
  metalness: 0.1
});
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Font Loader
const fontLoader = new FontLoader();
fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json", (font) => {
  // **Front Side Links**
  createClickableText("STRASSSTEIN CALL CENTER", { x: 0, y: 0.6, z: 0.03 }, font);
  createClickableText("FOR GRAPHIC SWAG", { x: 0, y: 0.2, z: 0.03 }, font);
  createClickableText("CLICK ME", { x: 0, y: -0.2, z: 0.03 }, font, "https://example.com");

  // **Back Side Links**
  createClickableText("CONTACT DETAILS", { x: 0, y: 0.6, z: -0.03 }, font);
  createClickableText("Phone: +123 456 789", { x: 0, y: 0.2, z: -0.03 }, font);
  createClickableText("Email: example@email.com", { x: 0, y: -0.2, z: -0.03 }, font);
  createClickableText("Instagram", { x: 0, y: -0.5, z: -0.03 }, font, "https://instagram.com/strasssteincallcenter");
});

// **Function to Create Clickable Text**
function createClickableText(text, position, font, url = "") {
  const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const textGeometry = new TextGeometry(text, {
    font,
    size: 0.15,
    height: 0.01,
    bevelEnabled: false
  });

  textGeometry.center();
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(position.x, position.y, position.z);
  card.add(textMesh);

  if (url) {
    setupHoverAndClick(textMesh, textMaterial, textGeometry, url);
  }
}

// **Function to Handle Hover & Click Effects**
function setupHoverAndClick(textMesh, textMaterial, textGeometry, url) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(textMesh);

    if (intersects.length > 0) {
      textMaterial.color.set(0x0000ff); // Change to blue on hover
      textGeometry.parameters.size = 1.1;
      document.body.style.cursor = "pointer";
    } else {
      textMaterial.color.set(0x00ff00); // Reset to green
      textGeometry.parameters.size = 1;
      document.body.style.cursor = "default";
    }
  }

  function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(textMesh);

    if (intersects.length > 0) {
      window.open(url, "_blank");
    }
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onMouseClick);
}

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