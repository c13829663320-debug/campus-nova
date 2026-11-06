import * as THREE from "three";
import { RoundedBoxGeometry } from "../../vendor/three/addons/geometries/RoundedBoxGeometry.js";
import { PALETTE, flat, toon, roofColor } from "./materials.js";

/* 共用单位圆角方块，靠 scale 变成不同体量，省几何体内存 */
const UNIT_BOX = new RoundedBoxGeometry(1, 1, 1, 2, 0.07);

/* 全部地图内容由 campus-map.json 驱动 */
export function buildWorld(stage, data) {
  const group = new THREE.Group();
  group.name = "campus";

  buildTerrain(group, data);
  buildZones(group, data);
  const records = buildBuildings(group, data);

  stage.world.add(group);
  stage.requestRender();

  /* 细节层与描边预先收集，避免每次缩放都整棵树遍历 */
  const detailGroups = [];
  const outlines = [];
  group.traverse(object => {
    if (object.userData.details) detailGroups.push(object.userData.details);
    if (object.userData.outlineMax) outlines.push(object);
  });
  let detailsVisible = true;

  /*
   * 描边保持屏幕空间恒定：相机缩放后重新计算世界厚度，
   * 远景不会退化成灰边，近景也不会变成粗黑框。
   */
  const OUTLINE_PX = 4.8;
  function updateOutlines(zoom) {
    const height = stage.renderer.domElement.clientHeight || 1;
    const viewHeight = stage.camera.top - stage.camera.bottom;
    const worldPerPixel = viewHeight / zoom / height;
    const thickness = THREE.MathUtils.clamp(worldPerPixel * OUTLINE_PX, 0.08, 1.4);
    outlines.forEach(outline => {
      outline.scale.setScalar(1 + thickness / outline.userData.outlineMax);
    });
  }

  /* 缩放小于 0.9 时收起细节层，远景只留体块 */
  function setZoom(zoom) {
    updateOutlines(zoom);
    const visible = zoom > 0.9;
    if (visible === detailsVisible) return;
    detailsVisible = visible;
    detailGroups.forEach(details => { details.visible = visible; });
  }

  /*
   * 筛选：被排除的建筑淡到 18% 透明度，而不是直接消失，
   * 这样板块/分类切换时能看出「同一张地图被筛掉了一部分」。
   */
  const DIM = 0.18;
  const filter = { zoneId: null, category: null };
  const states = records.map(record => ({ record, value: 1, target: 1 }));
  let filterFrame = 0;

  function applyValue(state) {
    state.record.materials.forEach(material => {
      material.opacity = (material.userData.baseOpacity ?? 1) * state.value;
    });
  }

  function filterTick() {
    filterFrame = 0;
    let running = false;
    states.forEach(state => {
      const delta = state.target - state.value;
      if (Math.abs(delta) < 0.008) {
        state.value = state.target;
      } else {
        state.value += delta * 0.2;
        running = true;
      }
      applyValue(state);
    });
    stage.requestRender();
    if (running) filterFrame = requestAnimationFrame(filterTick);
  }

  function setFilter(next = {}) {
    filter.zoneId = next.zoneId ?? null;
    filter.category = next.category ?? null;
    states.forEach(state => {
      const { record } = state;
      const passZone = !filter.zoneId || record.zoneId === filter.zoneId;
      const passCategory = !filter.category || record.category === filter.category;
      state.target = passZone && passCategory ? 1 : DIM;
    });
    if (!filterFrame) filterFrame = requestAnimationFrame(filterTick);
  }

  return {
    group,
    setZoom,
    setFilter
  };
}

/* 每栋建筑独享材质副本，才能单独调透明度做筛选动画 */
function isolate(object) {
  const materials = new Set();
  object.traverse(child => {
    if (!child.material) return;
    const clones = (Array.isArray(child.material) ? child.material : [child.material]).map(material => {
      const clone = material.clone();
      clone.transparent = true;
      clone.opacity = 1;
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    clones.forEach(clone => materials.add(clone));
  });
  object.userData.materials = materials;
  return materials;
}

/*
 * 卡通描边：反向法线壳（BackSide）+ 轻微放大，只画轮廓不画面片，
 * 比 EdgesGeometry 干净，圆角体块也不会出现碎线。
 * 初始厚度由 setZoom 按当前缩放统一刷新。
 */
const OUTLINE_SEED = 0.4;
const SHADOW_GEO = new THREE.CircleGeometry(0.5, 26);

function addOutline(object, materials) {
  const meshes = [];
  object.traverse(child => {
    if (child.isMesh) meshes.push(child);
  });

  const material = new THREE.MeshBasicMaterial({
    color: PALETTE.outline,
    side: THREE.BackSide,
    transparent: true,
    opacity: 1
  });
  materials.add(material);

  meshes.forEach(mesh => {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    if (!box) return;

    const localMax = Math.max(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    );
    const worldMax = localMax * Math.max(Math.abs(mesh.scale.x), Math.abs(mesh.scale.y), Math.abs(mesh.scale.z));
    if (!worldMax) return;

    const outline = new THREE.Mesh(mesh.geometry, material);
    outline.scale.setScalar(1 + OUTLINE_SEED / worldMax);
    outline.userData.outlineMax = worldMax;
    outline.renderOrder = -1;
    mesh.add(outline);
  });
}

/*
 * 接触阴影：两层同心扁椭圆叠出柔和边缘，
 * 让体块「落」在草地上，而不是悬浮在色块上。
 */
function addContactShadow(object, spot, materials) {
  const [width, depth] = spot.size || [1.6, 1.6];

  const group = new THREE.Group();
  group.position.y = 0.115;
  [
    { scale: 1.34, opacity: 0.07 },
    { scale: 1.16, opacity: 0.09 }
  ].forEach(({ scale, opacity }) => {
    const material = flat(PALETTE.shadow, { transparent: true, opacity, depthWrite: false }).clone();
    material.userData.baseOpacity = opacity;
    materials.add(material);
    const mesh = new THREE.Mesh(SHADOW_GEO, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.set(width * scale, depth * scale, 1);
    group.add(mesh);
  });

  object.add(group);
}

/* 水域：映月湖两片湖面 */
function buildTerrain(parent, data) {
  if (!data.terrain?.water) return;

  data.terrain.water.forEach(polygon => {
    const shape = new THREE.Shape(polygon.map(([x, z]) => new THREE.Vector2(x, -z)));

    const water = plate(shape, 0.085, flat(PALETTE.water));
    const edge = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(polygon.map(([x, z]) => new THREE.Vector3(x, 0.095, z))),
      new THREE.LineBasicMaterial({ color: PALETTE.waterEdge, transparent: true, opacity: 0.6 })
    );

    parent.add(water, edge);
  });
}

/* 板块色块 + 虚线边界 */
function buildZones(parent, data) {
  data.zones.forEach((zone, zoneIndex) => {
    zone.polygons.forEach((polygon, polygonIndex) => {
      const shape = new THREE.Shape(polygon.map(([x, z]) => new THREE.Vector2(x, -z)));
      const fill = plate(shape, 0.04 + zoneIndex * 0.006 + polygonIndex * 0.002, flat(zone.color, {
        transparent: true,
        opacity: 0.3,
        depthWrite: false
      }));

      const outline = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(polygon.map(([x, z]) => new THREE.Vector3(x, 0, z))),
        new THREE.LineDashedMaterial({
          color: new THREE.Color(zone.color).multiplyScalar(0.72),
          dashSize: 0.9,
          gapSize: 0.6,
          transparent: true,
          opacity: 0.85
        })
      );
      outline.computeLineDistances();
      outline.position.y = 0.075 + zoneIndex * 0.006;

      parent.add(fill, outline);
    });
  });
}

/* 建筑体块：kind 决定基础几何形态 */
function buildBuildings(parent, data) {
  const buildings = new THREE.Group();
  buildings.name = "buildings";
  const placeCategory = new Map(data.places.map(place => [place.id, place.category]));
  const records = [];

  data.zones.forEach(zone => {
    zone.spots.forEach(spot => {
      if (!spot.kind || spot.kind === "none") return;

      let object = null;
      if (spot.kind === "block") object = block(spot, zone);
      else if (spot.kind === "slab") object = slab(spot, zone);
      else if (spot.kind === "oval") object = track(spot, zone);
      else if (spot.kind === "bridge") object = bridge(spot, zone);
      else if (spot.kind === "pavilion") object = pavilion(spot, zone);
      if (!object) return;

      const materials = isolate(object);
      addOutline(object, materials);
      if (spot.kind === "block" || spot.kind === "pavilion") addContactShadow(object, spot, materials);
      object.userData.category = placeCategory.get(spot.placeId) || null;
      records.push({ zoneId: zone.id, category: object.userData.category, materials });
      buildings.add(object);
    });
  });

  parent.add(buildings);
  return records;
}

function tag(mesh, spot, zone) {
  Object.assign(mesh.userData, { spotId: spot.id, zoneId: zone?.id, placeId: spot.placeId });
  return mesh;
}

function block(spot, zone) {
  const [width, depth] = spot.size;
  const height = spot.height;
  const detail = spot.detail || {};
  const group = new THREE.Group();
  const details = new THREE.Group();
  details.visible = true;

  const body = new THREE.Mesh(
    UNIT_BOX,
    toon(spot.accent ? PALETTE.accentWall : PALETTE.wall)
  );
  body.scale.set(width, height, depth);
  body.position.y = height / 2;

  const base = new THREE.Mesh(
    UNIT_BOX,
    flat(new THREE.Color(zone.color).lerp(new THREE.Color("#FFFFFF"), 0.55))
  );
  base.scale.set(width * 1.12, 0.12, depth * 1.12);
  base.position.y = 0.06;

  details.add(roofDetail(spot, zone, width, depth, height), wallDetail(spot, zone, width, depth, height));
  if (height >= 3) details.add(windowBands(width, depth, height));

  group.add(body, base, details);
  group.userData.details = details;
  group.position.set(spot.x, 0, spot.z);
  tag(group, spot, zone);
  return group;
}

/* 屋顶：平顶色带 / 坡顶 / 锯齿顶 / 穹顶 */
function roofDetail(spot, zone, width, depth, height) {
  const detail = spot.detail || {};
  const group = new THREE.Group();
  const color = roofColor(zone, spot);

  if (detail.roof === "gable") {
    const roof = gableRoof(width, depth, Math.min(width, depth) * 0.34, color);
    roof.position.y = height;
    group.add(roof);
  } else if (detail.roof === "sawtooth") {
    const teeth = 3;
    const span = width / teeth;
    for (let i = 0; i < teeth; i += 1) {
      const tooth = gableRoof(span, depth, span * 0.55, color);
      tooth.position.set(-width / 2 + span * (i + 0.5), height, 0);
      group.add(tooth);
    }
  } else if (detail.roof === "dome") {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      flat(new THREE.Color(color).lerp(new THREE.Color("#FFFFFF"), 0.35))
    );
    dome.scale.set(width / 2, Math.min(width, depth) * 0.45, depth / 2);
    dome.position.y = height;
    group.add(dome);
  } else {
    const cap = new THREE.Mesh(UNIT_BOX, flat(color));
    cap.scale.set(width * 0.96, 0.22, depth * 0.96);
    cap.position.y = height + 0.02;
    group.add(cap);

    if (detail.skylights) {
      const count = detail.skylights;
      for (let i = 0; i < count; i += 1) {
        const skylight = new THREE.Mesh(UNIT_BOX, flat(PALETTE.skylight));
        skylight.scale.set(1.1, 0.1, 1.1);
        skylight.position.set(
          count === 1 ? 0 : -width * 0.28 + (width * 0.56 * i) / (count - 1),
          height + 0.14,
          0
        );
        group.add(skylight);
      }
    }
  }

  return group;
}

/* 立面细节：顶部色带、入口雨棚、屋顶招牌 */
function wallDetail(spot, zone, width, depth, height) {
  const detail = spot.detail || {};
  const group = new THREE.Group();
  const accent = roofColor(zone, spot);

  if (detail.band) {
    const band = new THREE.Mesh(UNIT_BOX, flat(new THREE.Color(zone.color).multiplyScalar(0.88)));
    band.scale.set(width + 0.14, 0.34, depth + 0.14);
    band.position.y = height - 0.68;
    group.add(band);
  }

  if (detail.awning) {
    const awning = new THREE.Mesh(UNIT_BOX, flat(accent));
    awning.scale.set(Math.min(width * 0.5, 3.2), 0.16, 1.1);
    awning.position.set(0, Math.min(1.6, height * 0.42), depth / 2 + 0.52);
    group.add(awning);
  }

  if (detail.sign) {
    const sign = new THREE.Mesh(UNIT_BOX, flat(PALETTE.accentRoof));
    sign.scale.set(1.7, 0.52, 0.18);
    sign.position.set(0, height + 0.42, depth / 2 * 0.62);
    group.add(sign);
  }

  return group;
}

/* 窗带：受光立面两条横向长窗，避免楼体看起来像纯色积木 */
function windowBands(width, depth, height) {
  const group = new THREE.Group();
  const material = flat(PALETTE.window);

  [0.36, 0.62].forEach(ratio => {
    const strip = new THREE.Mesh(UNIT_BOX, material);
    strip.scale.set(width * 0.74, 0.24, 0.08);
    strip.position.set(0, height * ratio, depth / 2 + 0.03);
    group.add(strip);
  });

  return group;
}

/* 三角坡顶（脊线沿进深方向） */
function gableRoof(width, depth, rise, color) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, rise);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geometry, flat(color));
}

/* 运动场地白线：沿矩形边缘描一圈 */
function outlineRect(width, depth, y, color = "#FFFFFF") {
  const points = [
    new THREE.Vector3(-width / 2, y, -depth / 2),
    new THREE.Vector3(width / 2, y, -depth / 2),
    new THREE.Vector3(width / 2, y, depth / 2),
    new THREE.Vector3(-width / 2, y, depth / 2),
    new THREE.Vector3(-width / 2, y, -depth / 2)
  ];
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
  );
}

function slab(spot, zone) {
  const [width, depth] = spot.size;
  const color = spot.tone === "water" ? PALETTE.water : spot.tone === "wood" ? PALETTE.deck : PALETTE.court;

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(UNIT_BOX, flat(color));
  mesh.scale.set(width, spot.height, depth);
  mesh.position.y = spot.height / 2 + 0.02;
  group.add(mesh);

  if (spot.tone !== "water") {
    const lines = outlineRect(width * 0.94, depth * 0.9, spot.height + 0.03);
    group.add(lines);
    group.userData.details = lines;
  }

  group.position.set(spot.x, 0, spot.z);
  return tag(group, spot, zone);
}

function track(spot, zone) {
  const [width, depth] = spot.size;
  const group = new THREE.Group();

  const outer = new THREE.Shape();
  outer.absellipse(0, 0, width / 2, depth / 2, 0, Math.PI * 2);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, (width / 2) * 0.62, (depth / 2) * 0.58, 0, Math.PI * 2);
  outer.holes.push(hole);

  const lane = new THREE.Mesh(new THREE.ShapeGeometry(outer), flat(PALETTE.track));
  lane.rotation.x = -Math.PI / 2;
  lane.position.y = 0.03;
  const field = new THREE.Mesh(new THREE.CircleGeometry(1, 40), flat(PALETTE.field));
  field.rotation.x = -Math.PI / 2;
  field.scale.set((width / 2) * 0.62, (depth / 2) * 0.58, 1);
  field.position.y = 0.045;

  /* 跑道分道白线（细节层） */
  const lines = new THREE.Group();
  [[0.52, 0.5], [0.62, 0.58], [1, 1]].forEach(([kx, kz]) => {
    const curve = new THREE.EllipseCurve(0, 0, (width / 2) * kx, (depth / 2) * kz, 0, Math.PI * 2);
    const points = curve.getPoints(72).map(point => new THREE.Vector3(point.x, 0.055, point.y));
    lines.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.9 })
    ));
  });

  group.add(lane, field, lines);
  group.userData.details = lines;
  group.position.set(spot.x, 0, spot.z);
  return tag(group, spot, zone);
}

function bridge(spot, zone) {
  const [width, depth] = spot.size;
  const mesh = new THREE.Mesh(UNIT_BOX, flat(PALETTE.bridge));
  mesh.scale.set(width, spot.height, depth);
  mesh.position.set(spot.x, 0.55, spot.z);
  return tag(mesh, spot, zone);
}

function pavilion(spot, zone) {
  const group = new THREE.Group();

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, spot.height, 12), toon(PALETTE.wall));
  column.position.y = spot.height / 2;

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.9, 8), flat(zone.color));
  roof.position.y = spot.height + 0.42;

  group.add(column, roof);
  group.position.set(spot.x, 0, spot.z);
  return tag(group, spot, zone);
}

/* 平面图形 → 水平铺在地面的网格 */
function plate(shape, y, material) {
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}
