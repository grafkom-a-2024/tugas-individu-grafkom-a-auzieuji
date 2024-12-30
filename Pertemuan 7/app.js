import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

camera.position.z = 5;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    '5.jpg', '6.jpg',
    '3.jpg', '4.jpg',
    '1.jpg', '2.jpg'
]);
scene.background = texture;

let mode = 'idle';
let speed = 0.05;

let loadedModel = null;

function handleKeyDown(event) {
    switch (event.key) {
        case 'w':
            mode = 'walk';
            speed = 0.05;
            break;
        case 's':
            mode = 'walk back';
            speed = 0.05;
            break;
        case 'a':
            mode = 'left';
            speed = 0.05;
            break;
        case 'd':
            mode = 'right';
            speed = 0.05;
            break;
        case ' ':
            mode = 'jump';
            break;
        case 'i':
            mode = 'idle';
            break;
        default:
            console.log(`Key pressed: ${event.key}`);
    }
}
document.addEventListener('keydown', handleKeyDown);

const gltfLoader = new GLTFLoader();
gltfLoader.load('Pathfinder_1k.glb', (gltf) => {
    loadedModel = gltf.scene;
    scene.add(loadedModel);
    loadedModel.position.set(0, 0, 0);
    loadedModel.scale.set(1, 1, 1);
});

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    if (loadedModel) {
        if (mode === 'walk') {
            loadedModel.position.z -= speed;
        } else if (mode === 'walk back') {
            loadedModel.position.z += speed;
        } else if (mode === 'right') {
            loadedModel.position.x += speed;
        } else if (mode === 'left') {
            loadedModel.position.x -= speed;
        } else if (mode === 'jump') {
            loadedModel.position.y = Math.sin(Date.now() * 0.005) * 0.5;
        } else if (mode === 'idle') {
            speed = 0;
        }

        if (mode !== 'jump') {
            loadedModel.position.y = 0;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();