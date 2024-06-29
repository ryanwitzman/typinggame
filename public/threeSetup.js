import { THREE } from './threeImport.js';
import { createCar, updateCarPosition } from './car.js';
import { initCutScene, playCutScene } from './cutScene.js';

let scene, camera, renderer;
let cars = new Map();

export { cars, scene, camera, renderer };

export function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('three-container').appendChild(renderer.domElement);

    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);

    createTrack();
    addLighting();

    window.addEventListener('resize', onWindowResize, false);
    
    initCutScene();

    // Create a car for the local player
    createPlayerCar('localPlayer');

    // Start the animation loop
    animate();
}

function createTrack() {
    const trackGeometry = new THREE.PlaneGeometry(100, 20);
    const trackTexture = new THREE.TextureLoader().load('road_texture.jpg');
    trackTexture.wrapS = THREE.RepeatWrapping;
    trackTexture.wrapT = THREE.RepeatWrapping;
    trackTexture.repeat.set(10, 1);
    const trackMaterial = new THREE.MeshStandardMaterial({ map: trackTexture });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    // Add grass
    const grassGeometry = new THREE.PlaneGeometry(200, 200);
    const grassTexture = new THREE.TextureLoader().load('grass_texture.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20);
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    scene.add(grass);

    // Add finish line
    const finishLineGeometry = new THREE.PlaneGeometry(1, 20);
    const finishLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(50, 0.01, 0); // Position at the end of the track
    scene.add(finishLine);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
}

export function animate() {
    requestAnimationFrame(animate);
    cars.forEach((car) => {
        if (car.progress !== undefined) {
            updateCarPosition(car, car.progress);
        }
    });
    renderer.render(scene, camera);
}

export function createPlayerCar(playerId) {
    // Remove existing car if it exists
    if (cars.has(playerId)) {
        const existingCar = cars.get(playerId);
        scene.remove(existingCar);
        cars.delete(playerId);
    }

    const carColor = Math.random() * 0xffffff;
    const car = createCar(carColor);
    car.scale.set(0.5, 0.5, 0.5); // Scale down the car to fit the scene better
    car.position.set(-45, 0.5, 0); // Start position
    car.progress = 0;
    cars.set(playerId, car);
    scene.add(car);
    console.log(`Car created for player ${playerId}`);
}

export function updateCarProgress(playerId, progress) {
    const car = cars.get(playerId);
    if (car) {
        car.progress = progress;
        updateCarPosition(car, progress);
        console.log(`Car updated for player ${playerId}, progress: ${progress}`);

        // Check if the car has reached the finish line
        if (progress >= 100) {
            playCutScene(car);
        }
    } else {
        console.log(`Car not found for player ${playerId}`);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

