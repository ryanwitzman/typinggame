import { THREE } from './threeImport.js';
let scene, camera, renderer, car;

export function initMenu() {
    console.log('Initializing menu');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const menuContainer = document.getElementById('menu-container');
    menuContainer.appendChild(renderer.domElement);

    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    addLighting();
    createTrack();
    createPlayerCar();

    animate();
    window.addEventListener('resize', onWindowResize, false);

    createMenuHTML();
}

function createMenuHTML() {
    const uiContainer = document.createElement('div');
    uiContainer.id = 'menu-ui';
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '50%';
    uiContainer.style.left = '50%';
    uiContainer.style.transform = 'translate(-50%, -50%)';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    uiContainer.style.padding = '20px';
    uiContainer.style.borderRadius = '10px';
    uiContainer.style.textAlign = 'center';

    uiContainer.innerHTML = `
        <h1 style="margin-bottom: 20px;">Racing Game</h1>
        <button class="menu-button" onclick="handleMenuAction('createLobby')">Create Lobby</button>
        <button class="menu-button" onclick="handleMenuAction('joinPublicLobby')">Join Public Lobby</button>
        <div style="margin: 10px 0;">
            <input type="text" id="privateLobbyCode" placeholder="Enter private lobby code" style="padding: 5px; margin-right: 5px;">
            <button class="menu-button" onclick="handleMenuAction('joinPrivateLobby')">Join Private Lobby</button>
        </div>
        <button class="menu-button" onclick="handleMenuAction('showLeaderboard')">Leaderboard</button>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .menu-button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .menu-button:hover {
            background-color: #45a049;
        }
    `;

    document.head.appendChild(style);
    document.getElementById('menu-container').appendChild(uiContainer);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
}

function createTrack() {
    const trackGeometry = new THREE.PlaneGeometry(20, 20);
    const trackTexture = new THREE.TextureLoader().load('road_texture.jpg');
    trackTexture.wrapS = THREE.RepeatWrapping;
    trackTexture.wrapT = THREE.RepeatWrapping;
    trackTexture.repeat.set(2, 2);
    const trackMaterial = new THREE.MeshStandardMaterial({ map: trackTexture });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    const grassGeometry = new THREE.PlaneGeometry(100, 100);
    const grassTexture = new THREE.TextureLoader().load('grass_texture.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    scene.add(grass);
}

function createPlayerCar() {
    car = createCar(0x1a75ff);
    car.scale.set(0.5, 0.5, 0.5);
    car.position.set(0, 0.5, 0);
    scene.add(car);
}

window.handleMenuAction = function(action) {
    switch (action) {
        case 'createLobby':
            window.socket.emit('createLobby');
            break;
        case 'joinPublicLobby':
            window.socket.emit('getLobbyList');
            break;
        case 'joinPrivateLobby':
            const code = document.getElementById('privateLobbyCode').value;
            window.socket.emit('joinLobby', code);
            break;
        case 'showLeaderboard':
            showLeaderboard();
            break;
    }
}

export function showLobbyList(lobbies) {
    const uiContainer = document.getElementById('menu-ui');
    let lobbyListHTML = '<h2 style="margin-bottom: 20px;">Available Lobbies</h2><ul style="list-style-type: none; padding: 0;">';
    lobbies.forEach(lobby => {
        lobbyListHTML += `<li style="margin-bottom: 10px;"><button class="menu-button" onclick="window.socket.emit('joinLobby', '${lobby}')">Join Lobby ${lobby}</button></li>`;
    });
    lobbyListHTML += '</ul><button class="menu-button" onclick="createMenuHTML()">Back</button>';
    uiContainer.innerHTML = lobbyListHTML;
}

function showLeaderboard() {
    window.socket.emit('getLeaderboard');
}

export function displayLeaderboard(leaderboardData) {
    const uiContainer = document.getElementById('menu-ui');
    let leaderboardHTML = '<h2 style="margin-bottom: 20px;">Leaderboard</h2>';
    leaderboardHTML += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;"><tr><th>Player</th><th>Games Played</th><th>Top Speed</th><th>Daily Games</th></tr>';
    leaderboardData.forEach(player => {
        leaderboardHTML += `<tr><td>${player.name}</td><td>${player.gamesPlayed}</td><td>${player.topSpeed}</td><td>${player.dailyGames}</td></tr>`;
    });
    leaderboardHTML += '</table><button class="menu-button" onclick="createMenuHTML()">Back</button>';
    uiContainer.innerHTML = leaderboardHTML;

    const style = document.createElement('style');
    style.textContent = `
        #menu-ui table {
            color: white;
        }
        #menu-ui th, #menu-ui td {
            padding: 10px;
            border: 1px solid white;
        }
    `;
    document.head.appendChild(style);
}

export function hideMenu() {
    document.getElementById('menu-container').style.display = 'none';
}

export function showMenu() {
    document.getElementById('menu-container').style.display = 'block';
    document.getElementById('lobby-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    createMenuHTML();
}
