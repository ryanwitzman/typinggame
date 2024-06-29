import { THREE } from './threeImport.js';
import { createCar, updateCarPosition } from './car.js';
import { createColorSelector, getSelectedColor } from './colorSelector.js';

let scene, camera, renderer;
let car;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

export function initLobbyScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const lobbyContainer = document.getElementById('lobby-container');
    lobbyContainer.appendChild(renderer.domElement);

    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    createTrack();
    addLighting();
    createPlayerCar();

    createColorSelector(lobbyContainer);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);

    animate();
}

function createTrack() {
    const trackGeometry = new THREE.PlaneGeometry(20, 20);
    const trackTexture = new THREE.TextureLoader().load('road_texture.jpg');
    trackTexture.wrapS = THREE.RepeatWrapping;
    trackTexture.wrapT = THREE.RepeatWrapping;
    trackTexture.repeat.set(2, 2);
    const trackMaterial = new THREE.MeshStandardMaterial({ map: trackTexture });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    const grassGeometry = new THREE.PlaneGeometry(100, 100);
    const grassTexture = new THREE.TextureLoader().load('grass_texture.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    scene.add(grass);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
}

function createPlayerCar() {
    car = createCar(getSelectedColor());
    car.scale.set(0.5, 0.5, 0.5);
    car.position.set(0, 0.5, 0);
    scene.add(car);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    car.rotation.y += deltaMove.x * 0.01;

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isDragging = false;
}

export function updatePlayerCars(players) {
    // In this version, we're only dealing with a single car
    // You may want to adjust this function based on your multiplayer needs
}

export function disposeLobbyScene() {
    scene.remove(car);
    renderer.dispose();
}
