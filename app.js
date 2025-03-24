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
card.position.set(-0.5, -0.1, 0);
scene.add(card);

// Anpassung für mobile Geräte
const updateCardTransform = () => {
  if (window.innerWidth < 768) {
    card.scale.set(0.5, 0.5, 0.5);
    card.rotation.x = -0.5;
  } else {
    card.scale.set(1, 1, 1);
    card.rotation.x = 0;
  }
};
updateCardTransform();
window.addEventListener("resize", updateCardTransform);

// FontLoader für Text
const fontLoader = new FontLoader();
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json",
  function (font) {
    const createText = (text, yOffset, size = 0.15, color = 0x000000, url = null) => {
      const material = new THREE.MeshStandardMaterial({ color: color });
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.05,
        bevelEnabled: false,
      });

      textGeometry.center();
      textGeometry.translate(0, yOffset, 0.03);

      const textMesh = new THREE.Mesh(textGeometry, material);
      if (url) {
        textMesh.userData.url = url;
      }
      card.add(textMesh);
      return textMesh;
    };

    createText("STRASSSTEIN CALL CENTER", 0.6, 0.2);
    createText("For Graphic Swag", 0.2, 0.15);
    createText("<3 ‹› $$", -0.2, 0.15);

    // **Klickbarer Link-Text**
    const linkMesh = createText("BIGGEST INFLUENCE", -0.6, 0.12, 0x0000ff, "https://www.youtube.com/watch?v=DK_0jXPuIr0");

    // **Raycaster für Klicks**
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onPointerMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(card.children);

      document.body.style.cursor = intersects.some((obj) => obj.object.userData.url) ? "pointer" : "default";
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