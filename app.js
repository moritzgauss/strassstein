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

// Position & Rotate Card
const updateCardTransform = () => {
  card.rotation.x = THREE.MathUtils.degToRad(-45);
  card.rotation.y = THREE.MathUtils.degToRad(15);
};
updateCardTransform();
window.addEventListener("resize", updateCardTransform);

// Load Fonts & Create Text
const fontLoader = new FontLoader();

// Front & Back Text Setup
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json",
  (font) => {
    // **Front Side**
    createText("STRASSSTEIN CALL CENTER", 0.2, 0x000000, { x: 0, y: 0.6, z: 0.03 });
    createText("FOR GRAPHIC SWAG", 0.15, 0x000000, { x: 0, y: 0.2, z: 0.03 });
    createText("CLICK ME", 0.15, 0x0000ff, { x: 0, y: -0.2, z: 0.03 }, "https://example.com");

    // **Back Side**
    createText("CONTACT DETAILS", 0.15, 0x000000, { x: 0, y: 0.6, z: -0.03 });
    createText("Phone: +123 456 789", 0.12, 0x000000, { x: 0, y: 0.2, z: -0.03 });
    createText("Email: example@email.com", 0.12, 0x000000, { x: 0, y: -0.2, z: -0.03 });
    createText("Instagram", 0.15, 0x0000ff, { x: 0, y: -0.5, z: -0.03 }, "https://instagram.com/strasssteincallcenter");
  }
);

// **Create Clickable Text Function**
function createText(text, size, color, position, url = "") {
  const textMaterial = new THREE.MeshStandardMaterial({ color });
  const textGeometry = new TextGeometry(text, {
    font: fontLoader,
    size,
    height: 0.01,
    bevelEnabled: false
  });

  textGeometry.center();
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(position.x, position.y, position.z);
  card.add(textMesh);

  if (url) {
    textMesh.userData.isLink = true;
    textMesh.userData.url = url;
  }

  return textMesh;
}

// **Raycasting for Click & Hover Events**
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(card.children, true);

  let foundLink = false;
  for (let obj of intersects) {
    if (obj.object.userData.isLink) {
      foundLink = true;
      if (hoveredObject !== obj.object) {
        if (hoveredObject) {
          hoveredObject.material.color.set(0x0000ff);
        }
        obj.object.material.color.set(0xff0000); // Red on hover
        hoveredObject = obj.object;
      }
      break;
    }
  }

  if (!foundLink && hoveredObject) {
    hoveredObject.material.color.set(0x0000ff);
    hoveredObject = null;
  }

  document.body.style.cursor = foundLink ? "pointer" : "default";
}

function onPointerClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(card.children, true);

  for (let intersect of intersects) {
    if (intersect.object.userData.isLink) {
      window.open(intersect.object.userData.url, "_blank");
      return;
    }
  }
}

window.addEventListener("mousemove", onPointerMove);
window.addEventListener("click", onPointerClick);

// **Animation for Random Card Rotation**
let isRotating = false;

const startRandomRotation = () => {
  if (isRotating) return;
  isRotating = true;

  const initialRotationX = card.rotation.x;
  const initialRotationY = card.rotation.y;

  const duration = 2000;
  const startTime = performance.now();

  const animateRotation = (time) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
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
};

// Trigger rotation every 10 seconds
setInterval(startRandomRotation, 10000);

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