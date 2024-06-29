import { updatePlayersDisplay, updateParagraphDisplay, handleUserInput, getProgress } from './ui.js';

const socket = io();

let players = new Map();

socket.on('gameState', ({ players: serverPlayers, paragraph }) => {
    updatePlayers(serverPlayers);
    updateParagraphDisplay(paragraph);
});

socket.on('newRound', ({ paragraph, players: serverPlayers }) => {
    updatePlayers(serverPlayers);
    updateParagraphDisplay(paragraph);
});

socket.on('playerProgress', ({ id, progress }) => {
    if (players.has(id)) {
        players.get(id).progress = progress;
        updatePlayersDisplay(players);
    }
});

socket.on('playerDisconnected', (id) => {
    players.delete(id);
    updatePlayersDisplay(players);
});

document.addEventListener('keydown', (event) => {
    handleUserInput(event);
    const progress = getProgress();
    socket.emit('typingProgress', progress);
});

function updatePlayers(serverPlayers) {
    players = new Map(Object.entries(serverPlayers));
    updatePlayersDisplay(players);
}

export { players };
