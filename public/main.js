import { initMenu } from './menu.js';
import { initGame } from './game.js';

const socket = io();
window.socket = socket;

let currentState = 'menu';

initMenu();

socket.on('lobbyCreated', (lobbyId) => {
    console.log(`Lobby created with ID: ${lobbyId}`);
    // Implement lobby waiting room
});

socket.on('lobbyList', (lobbies) => {
    showLobbyList(lobbies);
});

socket.on('joinedLobby', (lobbyId) => {
    console.log(`Joined lobby with ID: ${lobbyId}`);
    // Implement lobby waiting room
});

socket.on('gameStarted', (gameState) => {
    currentState = 'game';
    initGame(gameState);
});

export function startGame() {
    socket.emit('startGame');
}