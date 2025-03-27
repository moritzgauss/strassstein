// Add imports at the top
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

// Create background scene for stickmen
const stickmanScene = new THREE.Scene();
const stickmanCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
stickmanCamera.position.set(0, 0, 15);

const stickmanRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
stickmanRenderer.setSize(window.innerWidth, window.innerHeight);
stickmanRenderer.domElement.style.position = 'fixed';
stickmanRenderer.domElement.style.top = '0';
stickmanRenderer.domElement.style.left = '0';
stickmanRenderer.domElement.style.zIndex = '-1';
document.body.insertBefore(stickmanRenderer.domElement, document.body.firstChild);

// Add lights for stickmen
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
stickmanScene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 5, 5);
stickmanScene.add(directionalLight);

// Update stickman positions
const stickmanPositions = [
    { x: -3, y: -2, z: -5 },
];
const stickmen = [];

const gltfLoader = new GLTFLoader();
stickmanPositions.forEach(position => {
    gltfLoader.load(
        'https://raw.githubusercontent.com/moritzgauss/strassstein/main/hypercasual_stickman_character_-__soldier.glb',
        (gltf) => {
            const model = gltf.scene;
            model.position.set(position.x, position.y, position.z);
            model.scale.set(2.5, 2.3, 2.5); // Increased scale to make them bigger
            model.userData.isRotating = false;
            stickmanScene.add(model);
            stickmen.push(model);
        }
    );
});

// Add drag controls for stickmen
const dragControls = new DragControls(stickmen, stickmanCamera, stickmanRenderer.domElement);

dragControls.addEventListener('dragstart', (event) => {
    event.object.userData.isDragging = true;
    document.body.style.cursor = 'grabbing';
});

dragControls.addEventListener('drag', (event) => {
    // Constrain movement
    event.object.position.y = Math.max(-4, Math.min(2, event.object.position.y));
    event.object.position.x = Math.max(-5, Math.min(5, event.object.position.x));
    event.object.position.z = Math.max(-7, Math.min(-3, event.object.position.z));
});

dragControls.addEventListener('dragend', (event) => {
    event.object.userData.isDragging = false;
    document.body.style.cursor = 'auto';
});

// Update animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate stickmen that aren't being dragged
    stickmen.forEach(stickman => {
        if (!stickman.userData.isDragging) {
            stickman.rotation.y -= 0.02; // Changed to negative for opposite direction
        }
    });
    
    stickmanRenderer.render(stickmanScene, stickmanCamera);
}

// Start animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
    stickmanCamera.aspect = window.innerWidth / window.innerHeight;
    stickmanCamera.updateProjectionMatrix();
    stickmanRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ...existing card code...