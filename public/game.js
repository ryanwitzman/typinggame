import { updateParagraphDisplay, handleUserInput, getProgress, setSocket, initUI } from './ui.js';
import { initThreeJS, animate, createPlayerCar, updateCarProgress, cars } from './threeSetup.js';
import { initCutScene } from './cutScene.js';
import { disposeLobbyScene } from './lobbyScene.js';

let players = new Map();

export function initGame(gameState, socket) {
    setSocket(socket);
    players = new Map(gameState.players.map(p => [p.id, p]));

    disposeLobbyScene();
    initThreeJS();
    animate();
    initUI();
    initCutScene();

    updateParagraphDisplay(gameState.paragraph);
    players.forEach((player, id) => createOrUpdateCar(id));

    setupEventListeners(socket);
}

function setupEventListeners(socket) {
    socket.on('playerProgress', ({ id, progress }) => {
        if (players.has(id)) {
            players.get(id).progress = progress;
            updateCarProgress(id, progress);
        }
    });

    socket.on('playerDisconnected', (id) => {
        players.delete(id);
        // Remove car from scene
    });

    document.addEventListener('keydown', (event) => {
        handleUserInput(event);
        const progress = getProgress();
        socket.emit('typingProgress', progress);
        updateCarProgress(socket.id, progress);
    });
}

function createOrUpdateCar(playerId) {
    if (!cars.has(playerId)) {
        createPlayerCar(playerId);
    }
    const player = players.get(playerId);
    if (player) {
        updateCarProgress(playerId, player.progress);
    }
}

export { players };
