import * as THREE from "three";

const CAMERA_OFFSET = new THREE.Vector3(40, 82, 88);

export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const pixelRatioCap = window.innerWidth < 740 ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.domElement.className = "map3d-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const target = new THREE.Vector3(0, 0, 0);
  camera.position.copy(CAMERA_OFFSET);
  camera.lookAt(target);

  const sky = new THREE.HemisphereLight(0xf6fbff, 0xd6dfcb, 2.2);
  const sun = new THREE.DirectionalLight(0xfff4da, 2.0);
  sun.position.set(-44, 75, 45);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -65, right: 65, top: 47, bottom: -47, far: 170 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.normalBias = 0.09;
  sun.shadow.bias = -0.0002;
  scene.add(sky, sun);

  let frameId = 0;
  let disposed = false;
  const stage = { camera, renderer, container, target, requestRender, dispose };

  function requestRender() {
    if (frameId || disposed) return;
    frameId = requestAnimationFrame(() => {
      frameId = 0;
      renderer.render(scene, camera);
    });
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const viewHeight = Math.max(66, 119 / aspect);
    const viewWidth = viewHeight * aspect;
    Object.assign(camera, { left: -viewWidth / 2, right: viewWidth / 2, top: viewHeight / 2, bottom: -viewHeight / 2 });
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    stage.onViewChange?.();
    requestRender();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  stage.addModel = model => {
    model.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    scene.add(model);
    renderer.shadowMap.needsUpdate = true;
    requestRender();
  };

  function dispose() {
    disposed = true;
    observer.disconnect();
    if (frameId) cancelAnimationFrame(frameId);
    const materials = new Set();
    scene.traverse(object => {
      if (!object.isMesh) return;
      object.geometry.dispose();
      materials.add(object.material);
    });
    materials.forEach(material => material.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  }

  return stage;
}
