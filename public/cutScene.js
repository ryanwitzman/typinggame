import { THREE } from './threeImport.js';
import { scene, camera, renderer } from './threeSetup.js';

let cutSceneCamera, mixer, clock;
const animationDuration = 5000; // 5 seconds

export function initCutScene() {
    cutSceneCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    clock = new THREE.Clock();
}

export function playCutScene(car) {
    const startPosition = car.position.clone();
    const endPosition = new THREE.Vector3(startPosition.x + 20, startPosition.y, startPosition.z);

    cutSceneCamera.position.set(startPosition.x - 5, startPosition.y + 3, startPosition.z + 5);
    cutSceneCamera.lookAt(car.position);

    const animationClip = new THREE.AnimationClip('cutScene', animationDuration / 1000, [
        new THREE.VectorKeyframeTrack('.position', [0, animationDuration / 1000], [
            startPosition.x, startPosition.y, startPosition.z,
            endPosition.x, endPosition.y, endPosition.z
        ]),
        new THREE.QuaternionKeyframeTrack('.quaternion', [0, animationDuration / 1000], [
            0, 0, 0, 1,
            0, 0, 0, 1
        ])
    ]);

    mixer = new THREE.AnimationMixer(car);
    const action = mixer.clipAction(animationClip);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();

    animateCutScene();
}

function animateCutScene() {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    renderer.render(scene, cutSceneCamera);

    if (mixer && mixer.time < animationDuration / 1000) {
        requestAnimationFrame(animateCutScene);
    } else {
        endCutScene();
    }
}

function endCutScene() {
    // Reset to main game view
    renderer.render(scene, camera);
}
