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
document.body.appendChild(renderer.domElement);

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Create a racing track
const trackGeometry = new THREE.RingGeometry(8, 10, 32);
const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
const track = new THREE.Mesh(trackGeometry, trackMaterial);
track.rotation.x = -Math.PI / 2;
scene.add(track);

// Create text
const fontLoader = new THREE.FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    const textGeometry = new THREE.TextGeometry('Type to race!', {
        font: font,
        size: 0.5,
        height: 0.1,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-2, 2, 0);
    scene.add(textMesh);
});

function createCar(color) {
    const carGeometry = new THREE.BoxGeometry(0.5, 0.3, 1);
    const carMaterial = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh(carGeometry, carMaterial);
}

function updateCarPosition(car, progress) {
    const angle = (progress / 100) * Math.PI * 2;
    car.position.x = 9 * Math.cos(angle);
    car.position.z = 9 * Math.sin(angle);
    car.rotation.y = angle + Math.PI / 2;
}

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
            size: 0.5,
            height: 0.1,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.name = 'currentWord';
        textMesh.position.set(-2, 3, 0);
        scene.add(textMesh);
    });
}
