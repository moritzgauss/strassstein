import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// PBR-Texturen
const textureLoader = new THREE.TextureLoader();
const cardMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Paper001_1K-JPG/Paper001_1K-JPG_Color.jpg"),
  normalMap: textureLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Paper001_1K-JPG/Paper001_1K-JPG_NormalGL.jpg"),
  roughnessMap: textureLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Paper001_1K-JPG/Paper001_1K-JPG_Roughness.jpg"),
  roughness: 0.8,
  metalness: 0
});

// Visitenkarte
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Stempel-Overlay
const stampTexture = textureLoader.load("https://i.pinimg.com/736x/8e/53/82/8e5382c9ae4fae7f9b2bbc2e79e95444.jpg");
stampTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
const stampMaterial = new THREE.MeshBasicMaterial({
  map: stampTexture,
  transparent: true,
  opacity: 0.6
});
const stampGeometry = new THREE.PlaneGeometry(2, 1);
const stamp = new THREE.Mesh(stampGeometry, stampMaterial);
stamp.position.set(0.8, -0.6, 0.051);
card.add(stamp);

// Text
const fontLoader = new FontLoader();
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json",
  function (font) {
    const createText = (text, yOffset, size = 0.2, isLink = false, url = "") => {
      const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.02,
        bevelEnabled: false,
      });
      textGeometry.center();
      textGeometry.translate(0, yOffset, 0.03);
      const textMesh = new THREE.Mesh(textGeometry, material);
      card.add(textMesh);
      
      if (isLink) {
        textMesh.userData = { url };
      }
    };

    // Vorderseite
    createText("STRASSSTEIN CALL CENTER", 0.6, 0.18);
    createText("For Graphic Swag", 0.2, 0.15);
    createText("+49 123 4567890", -0.2, 0.18);
    createText("emailinfo@kaisteinstraesser.com", -0.6, 0.12, true, "mailto:emailinfo@kaisteinstraesser.com");
    createText("@strasssteincallcenter", -0.8, 0.12, true, "https://instagram.com/strasssteincallcenter");
  }
);

// Stickman Modelle (statisch hinter der Visitenkarte)
const gltfLoader = new GLTFLoader();
gltfLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/stick_man._fully_rigged.glb", (gltf) => {
  const model = gltf.scene;
  model.position.set(0, 0, -2);
  model.scale.set(0.5, 0.5, 0.5);
  scene.add(model);
});

// Klickbare Links
window.addEventListener("click", (event) => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  intersects.forEach((intersect) => {
    if (intersect.object.userData.url) {
      window.open(intersect.object.userData.url, "_blank");
    }
  });
});

// Animation
const animate = () => {
  requestAnimationFrame(animate);
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
