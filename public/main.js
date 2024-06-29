import { updateParagraphDisplay, handleUserInput, getProgress } from './ui.js';

const socket = io();

let players = new Map();

socket.on('gameState', ({ players: serverPlayers, paragraph }) => {
    players = new Map(serverPlayers.map(p => [p.id, p]));
    updateParagraphDisplay(paragraph);
});

socket.on('newRound', ({ paragraph, players: serverPlayers }) => {
    players = new Map(serverPlayers.map(p => [p.id, p]));
    updateParagraphDisplay(paragraph);
});

socket.on('playerProgress', ({ id, progress }) => {
    if (players.has(id)) {
        players.get(id).progress = progress;
    }
});

socket.on('playerDisconnected', (id) => {
    players.delete(id);
});

document.addEventListener('keydown', (event) => {
    handleUserInput(event);
    const progress = getProgress();
    socket.emit('typingProgress', progress);
});

function updatePlayers(serverPlayers) {
    players = new Map(serverPlayers.map(p => [p.id, p]));
}

export { players };
