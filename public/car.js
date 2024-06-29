import * as THREE from '../node_modules/three/build/three.module.js';

export function createCar(color = 0x1a75ff) {
    const carGroup = new THREE.Group();

    // Car body
    const carBodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const carBodyMaterial = new THREE.MeshPhongMaterial({ color: color });
    const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    carBody.position.y = 0.25;
    carGroup.add(carBody);

    // Car top
    const carTopGeometry = new THREE.BoxGeometry(1.2, 0.4, 0.8);
    const carTopMaterial = new THREE.MeshPhongMaterial({ color: color });
    const carTop = new THREE.Mesh(carTopGeometry, carTopMaterial);
    carTop.position.set(0.2, 0.7, 0);
    carGroup.add(carTop);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const wheelPositions = [
        [-0.7, 0, 0.5],
        [-0.7, 0, -0.5],
        [0.7, 0, 0.5],
        [0.7, 0, -0.5]
    ];

    wheelPositions.forEach(position => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...position);
        wheel.rotation.z = Math.PI / 2;
        carGroup.add(wheel);
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
