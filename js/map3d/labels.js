import * as THREE from "three";

/*
 * 悬浮图标层：3D 世界坐标投影到屏幕，用 DOM 承载图标与角标。
 * 好处是文字/图标始终清晰，且不占用 WebGL 绘制开销。
 */
const ICONS = {
  "book-open": '<path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2Z"/><path d="M12 6.5v13"/>',
  utensils: '<path d="M7 3v7a2 2 0 0 0 2 2v9"/><path d="M11 3v7"/><path d="M17 3c-1.5 2-2 4-2 6s.5 4 2 6v6"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a3 3 0 0 0 3 3"/><path d="M16 6h3v1a3 3 0 0 1-3 3"/><path d="M12 13v4"/><path d="M9 17h6"/><path d="M8 21h8"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8"/><path d="M15 14.5a6 6 0 0 1 5 5.5"/>',
  school: '<path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/>',
  bed: '<path d="M3 18V10"/><path d="M3 13h18v5"/><path d="M7 13V9h5a3 3 0 0 1 3 3v1"/>',
  waves: '<path d="M2 8c2 0 2 1.5 4 1.5S8 8 10 8s2 1.5 4 1.5S16 8 18 8s2 1.5 4 1.5"/><path d="M2 14c2 0 2 1.5 4 1.5S8 14 10 14s2 1.5 4 1.5S16 14 18 14s2 1.5 4 1.5"/>',
  store: '<path d="M4 9h16l-1.5 11h-13L4 9Z"/><path d="M4 9 6 4h12l2 5"/><path d="M9 20v-5h6v5"/>'
};

function svg(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.school}</svg>`;
}

export function createLabels(stage, data) {
  const layer = document.createElement("div");
  layer.className = "map3d-labels";
  stage.container.appendChild(layer);

  /* 楼高来自点位数据，让图标浮在体块顶上而不是贴地 */
  const heightByPlace = new Map();
  const zoneByPlace = new Map();
  data.zones.forEach(zone => zone.spots.forEach(spot => {
    if (!spot.placeId) return;
    heightByPlace.set(spot.placeId, spot.height || 0);
    zoneByPlace.set(spot.placeId, zone.id);
  }));

  const categoryCount = data.places.reduce((map, place) => {
    map.set(place.category, (map.get(place.category) || 0) + 1);
    return map;
  }, new Map());

  const items = data.places.map(place => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "map3d-label";
    el.dataset.placeId = place.id;
    el.dataset.category = place.category;
    el.title = place.name;
    el.innerHTML = `<span class="map3d-label__icon">${svg(place.icon)}</span><span class="map3d-label__badge">${categoryCount.get(place.category)}</span>`;
    layer.appendChild(el);

    return {
      el,
      place,
      zoneId: zoneByPlace.get(place.id) || null,
      anchor: new THREE.Vector3(place.x, (heightByPlace.get(place.id) || 0) + 0.9, place.z)
    };
  });

  const projected = new THREE.Vector3();

  /* 与建筑共用一套筛选条件，板块/分类变化时图标同步淡出 */
  function setFilter(next = {}) {
    const zoneId = next.zoneId ?? null;
    const category = next.category ?? null;
    items.forEach(item => {
      const passZone = !zoneId || item.zoneId === zoneId;
      const passCategory = !category || item.place.category === category;
      item.el.classList.toggle("is-muted", !(passZone && passCategory));
    });
  }

  /*
   * 投影只处理「画布内的 NDC → 画布内像素」，再叠加画布相对图标层的偏移。
   * 两个 rect 都随页面滚动同步位移，相减后滚动量抵消，
   * 所以即使整页滚动、容器有内边距或边框，图标也不会错位。
   */
  function update() {
    const canvasRect = stage.renderer.domElement.getBoundingClientRect();
    const layerRect = layer.getBoundingClientRect();
    const width = canvasRect.width;
    const height = canvasRect.height;
    if (!width || !height) return;

    const offsetX = canvasRect.left - layerRect.left;
    const offsetY = canvasRect.top - layerRect.top;

    items.forEach(item => {
      projected.copy(item.anchor).project(stage.camera);
      const x = offsetX + (projected.x * 0.5 + 0.5) * width;
      const y = offsetY + (-projected.y * 0.5 + 0.5) * height;
      const inside = projected.z < 1 && x > -80 && x < width + 80 && y > -60 && y < height + 100;

      item.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      item.el.style.zIndex = String(Math.round((2 - projected.z) * 100));
      item.el.classList.toggle("is-out", !inside);
    });
  }

  const observer = new ResizeObserver(update);
  observer.observe(stage.container);
  update();

  return {
    layer,
    update,
    setFilter,
    dispose() {
      observer.disconnect();
      layer.remove();
    }
  };
}
