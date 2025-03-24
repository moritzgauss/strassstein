import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// Scene, Camera & Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Remove default background
document.body.appendChild(renderer.domElement);

// OrbitControls for interactivity
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const directLight = new THREE.DirectionalLight(0xffffff, 1.2);
directLight.position.set(0, 2, 2); // Direct light from above
scene.add(directLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Material for the business card
const paperMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.9,
});

const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, paperMaterial);
scene.add(card);

// Load Oswald Font
const fontLoader = new FontLoader();
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json",
  function (font) {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    // Function to create raised text
    const createText = (text, yOffset, size = 0.15, isLink = false) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.02, // Extruded text instead of intruded
        bevelEnabled: false,
      });

      textGeometry.center();
      textGeometry.translate(0, yOffset, 0.03); // Raised text

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      card.add(textMesh);

      if (isLink) {
        textMesh.userData = { isLink: true };
      }

      return textMesh;
    };

    // Adding texts
    createText("STRASSSTEIN CALL CENTER", 0.6, 0.2);
    createText("For Graphic Swag", 0.2, 0.15);
    createText("<3 ‹› $$", -0.2, 0.15);

    // Adding clickable link
    const linkMesh = createText("BIGGEST INFLUENCE", -0.6, 0.1, true);
    linkMesh.material = new THREE.MeshStandardMaterial({ color: 0x0000ff });

    // Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(card.children);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (clickedObject.userData.isLink) {
          window.open("https://www.youtube.com/watch?v=DK_0jXPuIr0", "_blank");
        }
      }
    }

    window.addEventListener("click", onMouseClick, false);
  }
);

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