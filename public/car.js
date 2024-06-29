export function createCar(color) {
    const carGroup = new THREE.Group();

    // Car body
    const carShape = new THREE.Shape();
    carShape.moveTo(0, 0.4);
    carShape.lineTo(0.2, 0.6);
    carShape.lineTo(0.8, 0.6);
    carShape.lineTo(1, 0.4);
    carShape.lineTo(1, 0.2);
    carShape.lineTo(0, 0.2);
    carShape.lineTo(0, 0.4);

    const extrudeSettings = {
        steps: 2,
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 1
    };

    const carGeometry = new THREE.ExtrudeGeometry(carShape, extrudeSettings);
    const carMaterial = new THREE.MeshPhongMaterial({ color: color });
    const carBody = new THREE.Mesh(carGeometry, carMaterial);
    carGroup.add(carBody);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const wheelPositions = [
        [0.2, 0, 0.3],
        [0.2, 0, -0.3],
        [0.8, 0, 0.3],
        [0.8, 0, -0.3]
    ];

    wheelPositions.forEach(position => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...position);
        wheel.rotation.z = Math.PI / 2;
        carGroup.add(wheel);
    });

    carGroup.scale.set(2, 2, 2);
    return carGroup;
}

export function updateCarPosition(car, progress) {
    car.position.x = (progress / 100) * 90 - 45;
    car.position.y = 0.5;
    car.rotation.y = -Math.PI / 2;

    // Rotate wheels
    const wheelRotation = (progress / 100) * Math.PI * 20; // 10 full rotations over the course
    car.children.forEach((child, index) => {
        if (index > 0) { // Skip the first child (car body)
            child.rotation.y = wheelRotation;
        }
    });
}