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

    // Hide menu and lobby containers, show game container
    document.getElementById('menu-container').style.display = 'none';
    document.getElementById('lobby-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // Add return to lobby button
    const returnToLobbyBtn = document.createElement('button');
    returnToLobbyBtn.textContent = 'Return to Lobby';
    returnToLobbyBtn.style.position = 'absolute';
    returnToLobbyBtn.style.top = '10px';
    returnToLobbyBtn.style.right = '10px';
    returnToLobbyBtn.style.padding = '10px 20px';
    returnToLobbyBtn.style.fontSize = '16px';
    returnToLobbyBtn.addEventListener('click', returnToLobby);
    document.getElementById('game-container').appendChild(returnToLobbyBtn);
}

function returnToLobby() {
    // Hide game container, show lobby container
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('lobby-container').style.display = 'block';

    // Clean up game resources
    // (You might need to implement these functions)
    disposeThreeJS();
    disposeUI();
    disposeCutScene();

    // Reinitialize lobby
    showLobby(lobbyId);
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
