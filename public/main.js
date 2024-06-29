import { initThreeJS, animate } from './threeSetup.js';
import { updateCarPosition } from './car.js';
import { updatePlayers, updatePlayerProgress, calculateProgress } from './gameState.js';
import { updatePlayersDisplay, updateParagraphDisplay } from './ui.js';

const socket = io();

const typingInput = document.getElementById('typing-input');
let currentParagraph = '';
let players = new Map();
let cars = new Map();

initThreeJS();
animate();

socket.on('gameState', ({ players: serverPlayers, paragraph }) => {
    currentParagraph = paragraph;
    updatePlayers(serverPlayers, players, cars);
    updateParagraphDisplay(currentParagraph);
});

socket.on('newRound', ({ paragraph, players: serverPlayers }) => {
    currentParagraph = paragraph;
    typingInput.value = '';
    updatePlayers(serverPlayers, players, cars);
    updateParagraphDisplay(currentParagraph);
});

socket.on('playerProgress', ({ id, progress }) => {
    updatePlayerProgress(id, progress, players);
});

socket.on('playerDisconnected', (id) => {
    players.delete(id);
    const car = cars.get(id);
    if (car) {
        scene.remove(car);
        cars.delete(id);
    }
    updatePlayersDisplay(players);
});

typingInput.addEventListener('input', () => {
    const progress = calculateProgress(typingInput.value, currentParagraph);
    socket.emit('typingProgress', progress);
});

export { players, cars };