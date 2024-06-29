import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export function createCar(color = 0x1a75ff) {
    const carGroup = new THREE.Group();

    // Car body
    const carBodyGeometry = new THREE.BoxGeometry(4, 1, 2);
    const carBodyMaterial = new THREE.MeshPhongMaterial({ color: color });
    const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    carBody.position.y = 0.5;
    carGroup.add(carBody);

    // Car top
    const carTopGeometry = new THREE.BoxGeometry(2, 0.8, 1.8);
    const carTopMaterial = new THREE.MeshPhongMaterial({ color: color });
    const carTop = new THREE.Mesh(carTopGeometry, carTopMaterial);
    carTop.position.set(-0.5, 1.4, 0);
    carGroup.add(carTop);

    // Windshield
    const windshieldGeometry = new THREE.PlaneGeometry(1, 0.8);
    const windshieldMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaff, transparent: true, opacity: 0.5 });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0.5, 1.4, 0.9);
    windshield.rotation.x = Math.PI / 6;
    carGroup.add(windshield);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const wheelPositions = [
        [-1.2, 0, 1],
        [-1.2, 0, -1],
        [1.2, 0, 1],
        [1.2, 0, -1]
    ];

    wheelPositions.forEach(position => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...position);
        wheel.rotation.z = Math.PI / 2;
        carGroup.add(wheel);
    });

    // Headlights
    const headlightGeometry = new THREE.CircleGeometry(0.2, 32);
    const headlightMaterial = new THREE.MeshPhongMaterial({ color: 0xffffaa, emissive: 0xffffaa });
    
    const headlightPositions = [
        [2, 0.5, 0.8],
        [2, 0.5, -0.8]
    ];

    headlightPositions.forEach(position => {
        const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight.position.set(...position);
        headlight.rotation.y = Math.PI / 2;
        carGroup.add(headlight);
    });

    return carGroup;
}

export function updateCarPosition(car, progress) {
    car.position.x = (progress / 100) * 90 - 45;
    car.position.y = 0.5;

    // Rotate wheels
    const wheelRotation = (progress / 100) * Math.PI * 20; // 10 full rotations over the course
    car.children.forEach((child, index) => {
        if (index > 1) { // Skip the first two children (car body and top)
            child.rotation.x = wheelRotation;
        }
    });
}
