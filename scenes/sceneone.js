import * as THREE from 'three';

let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
const materials = [];

export function setupSceneOne() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.FogExp2(0xffffff, 0.01);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;


    //logo on back to simple transition effect
    const logoTex = new THREE.TextureLoader()
    const logo = logoTex.load('logo-vert.png')
    const logoGeo = new THREE.PlaneGeometry(2.5, 1)
    const logoMat = new THREE.MeshBasicMaterial({ map: logo, transparent: true, opacity: .15 })
    const logoMesh = new THREE.Mesh(logoGeo, logoMat)
    logoMesh.position.set(0, 0, -15)
    scene.add(logoMesh)

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const textureLoader = new THREE.TextureLoader();

    const assignSRGB = (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
    };

    const sprite1 = textureLoader.load('circle_05.png', assignSRGB);
    const sprite2 = textureLoader.load('circle_05.png', assignSRGB);
    const sprite3 = textureLoader.load('circle_05.png', assignSRGB);
    const sprite4 = textureLoader.load('circle_05.png', assignSRGB);
    const sprite5 = textureLoader.load('circle_05.png', assignSRGB);

    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;

        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const parameters = [
        [[1.0, 0.2, 0.5], sprite2, 4],
        [[0.95, 0.1, 0.5], sprite3, 4],
        [[0.90, 0.05, 0.5], sprite1, 4],
        [[0.85, 0, 0.5], sprite5, 4],
        [[0.80, 0, 0.5], sprite4, 4]
    ];

    for (let i = 0; i < parameters.length; i++) {
        const color = parameters[i][0];
        const sprite = parameters[i][1];
        const size = parameters[i][2];

        materials[i] = new THREE.PointsMaterial({
            size: size,
            map: sprite,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        materials[i].color.setHSL(color[0], color[1], color[2], THREE.SRGBColorSpace);

        const particles = new THREE.Points(geometry, materials[i]);

        particles.rotation.x = Math.random() * 6;
        particles.rotation.y = Math.random() * 6;
        particles.rotation.z = Math.random() * 6;

        scene.add(particles);
    }

    document.body.style.touchAction = 'none';
    document.body.addEventListener('pointermove', onPointerMove);

    function onPointerMove(event) {
        if (event.isPrimary === false) return;

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function animateSnowflakes() {
        const time = Date.now() * 0.000005;

        for (let i = 0; i < scene.children.length; i++) {
            const object = scene.children[i];
            if (object instanceof THREE.Points) {
                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }

        for (let i = 0; i < materials.length; i++) {
            const color = parameters[i][0];
            const h = (360 * (color[0] + time) % 360) / 360;
            materials[i].color.setHSL(h, color[1], color[2], THREE.SRGBColorSpace);
        }
    }

    return { scene, camera, animateSnowflakes };
}
