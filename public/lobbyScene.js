import { THREE } from './threeImport.js';

let scene, camera, renderer, car;
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
let currentColorIndex = 0;

export function initLobbyScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('lobby-container').appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add grass plane
    const grassTexture = new THREE.TextureLoader().load('grass_texture.jpg');
    const grassGeometry = new THREE.PlaneGeometry(10, 10);
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    scene.add(grass);

    // Add car
    const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
    const carMaterial = new THREE.MeshStandardMaterial({ color: colors[currentColorIndex] });
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.y = 0.25;
    scene.add(car);

    // Set up camera
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);

    // Add event listener for color change
    document.addEventListener('keydown', (event) => {
        if (event.key === 'c' || event.key === 'C') {
            changeCarColor();
        }
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function changeCarColor() {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    car.material.color.setStyle(colors[currentColorIndex]);
}

export function disposeLobbyScene() {
    scene.remove(car);
    renderer.dispose();
}
