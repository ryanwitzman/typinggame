import { updateParagraphDisplay, handleUserInput, getProgress, setSocket, initUI } from './ui.js';
import { initThreeJS, animate, createPlayerCar, updateCarProgress } from './threeSetup.js';

const socket = io();
setSocket(socket);

let players = new Map();
let cars = new Map();

initThreeJS();
animate();
initUI();

function createOrUpdateCar(playerId) {
    if (!cars.has(playerId)) {
        createPlayerCar(playerId);
    }
    updateCarProgress(playerId, players.get(playerId).progress);
}

socket.on('gameState', ({ players: serverPlayers, paragraph }) => {
    players = new Map(serverPlayers.map(p => [p.id, p]));
    updateParagraphDisplay(paragraph);
    players.forEach((player, id) => createOrUpdateCar(id));
});

socket.on('newRound', ({ paragraph, players: serverPlayers }) => {
    players = new Map(serverPlayers.map(p => [p.id, p]));
    updateParagraphDisplay(paragraph);
    players.forEach((player, id) => createOrUpdateCar(id));
});

socket.on('playerProgress', ({ id, progress }) => {
    if (players.has(id)) {
        players.get(id).progress = progress;
        updateCarProgress(id, progress);
    }
});

socket.on('playerDisconnected', (id) => {
    players.delete(id);
});

document.addEventListener('keydown', (event) => {
    handleUserInput(event);
    const progress = getProgress();
    socket.emit('typingProgress', progress);
    updateCarProgress(socket.id, progress);
});

function updatePlayers(serverPlayers) {
    players = new Map(serverPlayers.map(p => [p.id, p]));
}

export { players };
