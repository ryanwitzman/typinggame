import { createCar, updateCarPosition } from './car.js';

let scene, camera, renderer;
let cars = new Map();

export { cars };

export function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('three-container').appendChild(renderer.domElement);

    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);

    createTrack();
    addLighting();
}

function createTrack() {
    const trackGeometry = new THREE.PlaneGeometry(100, 10);
    const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
}

export function animate() {
    requestAnimationFrame(animate);
    cars.forEach((car, id) => {
        updateCarPosition(car, car.progress);
    });
    renderer.render(scene, camera);
}

export function createPlayerCar(playerId) {
    const car = createCar();
    cars.set(playerId, car);
    scene.add(car);
}

export function updateCarProgress(playerId, progress) {
    const car = cars.get(playerId);
    if (car) {
        car.progress = progress;
    }
}

export { scene };
