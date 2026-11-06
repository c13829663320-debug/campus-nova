import * as THREE from "three";

const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2.8;
const PAN_LIMIT = { x: 46, z: 26 };
const ZOOM_EASE = 0.22;

/*
 * 等距视图下的平移/缩放：
 * - 平移用「抓住地面点」的方式算，不依赖相机角度，手感最准
 * - 缩放围绕指针位置，保证指针下的地点不跑位
 */
export function attachControls(stage) {
  const { camera, renderer, target, requestRender } = stage;
  const container = stage.container;
  const dom = renderer.domElement;
  const offset = camera.position.clone().sub(target);

  let zoom = 1;
  let zoomTarget = 1;
  let anchorNdc = null;
  let anchorWorld = null;
  let animId = 0;
  let flightFrame = 0;
  let drag = null;
  const pointers = new Map();
  let pinchDistance = 0;

  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const scratch = new THREE.Vector3();

  function ndcFrom(clientX, clientY) {
    const rect = dom.getBoundingClientRect();
    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1)
    );
  }

  function groundAt(ndc) {
    camera.updateMatrixWorld();
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.ray.intersectPlane(groundPlane, scratch);
    return hit ? hit.clone() : null;
  }

  function applyProjection() {
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    stage.onZoomChange?.(zoom);
    stage.onViewChange?.();
  }
  function applyPosition() {
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    stage.onViewChange?.();
  }

  function clampTarget() {
    target.x = Math.min(PAN_LIMIT.x, Math.max(-PAN_LIMIT.x, target.x));
    target.z = Math.min(PAN_LIMIT.z, Math.max(-PAN_LIMIT.z, target.z));
  }

  function tick() {
    animId = 0;
    if (Math.abs(zoomTarget - zoom) < 0.0015) {
      zoom = zoomTarget;
      applyProjection();
      requestRender();
      return;
    }
    zoom += (zoomTarget - zoom) * ZOOM_EASE;
    applyProjection();
    if (anchorNdc && anchorWorld) {
      const current = groundAt(anchorNdc);
      if (current) {
        target.add(anchorWorld.clone().sub(current));
        clampTarget();
        applyPosition();
      }
    }
    requestRender();
    animId = requestAnimationFrame(tick);
  }

  function animateZoom() {
    if (!animId) animId = requestAnimationFrame(tick);
  }

  function zoomBy(factor, ndc) {
    zoomTarget = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomTarget * factor));
    if (ndc) {
      anchorNdc = ndc.clone();
      anchorWorld = groundAt(anchorNdc);
    } else {
      anchorNdc = null;
      anchorWorld = null;
    }
    animateZoom();
  }

  function reset() {
    focus({ x: 0, z: 0, zoom: 1 });
  }

  /* 镜头飞行：板块聚焦、回全景都用它，位移与缩放同步缓动 */
  function focus(options = {}, duration = 480) {
    const toX = options.x ?? 0;
    const toZ = options.z ?? 0;
    const toZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, options.zoom ?? 1));

    if (animId) { cancelAnimationFrame(animId); animId = 0; }
    if (flightFrame) { cancelAnimationFrame(flightFrame); flightFrame = 0; }

    const fromX = target.x;
    const fromZ = target.z;
    const fromZoom = zoom;
    const start = performance.now();
    anchorNdc = null;
    anchorWorld = null;
    zoomTarget = toZoom;

    const ease = t => 1 - Math.pow(1 - t, 3);
    const step = now => {
      flightFrame = 0;
      const t = Math.min(1, (now - start) / duration);
      const k = ease(t);
      target.set(fromX + (toX - fromX) * k, 0, fromZ + (toZ - fromZ) * k);
      zoom = fromZoom + (toZoom - fromZoom) * k;
      zoomTarget = zoom;
      applyPosition();
      applyProjection();
      requestRender();
      if (t < 1) flightFrame = requestAnimationFrame(step);
    };
    flightFrame = requestAnimationFrame(step);
  }

  function pointerDistance() {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onPointerDown(event) {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dom.setPointerCapture(event.pointerId);
    if (pointers.size === 1) {
      const grabbed = groundAt(ndcFrom(event.clientX, event.clientY));
      drag = grabbed ? { anchor: grabbed } : null;
      container.classList.add("is-dragging");
    } else if (pointers.size === 2) {
      drag = null;
      pinchDistance = pointerDistance();
    }
  }

  function onPointerMove(event) {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 2) {
      const distance = pointerDistance();
      if (pinchDistance && distance) {
        const ndc = ndcFrom(event.clientX, event.clientY);
        zoomTarget = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomTarget * (distance / pinchDistance)));
        anchorNdc = ndc;
        anchorWorld = groundAt(ndc);
        pinchDistance = distance;
        animateZoom();
      }
      return;
    }

    if (!drag) return;
    const current = groundAt(ndcFrom(event.clientX, event.clientY));
    if (!current) return;
    target.add(drag.anchor.clone().sub(current));
    clampTarget();
    applyPosition();
    requestRender();
  }

  function onPointerUp(event) {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchDistance = 0;
    if (pointers.size === 0) {
      drag = null;
      container.classList.remove("is-dragging");
    }
  }

  function onWheel(event) {
    event.preventDefault();
    zoomBy(Math.exp(-event.deltaY * 0.0015), ndcFrom(event.clientX, event.clientY));
  }

  dom.addEventListener("pointerdown", onPointerDown);
  dom.addEventListener("pointermove", onPointerMove);
  dom.addEventListener("pointerup", onPointerUp);
  dom.addEventListener("pointercancel", onPointerUp);
  dom.addEventListener("wheel", onWheel, { passive: false });
  applyProjection();

  return {
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(1 / 1.25),
    reset,
    focus,
    getZoom: () => zoomTarget,
    dispose() {
      if (animId) cancelAnimationFrame(animId);
      if (flightFrame) cancelAnimationFrame(flightFrame);
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
    }
  };
}
