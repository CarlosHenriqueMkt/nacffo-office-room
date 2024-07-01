import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export function setupSceneFour(renderer) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x005500)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    // Add ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    // Add directional light to simulate sunlight
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 2); // Bright white light
    sunLight.position.set(0, 2, 0);
    sunLight.rotation.z = -5 // Position the light
    sunLight.castShadow = true; // Enable shadows
    
    const helper = new THREE.DirectionalLightHelper( sunLight, 1, 0x00dd00 );
    scene.add( helper );

    // Configure shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5; // Shadow camera near plane
    sunLight.shadow.camera.far = 50; // Shadow camera far plane
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    scene.add(sunLight);
    

    function model() {

        const environment = new RoomEnvironment( renderer );
        const pmremGenerator = new THREE.PMREMGenerator( renderer );
        scene.environment = pmremGenerator.fromScene( environment ).texture;
      
        // Setup DracoLoader
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');

        // Setup GLTFLoader with DracoLoader
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
      
        loader.load( 'v5.glb', function ( gltf ) {
          
          const model = gltf.scene
          model.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                if (node.material.map) node.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
            }
        });
          scene.add( model );
      
        }, undefined, function ( error ) {
      
          console.error( error );
      
        } );
      
      }

    model()

    const orbitControls = new OrbitControls(camera, document.getElementById('canvas'));
    orbitControls.enableDamping = true;

    const mouse = new THREE.Vector2();

    /* document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }); */

    // PointerLockControls
    const controls = new PointerLockControls(camera, document.body);
    const blocker = document.getElementById( 'blocker' );
	const instructions = document.getElementById( 'instructions' );

	instructions.addEventListener( 'click', function () {

		controls.lock();

		} );

	controls.addEventListener( 'lock', function () {

		instructions.style.display = 'none';
		blocker.style.display = 'none';

	    } );

	controls.addEventListener( 'unlock', function () {

		blocker.style.display = 'block';
		instructions.style.display = '';
		} );

				scene.add( controls.getObject() );

    const objects = [];
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let prevTime = performance.now();
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

    // Animation function
    function animate() {
        const time = performance.now();
        
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects(objects, false);
        const onObject = intersections.length > 0;

        const delta = (time - prevTime) / 3000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // This ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 30.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 30.0 * delta;

        if (onObject === true) {
            velocity.y = Math.max(0, velocity.y);
        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        prevTime = time;
    }

    return { scene, camera, /* orbitControls, */ raycaster, mouse: new THREE.Vector2(), animate };
}
