import { initMenu, showLobbyList, hideMenu, showMenu } from './menu.js';
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
    hideMenu();
    showLobby(lobbyId);
});

socket.on('lobbyList', (lobbies) => {
    showLobbyList(lobbies);
});

socket.on('joinedLobby', (lobbyId) => {
    console.log(`Joined lobby with ID: ${lobbyId}`);
    hideMenu();
    showLobby(lobbyId);
});

socket.on('lobbyUpdate', (lobbyData) => {
    updateLobby(lobbyData);
});

socket.on('gameStarted', (gameState) => {
    currentState = 'game';
    hideLobby();
    initGame(gameState);
});

export function startGame() {
    socket.emit('startGame');
}

export function leaveLobby() {
    hideLobby();
    showMenu();
    socket.emit('leaveLobby');
}
