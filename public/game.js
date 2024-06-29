import { updateParagraphDisplay, handleUserInput, getProgress, setSocket, initUI } from './ui.js';
import { initThreeJS, animate, createPlayerCar, updateCarProgress } from './threeSetup.js';
import { initCutScene } from './cutScene.js';
import { disposeLobbyScene } from './lobbyScene.js';

let players = new Map();
let cars = new Map();

export function initGame(gameState) {
    setSocket(window.socket);
    players = new Map(gameState.players.map(p => [p.id, p]));

    disposeLobbyScene();
    initThreeJS();
    animate();
    initUI();
    initCutScene();

    updateParagraphDisplay(gameState.paragraph);
    players.forEach((player, id) => createOrUpdateCar(id));

    setupEventListeners();
}

function createOrUpdateCar(playerId) {
    if (!cars.has(playerId)) {
        createPlayerCar(playerId);
    }
    updateCarProgress(playerId, players.get(playerId).progress);
}

function setupEventListeners() {
    window.socket.on('playerProgress', ({ id, progress }) => {
        if (players.has(id)) {
            players.get(id).progress = progress;
            updateCarProgress(id, progress);
        }
    });

    window.socket.on('playerDisconnected', (id) => {
        players.delete(id);
        // Remove car from scene
    });

    document.addEventListener('keydown', (event) => {
        handleUserInput(event);
        const progress = getProgress();
        window.socket.emit('typingProgress', progress);
        updateCarProgress(window.socket.id, progress);
    });
}

export { players };
