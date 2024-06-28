const socket = io();

const typingInput = document.getElementById('typing-input');
const playersContainer = document.getElementById('players-container');

let currentWord = '';
let players = new Map();
let cars = new Map();

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Create a straight racing track
const trackGeometry = new THREE.PlaneGeometry(100, 10);
const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const track = new THREE.Mesh(trackGeometry, trackMaterial);
track.rotation.x = -Math.PI / 2;
scene.add(track);

// Create text
const fontLoader = new THREE.FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    const textGeometry = new THREE.TextGeometry('Type to race!', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-10, 5, -5);
    scene.add(textMesh);
});

function createCar(color) {
    const carGroup = new THREE.Group();

    // Car body
    const carShape = new THREE.Shape();
    carShape.moveTo(0, 0.4);
    carShape.lineTo(0.2, 0.6);
    carShape.lineTo(0.8, 0.6);
    carShape.lineTo(1, 0.4);
    carShape.lineTo(1, 0.2);
    carShape.lineTo(0, 0.2);
    carShape.lineTo(0, 0.4);

    const extrudeSettings = {
        steps: 2,
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 1
    };

    const carGeometry = new THREE.ExtrudeGeometry(carShape, extrudeSettings);
    const carMaterial = new THREE.MeshPhongMaterial({ color: color });
    const carBody = new THREE.Mesh(carGeometry, carMaterial);
    carGroup.add(carBody);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const wheelPositions = [
        [0.2, 0, 0.3],
        [0.2, 0, -0.3],
        [0.8, 0, 0.3],
        [0.8, 0, -0.3]
    ];

    wheelPositions.forEach(position => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...position);
        wheel.rotation.z = Math.PI / 2;
        carGroup.add(wheel);
    });

    carGroup.scale.set(2, 2, 2);
    return carGroup;
}

function updateCarPosition(car, progress) {
    car.position.x = (progress / 100) * 90 - 45;
    car.position.y = 0.5;
    car.rotation.y = -Math.PI / 2;

    // Rotate wheels
    const wheelRotation = (progress / 100) * Math.PI * 20; // 10 full rotations over the course
    car.children.forEach((child, index) => {
        if (index > 0) { // Skip the first child (car body)
            child.rotation.y = wheelRotation;
        }
    });
}

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// Update camera position
camera.position.set(0, 20, 30);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    players.forEach((player, id) => {
        const car = cars.get(id);
        if (car) {
            updateCarPosition(car, player.progress);
        }
    });
    renderer.render(scene, camera);
}
animate();

socket.on('gameState', ({ players: serverPlayers, currentWord: serverWord }) => {
    currentWord = serverWord;
    updatePlayers(serverPlayers);
    updateWordDisplay();
});

socket.on('newRound', ({ currentWord: newWord, players: serverPlayers }) => {
    currentWord = newWord;
    typingInput.value = '';
    updatePlayers(serverPlayers);
    updateWordDisplay();
});

socket.on('playerProgress', ({ id, progress }) => {
    updatePlayerProgress(id, progress);
});

socket.on('playerDisconnected', (id) => {
    players.delete(id);
    const car = cars.get(id);
    if (car) {
        scene.remove(car);
        cars.delete(id);
    }
    updatePlayersDisplay();
});

typingInput.addEventListener('input', () => {
    const progress = calculateProgress(typingInput.value, currentWord);
    socket.emit('typingProgress', progress);
});

function calculateProgress(typed, target) {
    let correct = 0;
    for (let i = 0; i < typed.length && i < target.length; i++) {
        if (typed[i] === target[i]) correct++;
    }
    return (correct / target.length) * 100;
}

function updatePlayers(serverPlayers) {
    serverPlayers.forEach(player => {
        if (!players.has(player.id)) {
            const car = createCar(Math.random() * 0xffffff);
            scene.add(car);
            cars.set(player.id, car);
        }
        players.set(player.id, player);
    });
    updatePlayersDisplay();
}

function updatePlayerProgress(id, progress) {
    const player = players.get(id);
    if (player) {
        player.progress = progress;
        updatePlayersDisplay();
    }
}

function updatePlayersDisplay() {
    playersContainer.innerHTML = '';
    players.forEach((player, id) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player';
        playerElement.innerHTML = `
            <div>Player ${id.substr(0, 4)}</div>
            <div class="progress-bar">
                <div class="progress" style="width: ${player.progress}%"></div>
            </div>
        `;
        playersContainer.appendChild(playerElement);
    });
}

function updateWordDisplay() {
    const existingText = scene.getObjectByName('currentWord');
    if (existingText) {
        scene.remove(existingText);
    }

    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new THREE.TextGeometry(currentWord, {
            font: font,
            size: 2,
            height: 0.2,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.name = 'currentWord';
        textMesh.position.set(-10, 5, -5);
        scene.add(textMesh);
    });
}
