import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export function createText(text) {
    console.log('Creating text:', text);
    const loader = new THREE.FontLoader();
    return new Promise((resolve, reject) => {
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            try {
                const geometry = new THREE.TextGeometry(text, {
                    font: font,
                    size: 0.5,
                    height: 0.1,
                    curveSegments: 12,
                    bevelEnabled: false,
                });
                const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
                const mesh = new THREE.Mesh(geometry, material);
                console.log('Text created successfully');
                resolve(mesh);
            } catch (error) {
                console.error('Error creating text:', error);
                reject(error);
            }
        }, undefined, (error) => {
            console.error('Error loading font:', error);
            reject(error);
        });
    });
}
