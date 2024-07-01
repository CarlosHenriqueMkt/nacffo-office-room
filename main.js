import gsap from 'gsap';
import * as THREE from 'three';
import { setupSceneOne } from './scenes/sceneone.js';
import { setupSceneTwo } from './scenes/scenetwo.js';
import { setupSceneThree } from './scenes/scenethree.js';
import { setupSceneFour } from './scenes/scenefour.js';

// Basic setup
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Create render targets for each scene
const renderTarget1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const renderTarget2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const renderTarget3 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const renderTarget4 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

// Setup scenes
const { scene: scene1, camera: camera1, animateSnowflakes: animateSnowflakes1 } = setupSceneOne();
const { scene: scene2, camera: camera2, animateSnowflakes: animateSnowflakes2 } = setupSceneTwo();
const { scene: scene3, camera: camera3, animateSnowflakes: animateSnowflakes3 } = setupSceneThree();
const { scene: scene4, camera: camera4, /* orbitControls: controls4, */ animate: animate } = setupSceneFour(renderer);

// Quad to display the render targets
const quadGeometry = new THREE.PlaneGeometry(2, 2);
const quadMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTexture: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;
        void main() {
            gl_FragColor = texture2D(uTexture, vUv);
        }
    `
});
const quadMesh = new THREE.Mesh(quadGeometry, quadMaterial);
const screenScene = new THREE.Scene();
const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
screenScene.add(quadMesh);

// Initial render target
let currentRenderTarget = renderTarget1;

// Render function
function render() {
    requestAnimationFrame(render);

    if(currentRenderTarget === renderTarget4) {
        animate();  // Update controls for Scene 4
    }

    animateSnowflakes1();
    animateSnowflakes2();
    animateSnowflakes3();

    // Render each scene to its render target
    renderer.setRenderTarget(renderTarget1);
    renderer.render(scene1, camera1);

    renderer.setRenderTarget(renderTarget2);
    renderer.render(scene2, camera2);

    renderer.setRenderTarget(renderTarget3);
    renderer.render(scene3, camera3);

    renderer.setRenderTarget(renderTarget4);
    /* controls4.update(); */

    renderer.render(scene4, camera4);
    // Render the selected render target to the screen
    quadMaterial.uniforms.uTexture.value = currentRenderTarget.texture;
    renderer.setRenderTarget(null);
    renderer.render(screenScene, screenCamera); 
}

// Function to switch HTML content
function switchContent(sceneNumber) {
    document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`content${sceneNumber}`).classList.add('active');
}

switchContent(1);

// Function to perform GSAP transition
function transitionToScene(sceneNumber) {

  // Check if the current scene is already active
  if (sceneNumber === 1 && currentRenderTarget === renderTarget1 ||
    sceneNumber === 2 && currentRenderTarget === renderTarget2 ||
    sceneNumber === 3 && currentRenderTarget === renderTarget3 ||
    sceneNumber === 4 && currentRenderTarget === renderTarget4) {
    return; // Exit early if the button for the current scene is clicked again
  }

  gsap.to([camera1.position, camera2.position, camera3.position, camera4.position], {
      duration: 1, // Duration of the transition
      x: 0, y: 0, z: -15,
      ease: 'power2.inOut', // Target position
      onComplete: () => {
          currentRenderTarget = sceneNumber === 1 ? renderTarget1 :
                                sceneNumber === 2 ? renderTarget2 :
                                sceneNumber === 3 ? renderTarget3 : renderTarget4;
          switchContent(sceneNumber);
          gsap.to([camera1.position, camera2.position, camera3.position, camera4.position], { duration: 0, x: 0, y: 0, z: 5 });
          gsap.to([camera4.position], { duration: 0, x: 0, y: 1, z: 2 });
      }
  });
}

// Event listeners for buttons
document.getElementById('scene1Button').addEventListener('click', () => {
    transitionToScene(1);
});
document.getElementById('scene2Button').addEventListener('click', () => {
    transitionToScene(2);
});
document.getElementById('scene3Button').addEventListener('click', () => {
    transitionToScene(3);
});
document.getElementById('scene4Button').addEventListener('click', () => {
    transitionToScene(4);
});

// Start the rendering loop
render();

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera1.aspect = width / height;
    camera1.updateProjectionMatrix();
    camera2.aspect = width / height;
    camera2.updateProjectionMatrix();
    camera3.aspect = width / height;
    camera3.updateProjectionMatrix();
    camera4.aspect = width / height;
    camera4.updateProjectionMatrix();
    renderTarget1.setSize(width, height);
    renderTarget2.setSize(width, height);
    renderTarget3.setSize(width, height);
    renderTarget4.setSize(width, height);
});
