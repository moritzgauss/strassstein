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

// Fix the card material to make it white
const cardMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff, // White card
  roughness: 0.3, // Slightly smoother for a clean white look
  metalness: 0.1,
});
const cardGeometry = new THREE.BoxGeometry(3.5, 2, 0.05);
const card = new THREE.Mesh(cardGeometry, cardMaterial);
scene.add(card);

// Add lights to illuminate both sides of the card
const frontLight = new THREE.PointLight(0xffffff, 2, 15); // Front light
frontLight.position.set(0, 3, 3); // Above and in front of the card
scene.add(frontLight);

const backLight = new THREE.PointLight(0xffffff, 4, 20); // Increased intensity
backLight.position.set(0, -3, -3); // Behind and below the card
scene.add(backLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Global ambient light
scene.add(ambientLight);

// Tilt the card in the opposite direction
const updateCardTransform = () => {
  card.rotation.x = THREE.MathUtils.degToRad(-45); // Tilt 45 degrees forward
  card.rotation.y = THREE.MathUtils.degToRad(15); // Tilt 15 degrees to the right
};
updateCardTransform();
window.addEventListener("resize", updateCardTransform);

// Load fonts and create text
const fontLoader = new FontLoader();

// Front of the card (Oswald font)
fontLoader.load(
  "https://raw.githubusercontent.com/moritzgauss/strassstein/main/Oswald_Regular.json",
  function (oswaldFont) {
    const createText = (text, size = 0.15, color = 0x000000, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, isLink = false) => {
      const material = new THREE.MeshStandardMaterial({ color: color });
      const textGeometry = new TextGeometry(text, {
        font: oswaldFont,
        size: size,
        height: 0.01, // Less extruded text
        bevelEnabled: false, // No bevel
      });

      textGeometry.center();

      const textMesh = new THREE.Mesh(textGeometry, material);
      textMesh.position.set(position.x, position.y, position.z);
      textMesh.rotation.set(rotation.x, rotation.y, rotation.z);

      // If the text is a link, create a group with an underline
      if (isLink) {
        const linkGroup = new THREE.Group();
        textMesh.userData.isLink = true;
        textMesh.userData.url = "https://example.com";
        textMesh.userData.isFront = true; // Mark as front link

        // Add underline
        const underlineGeometry = new THREE.BoxGeometry(size * 2.5, 0.02, 0.01); // Wider and thicker underline
        const underlineMaterial = new THREE.MeshStandardMaterial({ color: color });
        const underlineMesh = new THREE.Mesh(underlineGeometry, underlineMaterial);
        underlineMesh.position.set(0, -size * 0.15, 0.01); // Position underline slightly below the text
        underlineMesh.userData.isLink = true; // Ensure the underline is also clickable
        underlineMesh.userData.url = "https://example.com";
        underlineMesh.userData.isFront = true; // Mark as front link

        // Add text and underline to the group
        linkGroup.add(textMesh);
        linkGroup.add(underlineMesh);
        linkGroup.position.set(position.x, position.y, position.z);
        linkGroup.rotation.set(rotation.x, rotation.y, rotation.z);

        card.add(linkGroup);
        return linkGroup;
      }

      card.add(textMesh);
      return textMesh;
    };

    // Correctly position the front textx
    createText("STRASSSTEIN CALL CENTER", 0.2, 0x000000, { x: 0, y: 0.6, z: 0.03 });
    createText("FOR GRAPHIC SWAG", 0.15, 0x000000, { x: 0, y: 0.2, z: 0.03 });
    createText("--> CLICK ME <--", 0.15, 0x000000, { x: 0, y: -0.2, z: 0.03 }, { x: 0, y: 0, z: 0 }, true);

    // Add hover and click effects for the links
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;

    function onPointerMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(card.children, true); // Check all children of the card

      let foundLink = false;

      for (let obj of intersects) {
        if (obj.object.userData.isLink) {
          foundLink = true;
          if (hoveredObject !== obj.object) {
            if (hoveredObject) {
              hoveredObject.material.color.set(0x000000); // Reset previous hovered object
            }
            obj.object.material.color.set(0xff0000); // Change to red on hover
            hoveredObject = obj.object;
          }
          break;
        }
      }

      if (!foundLink && hoveredObject) {
        hoveredObject.material.color.set(0x000000); // Reset when no link is hovered
        hoveredObject = null;
      }

      document.body.style.cursor = foundLink ? "pointer" : "default";
    }

    function onPointerClick(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(card.children, true); // Check all children of the card

      // Check which side of the card is visible
      const isFrontVisible = Math.abs((card.rotation.y % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) < Math.PI / 2;

      for (let intersect of intersects) {
        if (intersect.object.userData.isLink) {
          // Only allow interaction with links on the visible side
          const isLinkOnFront = intersect.object.userData.isFront;
          if ((isFrontVisible && isLinkOnFront) || (!isFrontVisible && !isLinkOnFront)) {
            window.open(intersect.object.userData.url, "_blank");
            return;
          }
        }
      }
    }

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("click", onPointerClick);
  }
);

// Back of the card (Helvetiker font)
fontLoader.load(
  "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json",
  function (helvetikerFont) {
    const createText = (text, size, color, position, rotation, isFront, url) => {
      const material = new THREE.MeshStandardMaterial({ color: color });
      const textGeometry = new TextGeometry(text, {
        font: helvetikerFont,
        size: size,
        height: 0.01, // Less extruded text
        bevelEnabled: false, // No bevel
      });

      textGeometry.center();

      const textMesh = new THREE.Mesh(textGeometry, material);
      textMesh.position.set(position.x, position.y, position.z);
      textMesh.rotation.set(rotation.x, rotation.y, rotation.z);

      if (url) {
        textMesh.userData.isLink = true;
        textMesh.userData.isFront = isFront; // Mark whether the link is on the front or back
        textMesh.userData.url = url;
      }

      card.add(textMesh);
      return textMesh;
    };

    createText("CONTACT DETAILS", 0.15, 0x000000, { x: 0, y: 0.6, z: -0.03 }, { x: 0, y: Math.PI, z: 0 });
    createText("Phone: +123 456 789", 0.12, 0x000000, { x: 0, y: 0.2, z: -0.03 }, { x: 0, y: Math.PI, z: 0 });
    createText("Email: example@email.com", 0.12, 0x000000, { x: 0, y: -0.2, z: -0.03 }, { x: 0, y: Math.PI, z: 0 });

    // Add "CLICK ME" link to the back
    createText("--> CLICK ME <--", 0.15, 0x000000, { x: 0, y: -0.4, z: -0.03 }, { x: 0, y: Math.PI, z: 0 }, false, "https://example.com");

    // Add "INSTAGRAM" link to the back
    createText("INSTAGRAM", 0.15, 0x000000, { x: 0, y: 0, z: -0.03 }, { x: 0, y: Math.PI, z: 0 }, false, "https://instagram.com/strasssteincallcenter");
  }
);

// Hover and Click Logic
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(card.children, true);

  let foundLink = false;

  // Check which side of the card is visible
  const isFrontVisible = Math.abs((card.rotation.y % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) < Math.PI / 2;

  for (let obj of intersects) {
    if (obj.object.userData.isLink) {
      const isLinkOnFront = obj.object.userData.isFront;
      if ((isFrontVisible && isLinkOnFront) || (!isFrontVisible && !isLinkOnFront)) {
        foundLink = true;
        if (hoveredObject !== obj.object) {
          if (hoveredObject) {
            hoveredObject.material.color.set(0x000000); // Reset previous hovered object
          }
          obj.object.material.color.set(0xff0000); // Change to red on hover
          hoveredObject = obj.object;
        }
        break;
      }
    }
  }

  if (!foundLink && hoveredObject) {
    hoveredObject.material.color.set(0x000000); // Reset when no link is hovered
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
    if (intersect.object.userData.isLink) {
      const isLinkOnFront = intersect.object.userData.isFront;
      if ((isFrontVisible && isLinkOnFront) || (!isFrontVisible && !isLinkOnFront)) {
        window.open(intersect.object.userData.url, "_blank");
        return;
      }
    }
  }
}

window.addEventListener("mousemove", onPointerMove);
window.addEventListener("click", onPointerClick);

// Animation for random card rotation
let isRotating = false;

const startRandomRotation = () => {
  if (isRotating) return; // Prevent overlapping rotations
  isRotating = true;

  const initialRotationX = card.rotation.x;
  const initialRotationY = card.rotation.y;

  const duration = 2000; // 2 seconds for the rotation
  const startTime = performance.now();

  const animateRotation = (time) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1); // Clamp progress to [0, 1]
    const easing = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

    // Rotate twice around both axes
    card.rotation.x = initialRotationX + easing * Math.PI * 2; // 2 full turns
    card.rotation.y = initialRotationY + easing * Math.PI * 2;

    if (progress < 1) {
      requestAnimationFrame(animateRotation);
    } else {
      // Add a slight bounce effect after rotation
      const bounceDuration = 1000; // 0.5 seconds for the bounce
      const bounceStartTime = performance.now();

      const animateBounce = (bounceTime) => {
        const bounceElapsed = bounceTime - bounceStartTime;
        const bounceProgress = Math.min(bounceElapsed / bounceDuration, 1);
        const bounceEasing = Math.sin(bounceProgress * Math.PI); // Bounce effect

        card.rotation.x = initialRotationX + Math.PI * 4 + bounceEasing * 0.1; // Slight bounce
        card.rotation.y = initialRotationY + Math.PI * 4 + bounceEasing * 0.1;

        if (bounceProgress < 1) {
          requestAnimationFrame(animateBounce);
        } else {
          isRotating = false; // Allow new rotations
        }
      };

      requestAnimationFrame(animateBounce);
    }
  };

  requestAnimationFrame(animateRotation);
};

// Trigger random rotation every 10 seconds
setInterval(() => {
  startRandomRotation();
}, 10000);

// Render loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();

// Adjust window size
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});