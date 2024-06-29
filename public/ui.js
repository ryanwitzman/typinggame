import { scene } from './threeSetup.js';

const playersContainer = document.getElementById('players-container');

export function updatePlayersDisplay(players) {
    playersContainer.innerHTML = '';
    players.forEach((player, id) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player';
        playerElement.innerHTML = `
            <div>Player ${id.substr(0, 4)}</div>
            <div class="progress-bar">
                <div class="progress" style="width: ${player.progress}%"></div>
            </div>
        `;
        playersContainer.appendChild(playerElement);
    });
}

export function updateParagraphDisplay(currentParagraph) {
    const existingText = scene.getObjectByName('currentParagraph');
    if (existingText) {
        scene.remove(existingText);
    }

    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const lines = wrapText(currentParagraph, 30);
        const textGroup = new THREE.Group();
        textGroup.name = 'currentParagraph';

        lines.forEach((line, index) => {
            const textGeometry = new THREE.TextGeometry(line, {
                font: font,
                size: 0.8,
                height: 0.1,
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            
            textGeometry.computeBoundingBox();
            const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            textMesh.position.set(-textWidth / 2, 10 - index * 1.2, -5);
            
            textGroup.add(textMesh);
        });
        
        scene.add(textGroup);
    });
}

function wrapText(text, maxCharsPerLine) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}