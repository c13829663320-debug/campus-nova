import * as THREE from "three";

/* 世界尺寸（平面米制，等距视角交给相机，不写进数据） */
export const WORLD = { width: 100, depth: 60 };

const PALETTE = {
  grass: "#DDEBC9",
  slabTop: "#EFEADC",
  slabSide: "#E6DFCD",
  sky: "#F2F4EC"
};

const VIEW_HEIGHT = 78;          // 正交相机可视高度（世界单位）
const CAMERA_OFFSET = new THREE.Vector3(64, 64, 64); // 等距 45° / 35.26°
const PIXEL_RATIO_CAP = 2;
const MOBILE_PIXEL_RATIO_CAP = 1.5;

export function createStage(container) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    throw new Error("WEBGL_UNAVAILABLE");
  }
  const ratioCap = window.innerWidth < 720 ? MOBILE_PIXEL_RATIO_CAP : PIXEL_RATIO_CAP;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ratioCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = "map3d-canvas";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.sky);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
  const target = new THREE.Vector3(0, 0, 0);
  camera.position.copy(target).add(CAMERA_OFFSET);
  camera.lookAt(target);

  /* 卡通材质靠「环境光 + 单一方向光」拉开面与面的明暗，强度按 1/π 折算后接近 1:1 还原色板 */
  const hemisphere = new THREE.HemisphereLight(0xffffff, 0xE2E7DC, 1.9);
  const sun = new THREE.DirectionalLight(0xFFF8EC, 0.9);
  sun.position.set(60, 90, 30);
  scene.add(hemisphere, sun);

  const world = new THREE.Group();
  scene.add(world);
  buildGround(world);

  /* 按需渲染：只有视口或状态变化时才跑一帧 */
  let frameId = 0;
  let disposed = false;

  function render() {
    frameId = 0;
    if (disposed) return;
    renderer.render(scene, camera);
  }

  function requestRender() {
    if (!frameId && !disposed) frameId = requestAnimationFrame(render);
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    camera.left = (-VIEW_HEIGHT * aspect) / 2;
    camera.right = (VIEW_HEIGHT * aspect) / 2;
    camera.top = VIEW_HEIGHT / 2;
    camera.bottom = -VIEW_HEIGHT / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestRender();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  return {
    scene,
    camera,
    renderer,
    world,
    target,
    viewHeight: VIEW_HEIGHT,
    container,
    requestRender,
    dispose() {
      disposed = true;
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      /* 几何体与材质有大量共享，去重后再释放 */
      const geometries = new Set();
      const materials = new Set();
      world.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (!object.material) return;
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}

/* 校园底座：厚板 + 草地顶面，先给个干净的台面感 */
function buildGround(parent) {
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(WORLD.width + 4, 2.6, WORLD.depth + 4),
    new THREE.MeshBasicMaterial({ color: PALETTE.slabSide })
  );
  slab.position.y = -1.3;

  const lawn = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD.width, WORLD.depth),
    new THREE.MeshBasicMaterial({ color: PALETTE.grass })
  );
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.y = 0.01;

  parent.add(slab, lawn);
}
