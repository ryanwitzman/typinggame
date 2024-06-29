import { startGame } from './main.js';
import { initLobbyScene, disposeLobbyScene, updatePlayerCars } from './lobbyScene.js';

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
    initChat();
    
    // Add event listener for the 'C' key to change car color
    document.addEventListener('keydown', (event) => {
        if (event.key === 'c' || event.key === 'C') {
            window.socket.emit('changeCarColor', lobbyId);
        }
    });
}

export function updateLobby(lobbyData) {
    players = lobbyData.players;
    updateLobbyDisplay();
    updatePlayerCars(players);
}

function updateLobbyDisplay() {
    const uiContainer = document.createElement('div');
    uiContainer.id = 'lobby-ui';
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    uiContainer.style.padding = '20px';
    uiContainer.style.borderRadius = '10px';
    uiContainer.innerHTML = `
        <h2>Lobby ${lobbyId}</h2>
        <h3>Players:</h3>
        <ul>
            ${players.map(player => `<li>${player}</li>`).join('')}
        </ul>
        <button id="start-game-btn" style="padding: 10px 20px; font-size: 16px; margin-top: 10px;">Start Game</button>
        <p>Press 'C' to change car color</p>
        <div id="chat-container" style="margin-top: 20px;">
            <div id="chat-messages" style="height: 150px; overflow-y: auto; border: 1px solid white; padding: 10px; margin-bottom: 10px;"></div>
            <input type="text" id="chat-input" placeholder="Type your message..." style="width: 70%; padding: 5px;">
            <button id="chat-send" style="padding: 5px 10px;">Send</button>
        </div>
    `;

    const existingUI = document.getElementById('lobby-ui');
    if (existingUI) {
        existingUI.remove();
    }
    document.getElementById('lobby-container').appendChild(uiContainer);

    document.getElementById('start-game-btn').addEventListener('click', () => {
        startGame(lobbyId);
    });
}

function initChat() {
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    window.socket.on('lobbyMessage', (data) => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${data.sender}: ${data.message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    window.socket.emit('joinLobbyChat', lobbyId);
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (message) {
        window.socket.emit('lobbyMessage', { lobbyId, message });
        chatInput.value = '';
    }
}

export function hideLobby() {
    const menuContainer = document.getElementById('menu-container');
    const lobbyContainer = document.getElementById('lobby-container');
    
    menuContainer.style.display = 'block';
    lobbyContainer.style.display = 'none';
    
    disposeLobbyScene();
    window.socket.emit('leaveLobbyChat', lobbyId);
}
