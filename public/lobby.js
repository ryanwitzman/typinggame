import { startGame } from './main.js';
import { initLobbyScene, disposeLobbyScene } from './lobbyScene.js';

let lobbyId;
let players = [];

export function showLobby(id) {
    lobbyId = id;
    const menuContainer = document.getElementById('menu-container');
    const lobbyContainer = document.getElementById('lobby-container');
    
    menuContainer.style.display = 'none';
    lobbyContainer.style.display = 'block';
    
    initLobbyScene();
    updateLobbyDisplay();
}

export function updateLobby(lobbyData) {
    players = lobbyData.players;
    updateLobbyDisplay();
}

function updateLobbyDisplay() {
    const uiContainer = document.createElement('div');
    uiContainer.id = 'lobby-ui';
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.innerHTML = `
        <h2>Lobby ${lobbyId}</h2>
        <h3>Players:</h3>
        <ul>
            ${players.map(player => `<li>${player}</li>`).join('')}
        </ul>
        <button id="start-game-btn">Start Game</button>
        <p>Press 'C' to change car color</p>
    `;

    const existingUI = document.getElementById('lobby-ui');
    if (existingUI) {
        existingUI.remove();
    }
    document.getElementById('lobby-container').appendChild(uiContainer);

    document.getElementById('start-game-btn').addEventListener('click', () => {
        startGame();
    });
}

export function hideLobby() {
    const menuContainer = document.getElementById('menu-container');
    const lobbyContainer = document.getElementById('lobby-container');
    
    menuContainer.style.display = 'block';
    lobbyContainer.style.display = 'none';
    
    disposeLobbyScene();
}
