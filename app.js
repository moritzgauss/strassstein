import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Card lights
const cardLight1 = new THREE.PointLight(0xffffff, 20, 10);
cardLight1.position.set(2, 2, 3);
scene.add(cardLight1);

const cardLight2 = new THREE.PointLight(0xffffff, 15, 10);
cardLight2.position.set(-2, 1, -3);
scene.add(cardLight2);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

// Add hemisphere light for better overall lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemisphereLight);

// Card material and geometry
const textureLoader = new THREE.TextureLoader();
const cardMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Paper001_1K-JPG/Paper001_1K-JPG_Color.jpg"),
  normalMap: textureLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Paper001_1K-JPG/Paper001_1K-JPG_NormalGL.jpg"),
  roughnessMap: textureLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Paper001_1K-JPG/Paper001_1K-JPG_Roughness.jpg"),
  roughness: 0.1,
  metalness: 0.0,
  color: 0xffffff,
  emissive: 0x333333, // Add slight emission for brighter appearance
});

const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.02); // Changed thickness from 0.05 to 0.02
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Text and links
const fontLoader = new FontLoader();
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json",
  function (font) {
    const createText = (text, yOffset, size = 0.2, isLink = false, url = "", isFront = true) => {
      const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.0,
        roughness: 0.1
      });
      
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.005, // Reduced from 0.02
        bevelEnabled: true,
        bevelThickness: 0.001,
        bevelSize: 0.001,
        bevelSegments: 3
      });
      
      textGeometry.center();
      const textMesh = new THREE.Mesh(textGeometry, material);
      
      if (isFront) {
        textMesh.position.set(0, yOffset, 0.03);
      } else {
        textMesh.position.set(0, yOffset, -0.03);
        textMesh.rotation.y = Math.PI;
      }
      
      if (isLink) {
        textMesh.userData = {
          isLink: true,
          isFront: isFront,
          url: url
        };
      }
      
      card.add(textMesh);
      return textMesh;
    };

    // Create text elements
    createText("STRASSSTEIN CALL CENTER", 0.6, 0.18, false, "", true);
    createText("For Graphic Swag", 0.2, 0.15, false, "", true);
    createText("CONTACT", 0.6, 0.18, false, "", false);
    createText("Instagram", -0.6, 0.15, true, "https://instagram.com/strasssteincallcenter", false);
  }
);

// Stickman setup
const stickmanScene = new THREE.Scene();
const stickmanCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
stickmanCamera.position.set(0, -1, 5);

const stickmanRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
stickmanRenderer.setSize(window.innerWidth, window.innerHeight);
stickmanRenderer.domElement.style.position = "absolute";
stickmanRenderer.domElement.style.top = "0";
stickmanRenderer.domElement.style.left = "0";
stickmanRenderer.domElement.style.zIndex = "-1";
document.body.appendChild(stickmanRenderer.domElement);

// Stickman loading and setup
const stickmanPositions = [
  { x: 0, y: -1, z: -3 },
  { x: 2, y: -1, z: -3 },
  { x: -2, y: -1, z: -3 }
];
const stickmen = [];

stickmanPositions.forEach((position) => {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/stick_man._fully_rigged.glb", (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          color: 0xffffff,
          metalness: 0.0,
          roughness: 0.2
        });
      }
    });
    model.position.set(position.x, position.y, position.z);
    model.scale.set(0.5, 0.5, 0.5);
    stickmanScene.add(model);
    stickmen.push(model);
  });
});

// Stickman lighting
const stickmanDirectionalLight = new THREE.DirectionalLight(0xffffff, 2);
stickmanDirectionalLight.position.set(5, 5, 5);
stickmanScene.add(stickmanDirectionalLight);

const stickmanAmbientLight = new THREE.AmbientLight(0xffffff, 0.8);
stickmanScene.add(stickmanAmbientLight);

// Link interaction setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(card.children, true);

  let foundLink = false;
  const isFrontVisible = Math.abs((card.rotation.y % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) < Math.PI / 2;

  for (let obj of intersects) {
    if (obj.object.userData?.isLink) {
      const isLinkOnFront = obj.object.userData.isFront;
      if ((isFrontVisible && isLinkOnFront) || (!isFrontVisible && !isLinkOnFront)) {
        foundLink = true;
        if (hoveredObject !== obj.object) {
          if (hoveredObject) {
            hoveredObject.material.color.set(0x000000);
          }
          obj.object.material.color.set(0xff0000);
          hoveredObject = obj.object;
        }
        break;
      }
    }
  }

  if (!foundLink && hoveredObject) {
    hoveredObject.material.color.set(0x000000);
    hoveredObject = null;
  }

  document.body.style.cursor = foundLink ? "pointer" : "default";
}

function onPointerClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(card.children, true);

  const isFrontVisible = Math.abs((card.rotation.y % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) < Math.PI / 2;

  for (let intersect of intersects) {
    if (intersect.object.userData?.isLink) {
      const isLinkOnFront = intersect.object.userData.isFront;
      if ((isFrontVisible && isLinkOnFront) || (!isFrontVisible && !isLinkOnFront)) {
        window.open(intersect.object.userData.url, '_blank');
        return;
      }
    }
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Continuous stickman rotation
  stickmen.forEach((stickman) => {
    stickman.rotation.y += 0.02;
  });

  renderer.render(scene, camera);
  stickmanRenderer.render(stickmanScene, stickmanCamera);
}

// Event listeners
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('click', onPointerClick);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  stickmanRenderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();
