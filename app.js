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

// FontLoader for Oswald font (from GitHub)
const fontLoader = new FontLoader();
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json", // Oswald font
  function (font) {
    // Function to create text (reduced extrusion, no outline)
    const createText = (text, yOffset, size = 0.15, color = 0x000000, url = null) => {
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
  }
);

// FontLoader for Helvetiker (from CDN)
const helvetikerFontLoader = new FontLoader();
helvetikerFontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json", // Helvetiker font from CDN
  function (font) {
    // Back Text (Helvetiker font for contact details)
    const contactText = new TextGeometry("Contact Details", {
      font: font,
      size: 0.1,
      height: 0.005,
      bevelEnabled: false,
    });
    const contactMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const contactMesh = new THREE.Mesh(contactText, contactMaterial);
    contactMesh.position.set(-1.5, -0.5, 0);
    card.add(contactMesh);

    // Visit Website Link (Helvetiker font)
    const linkText = new TextGeometry("Visit Website", {
      font: font,
      size: 0.1,
      height: 0.005,
      bevelEnabled: false,
    });
    const linkMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green text
    const linkMesh = new THREE.Mesh(linkText, linkMaterial);
    linkMesh.position.set(-1.5, -1, 0);
    card.add(linkMesh);

    // Raycasting for Mouse Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Function to update mouse position on hover and apply hover effect
    const onMouseMove = (event) => {
      // Normalize mouse coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update raycaster with mouse position
      raycaster.setFromCamera(mouse, camera);

      // Check if mouse intersects with the text
      const intersects = raycaster.intersectObject(linkMesh);

      if (intersects.length > 0) {
        // Apply hover effect (underline and color change)
        linkMaterial.color.set(0x0000ff); // Blue color on hover
        linkText.parameters.size = 0.11; // Slightly increase the size on hover
      } else {
        // Reset hover effect
        linkMaterial.color.set(0x00ff00); // Green color
        linkText.parameters.size = 0.1;
      }
    };

    // Event listener for mouse move (hover effect)
    window.addEventListener("mousemove", onMouseMove);

    // Add click event for navigation
    window.addEventListener("click", (event) => {
      const intersects = raycaster.intersectObject(linkMesh);
      if (intersects.length > 0) {
        // Navigate to website when clicked
        window.open("https://apinchofsalt.de/", "_blank");
      }
    });
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