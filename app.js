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

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(0, 3, 3);
scene.add(mainLight);

// Create Card
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Load Oswald Font & Create Text
const fontLoader = new FontLoader();
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json",
  function (font) {
    const createText = (text, yOffset, size = 0.15) => {
      const textGeometry = new TextGeometry(text, { font, size, height: 0.05 });
      textGeometry.center();
      textGeometry.translate(0, yOffset, 0.03);

      const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.6, roughness: 0.2 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      card.add(textMesh);
    };

    createText("STRASSSTEIN CALL CENTER", 0.6, 0.2);
    createText("For Graphic Swag", 0.2, 0.15);
    createText("<3 ‹› $$", -0.2, 0.15);
  }
);

// **Clickable Link**
const hitboxGeometry = new THREE.PlaneGeometry(2, 0.3);
const hitboxMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
hitbox.position.set(0, -0.6, 0.031);
hitbox.userData = { isLink: true };
card.add(hitbox);

// **Raycaster**
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(card.children);

  document.body.style.cursor = intersects.some((obj) => obj.object.userData.isLink) ? "pointer" : "default";
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(card.children);

  for (let intersect of intersects) {
    if (intersect.object.userData.isLink) {
      window.open("https://www.youtube.com/watch?v=DK_0jXPuIr0", "_blank");
      return;
    }
  }
}

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("click", onMouseClick);

// Animation
const animate = () => {
  requestAnimationFrame(animate);
  card.rotation.y += 0.002; // Slow continuous rotation
  controls.update();
  renderer.render(scene, camera);
};
animate();