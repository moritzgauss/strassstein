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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Visitenkarte (thinner card)
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0 });
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05); // Thinner card (0.05)
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Function to update card position and scaling based on window size
const updateCardTransform = () => {
  if (window.innerWidth < 768) {
    // Mobile: Keep current position and scaling
    card.position.set(-0.5, -0.05, 0);
    card.scale.set(0.5, 0.5, 0.5);
    card.rotation.x = -0.8;
  } else {
    // Desktop: Center the card
    card.position.set(0, 0, 0);
    card.scale.set(1, 1, 1);
    card.rotation.x = -0.8;
  }
};
updateCardTransform();
window.addEventListener("resize", updateCardTransform);

// FontLoader for Text
const fontLoader = new FontLoader();
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json", // Oswald font
  function (font) {
    // Function to create text (reduced extrusion, no outline)
    const createText = (text, yOffset, size = 0.15, color = 0x000000, url = null, font = font) => {
      const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.5 });
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: size,
        height: 0.005, // Reduced extrusion
        bevelEnabled: false, // No bevel
      });

      textGeometry.center(); // Center the text geometry
      textGeometry.translate(0, yOffset, 0.1); // Position the text

      const textMesh = new THREE.Mesh(textGeometry, material);
      textMesh.userData = { color, url }; // Store color and URL

      card.add(textMesh);
      return textMesh;
    };

    // Front Texts (Oswald font)
    createText("STRASSSTEIN CALL CENTER", 0.6, 0.2);
    createText("For Graphic Swag", 0.2, 0.15);

    // Back Text (Helvetiker font for contact details)
    fontLoader.load("https://raw.githubusercontent.com/moritzgauss/strassstein/main/Helvetiker_Regular.json", function (helvetikerFont) {
      createText("Contact Details", -0.6, 0.15, 0x000000, null, helvetikerFont);
      const linkMesh = createText("-->ENTER<--", -0.8, 0.12, 0xff0000, "https://youtu.be/U_IbIMUbh-k", helvetikerFont);
      linkMesh.position.set(0, -0.8, 0); // Move the link to the bottom of the contact details section
    });

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;

    function onPointerMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(card.children);

      let foundLink = false;
      for (let obj of intersects) {
        if (obj.object.userData.url) {
          foundLink = true;
          if (hoveredObject !== obj.object) {
            if (hoveredObject) {
              hoveredObject.material.color.set(hoveredObject.userData.color);
            }
            obj.object.material.color.set(0xffff00); // Change color on hover
            hoveredObject = obj.object;
          }
          break;
        }
      }

      if (!foundLink && hoveredObject) {
        hoveredObject.material.color.set(hoveredObject.userData.color);
        hoveredObject = null;
      }

      document.body.style.cursor = foundLink ? "pointer" : "default";
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

// Sound effect
const sound = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Example sound URL
let time = 0;
const playSoundEvery10Secs = () => {
  if (time % 10 === 0) {
    sound.play();
  }
};

// Animation
const animate = () => {
  requestAnimationFrame(animate);

  time += 0.02;

  // Card rotation every 10 seconds
  if (time % 10 < 0.02) {
    card.rotation.y += Math.PI / 6; // Rotate the card every 10 seconds
  }

  playSoundEvery10Secs();

  controls.update();
  renderer.render(scene, camera);
};
animate();

// Window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});