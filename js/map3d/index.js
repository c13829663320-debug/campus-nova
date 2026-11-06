import { createStage } from "./scene.js";
import { attachControls } from "./interaction.js";
import { buildWorld } from "./world.js";
import { createLabels } from "./labels.js";

/*
 * 2.5D 校园地图入口：管理渲染舞台生命周期，对外只暴露视图与筛选操作。
 * 页面层不直接碰 Three.js，只调用 setZone / setCategory。
 */
export function mountCampusMap(container, { data } = {}) {
  let stage;
  try {
    stage = createStage(container);
  } catch (error) {
    renderFallback(container);
    return null;
  }

  const world = data ? buildWorld(stage, data) : null;
  const labels = data ? createLabels(stage, data) : null;

  const filter = { zoneId: null, category: null };

  function applyFilter() {
    world?.setFilter(filter);
    labels?.setFilter(filter);
  }

  /* 缩放联动：细节层按阈值显隐，描边厚度随缩放保持屏幕像素恒定 */
  stage.onZoomChange = zoom => {
    world?.setZoom(zoom);
  };

  /* 相机任何位移都同步一次图标层，保证图标贴着建筑 */
  stage.onViewChange = () => labels?.update();

  const controls = attachControls(stage);

  /* 传 null 回到全景；传板块 id 则筛选 + 镜头飞到该板块预设机位 */
  function setZone(zoneId) {
    filter.zoneId = zoneId || null;
    applyFilter();
    const zone = data?.zones.find(item => item.id === filter.zoneId);
    controls.focus(zone?.camera ?? { x: 0, z: 0, zoom: 1 });
  }

  function setCategory(categoryId) {
    filter.category = !categoryId || categoryId === "all" ? null : categoryId;
    applyFilter();
  }

  return {
    stage,
    data,
    zoomIn: controls.zoomIn,
    zoomOut: controls.zoomOut,
    resetView: controls.reset,
    setZone,
    setCategory,
    focus: controls.focus,
    dispose() {
      controls.dispose();
      labels?.dispose();
      stage.dispose();
    }
  };
}

/* 无 WebGL 时的降级：直接给平面示意图，不留空白画布 */
function renderFallback(container) {
  container.classList.add("is-fallback");
  container.innerHTML = `
    <div class="map3d-fallback">
      <img src="assets/campus-map.svg" alt="校园平面示意图" draggable="false">
      <div class="map3d-fallback__copy">
        <strong>当前设备无法启用 3D 地图</strong>
        <p>浏览器未提供 WebGL，已切换为校园平面示意图。</p>
      </div>
    </div>`;
}
