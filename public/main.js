import { initMenu, showLobbyList } from './menu.js';
import { initGame } from './game.js';
import { showLobby, updateLobby, hideLobby } from './lobby.js';

const socket = io();
window.socket = socket;

let currentState = 'menu';

initMenu();

export function getLobbyList() {
    socket.emit('getLobbyList');
}

socket.on('lobbyCreated', (lobbyId) => {
    console.log(`Lobby created with ID: ${lobbyId}`);
    showLobby(lobbyId);
});

socket.on('lobbyList', async (lobbies) => {
    await showLobbyList(lobbies);
});

socket.on('joinedLobby', (lobbyId) => {
    console.log(`Joined lobby with ID: ${lobbyId}`);
    showLobby(lobbyId);
});

socket.on('lobbyUpdate', (lobbyData) => {
    updateLobby(lobbyData);
});

socket.on('gameStarted', (gameState) => {
    currentState = 'game';
    initGame(gameState);
});

export function startGame() {
    socket.emit('startGame');
}
