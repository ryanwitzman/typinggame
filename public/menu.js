import { THREE } from './threeImport.js';
let scene, camera, renderer, car;

export function initMenu() {
    console.log('Initializing menu');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);  // Smaller render size
    document.getElementById('car-container').appendChild(renderer.domElement);

    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add car
    const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
    const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeometry, carMaterial);
    scene.add(car);

    // Add ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.25;
    scene.add(ground);

    animate();
    window.addEventListener('resize', onWindowResize, false);

    createMenuHTML();
}

function createMenuHTML() {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = `
        <h1>Racing Game</h1>
        <button onclick="handleMenuAction('createLobby')">Create Lobby</button>
        <button onclick="handleMenuAction('joinPublicLobby')">Join Public Lobby</button>
        <div>
            <input type="text" id="privateLobbyCode" placeholder="Enter private lobby code">
            <button onclick="handleMenuAction('joinPrivateLobby')">Join Private Lobby</button>
        </div>
        <button onclick="handleMenuAction('showLeaderboard')">Leaderboard</button>
    `;
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
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
    const menuContainer = document.getElementById('menu-container');
    let lobbyListHTML = '<h2>Available Lobbies</h2><ul>';
    lobbies.forEach(lobby => {
        lobbyListHTML += `<li><button onclick="window.socket.emit('joinLobby', '${lobby}')">Join Lobby ${lobby}</button></li>`;
    });
    lobbyListHTML += '</ul><button onclick="createMenuHTML()">Back</button>';
    menuContainer.innerHTML = lobbyListHTML;
}

function showLeaderboard() {
    window.socket.emit('getLeaderboard');
}

export function displayLeaderboard(leaderboardData) {
    const menuContainer = document.getElementById('menu-container');
    let leaderboardHTML = '<h2>Leaderboard</h2>';
    leaderboardHTML += '<table><tr><th>Player</th><th>Games Played</th><th>Top Speed</th><th>Daily Games</th></tr>';
    leaderboardData.forEach(player => {
        leaderboardHTML += `<tr><td>${player.name}</td><td>${player.gamesPlayed}</td><td>${player.topSpeed}</td><td>${player.dailyGames}</td></tr>`;
    });
    leaderboardHTML += '</table><button onclick="createMenuHTML()">Back</button>';
    menuContainer.innerHTML = leaderboardHTML;
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
