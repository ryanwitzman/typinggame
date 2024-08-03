import { THREE } from './threeImport.js';
let scene, camera, renderer, car;
let createLobbyButton, joinLobbyButton;

export function initMenu() {
    console.log('Initializing menu');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('menu-container').appendChild(renderer.domElement);

    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add background
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('background_texture.jpg');
    scene.background = bgTexture;

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

    // Add buttons
    createMenuButtons();

    animate();
    window.addEventListener('resize', onWindowResize, false);
}

function createMenuButtons() {
    const buttonStyle = `
        position: absolute;
        padding: 10px 20px;
        font-size: 18px;
        color: white;
        background-color: #4CAF50;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    `;

    createLobbyButton = document.createElement('button');
    createLobbyButton.textContent = 'Create Lobby';
    createLobbyButton.style.cssText = buttonStyle;
    createLobbyButton.style.left = '20px';
    createLobbyButton.style.top = '20px';
    createLobbyButton.addEventListener('click', () => handleMenuAction('createLobby'));
    createLobbyButton.addEventListener('mouseover', () => createLobbyButton.style.backgroundColor = '#45a049');
    createLobbyButton.addEventListener('mouseout', () => createLobbyButton.style.backgroundColor = '#4CAF50');
    document.body.appendChild(createLobbyButton);

    joinLobbyButton = document.createElement('button');
    joinLobbyButton.textContent = 'Join Lobby';
    joinLobbyButton.style.cssText = buttonStyle;
    joinLobbyButton.style.left = '20px';
    joinLobbyButton.style.top = '80px';
    joinLobbyButton.addEventListener('click', () => handleMenuAction('joinLobby'));
    joinLobbyButton.addEventListener('mouseover', () => joinLobbyButton.style.backgroundColor = '#45a049');
    joinLobbyButton.addEventListener('mouseout', () => joinLobbyButton.style.backgroundColor = '#4CAF50');
    document.body.appendChild(joinLobbyButton);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the car
    car.rotation.y += 0.01;
    
    // Make the car bounce
    car.position.y = Math.sin(Date.now() * 0.003) * 0.1 + 0.5;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleMenuAction(action, lobbyId) {
    switch (action) {
        case 'createLobby':
            window.socket.emit('createLobby');
            break;
        case 'joinLobby':
            window.socket.emit('getLobbyList');
            break;
    }
}

export function showLobbyList(lobbies) {
    // Remove existing buttons
    document.body.removeChild(createLobbyButton);
    document.body.removeChild(joinLobbyButton);

    // Create lobby list
    const lobbyList = document.createElement('div');
    lobbyList.style.position = 'absolute';
    lobbyList.style.left = '20px';
    lobbyList.style.top = '20px';
    lobbyList.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    lobbyList.style.padding = '10px';

    lobbies.forEach(lobby => {
        const lobbyButton = document.createElement('button');
        lobbyButton.textContent = `Join Lobby ${lobby}`;
        lobbyButton.addEventListener('click', () => {
            window.socket.emit('joinLobby', lobby);
            document.body.removeChild(lobbyList);
        });
        lobbyList.appendChild(lobbyButton);
        lobbyList.appendChild(document.createElement('br'));
    });

    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => {
        document.body.removeChild(lobbyList);
        createMenuButtons();
    });
    lobbyList.appendChild(backButton);

    document.body.appendChild(lobbyList);
}

export function hideMenu() {
    document.getElementById('menu-container').style.display = 'none';
    if (createLobbyButton) document.body.removeChild(createLobbyButton);
    if (joinLobbyButton) document.body.removeChild(joinLobbyButton);
}

export function showMenu() {
    document.getElementById('menu-container').style.display = 'block';
    document.getElementById('lobby-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    createMenuButtons();
}
