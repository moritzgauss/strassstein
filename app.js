import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15); // Positioned above and back for a good starting view
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;  // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Load HDR Environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load("environment.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Load GLB Model
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "model.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(3, 3, 3);
    model.position.set(0, -2, 0); // Position the model on the ground
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true; // Enable shadow casting
        child.receiveShadow = true; // Enable shadow receiving
      }
    });
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
  }
);

// Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true; // Ensure light casts shadows
scene.add(directionalLight);

// Create Ground Plane to Receive Shadows
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 }); // Transparent shadow
const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
groundPlane.rotation.x = -Math.PI / 2; // Rotate the ground to be horizontal
groundPlane.position.y = -2; // Position below the model
groundPlane.receiveShadow = true; // Ensure it receives shadows
scene.add(groundPlane);

// Orbit Controls for Camera Movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth the camera movements
controls.dampingFactor = 0.1;
controls.minDistance = 5; // Set how close the camera can zoom in
controls.maxDistance = 50; // Set how far the camera can zoom out

// Create Text: "Strassstein Callcenter"
const fontLoader = new FontLoader();
fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Strassstein Callcenter", {
    font: font,
    size: 2,
    height: 0.2,
    curveSegments: 12,
  });

  const textMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(-20, 4, -10); // Move the text further behind the model
  textMesh.rotation.x = -0.1;
  scene.add(textMesh);

  // Animate Text (Flag Effect)
  const waveText = () => {
    const vertices = textGeometry.attributes.position.array;
    const wave = gsap.timeline();
    for (let i = 0; i < vertices.length; i += 3) {
      const delay = (i / vertices.length) * 0.5;
      wave.to(
        vertices,
        {
          [i + 1]: vertices[i + 1] + Math.random() * 0.5 - 0.25, // Slight vertical wave
          [i + 2]: vertices[i + 2] + Math.random() * 0.5 - 0.25, // Slight depth wave
          duration: 0.5,
          repeat: 1,
          yoyo: true,
          delay: delay,
          onUpdate: () => {
            textGeometry.attributes.position.needsUpdate = true;
          },
        },
        0
      );
    }
  };

  // Add Event Listener
  window.addEventListener("click", waveText);
});

// Create Text for the link: "Visit Website"
fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Visit Website", {
    font: font,
    size: 2,
    height: 0.2,
    curveSegments: 12,
  });

  const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green text
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(6, 4, -10); // Move the text further behind the model
  textMesh.rotation.x = -0.1;
  scene.add(textMesh);

  // Raycasting for Mouse Hover
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Function to update mouse position on hover and apply effect
  const onMouseMove = (event) => {
    // Normalize mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster with mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check if mouse intersects with the text
    const intersects = raycaster.intersectObject(textMesh);

    if (intersects.length > 0) {
      // Change text color on hover
      textMaterial.color.set(0x0000ff); // Change text color to blue
      textGeometry.parameters.size = 1.1; // Slightly increase the size
    } else {
      // Reset text color and size when not hovering
      textMaterial.color.set(0x00ff00);
      textGeometry.parameters.size = 1;
    }
  };

  // Event listener for mouse move (hover effect)
  window.addEventListener("mousemove", onMouseMove);

  // Add click event for navigation
  window.addEventListener("click", (event) => {
    const intersects = raycaster.intersectObject(textMesh);
    if (intersects.length > 0) {
      // Navigate to website when clicked
      window.open("https://apinchofsalt.de/", "_blank");
    }
  });
});

// Add Background Music
const audio = new Audio("./under_your_spell.mp3"); // Replace with your MP3 file path
audio.loop = true;

document.body.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch((err) => console.error("Failed to play audio:", err));
  }
});

// Animation Loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update(); // Update controls every frame
  renderer.render(scene, camera);
};
animate();

// Handle Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
