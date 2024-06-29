import { createText } from './textCreator.js';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

let scene, camera, renderer, raycaster, mouse;
let menuItems = [];

export function initMenu() {
    console.log('Initializing menu');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('menu-container').appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    camera.position.z = 10;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    createMenuItems().then(() => {
        console.log('Menu items created');
        animate();
        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onClick, false);
    }).catch(error => {
        console.error('Error creating menu items:', error);
    });
}

async function createMenuItems() {
    try {
        console.log('Creating menu items');
        const createLobbyText = await createText('Create Lobby');
        createLobbyText.position.set(0, 2, 0);
        scene.add(createLobbyText);
        menuItems.push({ mesh: createLobbyText, action: 'createLobby' });

        const joinLobbyText = await createText('Join Lobby');
        joinLobbyText.position.set(0, -2, 0);
        scene.add(joinLobbyText);
        menuItems.push({ mesh: joinLobbyText, action: 'joinLobby' });

        console.log('Menu items added to scene');
    } catch (error) {
        console.error('Error in createMenuItems:', error);
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let item of menuItems) {
        if (intersects.find(intersect => intersect.object === item.mesh)) {
            item.mesh.material.color.setHex(0xff0000);
        } else {
            item.mesh.material.color.setHex(0xffffff);
        }
    }
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let item of menuItems) {
        if (intersects.find(intersect => intersect.object === item.mesh)) {
            handleMenuAction(item.action);
            break;
        }
    }
}

function handleMenuAction(action) {
    switch (action) {
        case 'createLobby':
            window.socket.emit('createLobby');
            break;
        case 'joinLobby':
            // Implement join lobby logic
            break;
    }
}

export async function showLobbyList(lobbies) {
    // Clear existing menu items
    for (let item of menuItems) {
        scene.remove(item.mesh);
    }
    menuItems = [];

    // Create lobby list
    for (let i = 0; i < lobbies.length; i++) {
        const lobby = lobbies[i];
        const lobbyText = await createText(`Join Lobby ${lobby.id}`);
        lobbyText.position.set(0, 2 - i, 0);
        scene.add(lobbyText);
        menuItems.push({ mesh: lobbyText, action: 'joinLobby', lobbyId: lobby.id });
    }

    // Add back button
    const backText = await createText('Back');
    backText.position.set(0, -3, 0);
    scene.add(backText);
    menuItems.push({ mesh: backText, action: 'back' });
}
