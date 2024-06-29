import { startGame } from './main.js';

let lobbyId;
let players = [];

export function showLobby(id) {
    lobbyId = id;
    const menuContainer = document.getElementById('menu-container');
    const lobbyContainer = document.getElementById('lobby-container');
    
    menuContainer.style.display = 'none';
    lobbyContainer.style.display = 'block';
    
    updateLobbyDisplay();
}

export function updateLobby(lobbyData) {
    players = lobbyData.players;
    updateLobbyDisplay();
}

function updateLobbyDisplay() {
    const lobbyContainer = document.getElementById('lobby-container');
    lobbyContainer.innerHTML = `
        <h2>Lobby ${lobbyId}</h2>
        <h3>Players:</h3>
        <ul>
            ${players.map(player => `<li>${player}</li>`).join('')}
        </ul>
        <button id="start-game-btn">Start Game</button>
    `;

    document.getElementById('start-game-btn').addEventListener('click', () => {
        startGame();
    });
}

export function hideLobby() {
    const menuContainer = document.getElementById('menu-container');
    const lobbyContainer = document.getElementById('lobby-container');
    
    menuContainer.style.display = 'block';
    lobbyContainer.style.display = 'none';
}
