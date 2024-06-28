const socket = io();

const wordDisplay = document.getElementById('word-display');
const typingInput = document.getElementById('typing-input');
const playersContainer = document.getElementById('players-container');

let currentWord = '';
let players = new Map();

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

socket.on('gameState', ({ players: serverPlayers, currentWord: serverWord }) => {
    currentWord = serverWord;
    wordDisplay.textContent = currentWord;
    updatePlayers(serverPlayers);
});

socket.on('newRound', ({ currentWord: newWord, players: serverPlayers }) => {
    currentWord = newWord;
    wordDisplay.textContent = currentWord;
    typingInput.value = '';
    updatePlayers(serverPlayers);
});

socket.on('playerProgress', ({ id, progress }) => {
    updatePlayerProgress(id, progress);
});

socket.on('playerDisconnected', (id) => {
    players.delete(id);
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
    players = new Map(serverPlayers.map(player => [player.id, player]));
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
