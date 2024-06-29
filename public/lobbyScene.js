import { THREE } from './threeImport.js';
import { createCar } from './car.js';

let scene, camera, renderer;
const cars = new Map();
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
    const grassGeometry = new THREE.PlaneGeometry(20, 10);
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    scene.add(grass);

    // Set up camera
    camera.position.set(0, 5, 10);
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
    cars.forEach((car) => {
        car.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
}

function changeCarColor() {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    const playerCar = cars.get(window.socket.id);
    if (playerCar) {
        playerCar.children[0].material.color.setStyle(colors[currentColorIndex]);
    }
}

export function updatePlayerCars(players) {
    // Remove cars that are no longer in the lobby
    cars.forEach((car, id) => {
        if (!players.includes(id)) {
            scene.remove(car);
            cars.delete(id);
        }
    });

    // Add or update cars for each player
    players.forEach((playerId, index) => {
        if (!cars.has(playerId)) {
            const car = createCar(colors[index % colors.length]);
            car.scale.set(0.5, 0.5, 0.5);
            scene.add(car);
            cars.set(playerId, car);
        }
        
        // Position cars side by side
        const car = cars.get(playerId);
        car.position.set((index - (players.length - 1) / 2) * 2.5, 0.5, 0);
    });
}

export function disposeLobbyScene() {
    cars.forEach((car) => scene.remove(car));
    cars.clear();
    renderer.dispose();
}
