import * as THREE from "three";

/*
 * 低饱和马卡龙色板：建筑墙体用卡通受光材质，
 * 地面、水面、屋顶色带继续用纯色，避免受光把颜色压灰。
 */
export const PALETTE = {
  wall: "#F8F3E9",
  accentWall: "#FBE3D6",
  court: "#A9CDB7",
  water: "#AEDAE2",
  waterEdge: "#8FC3CE",
  skylight: "#DFEEF2",
  bridge: "#E3D3B7",
  deck: "#EFE6D6",
  track: "#DCA593",
  field: "#CBE3AE",
  accentRoof: "#E79070",
  outline: "#181B21",
  window: "#C7C2B6",
  shadow: "#7FA85C"
};

/* 四阶灰度渐变图：卡通材质的明暗分层全靠它 */
const gradientMap = (() => {
  const steps = new Uint8Array([92, 142, 196, 255]);
  const texture = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
})();

const toonCache = new Map();
const basicCache = new Map();

/* 卡通受光材质：无贴图，颜色纯靠色板和光照分层 */
export function toon(color) {
  if (!toonCache.has(color)) {
    toonCache.set(color, new THREE.MeshToonMaterial({ color, gradientMap }));
  }
  return toonCache.get(color);
}

export function flat(color, options = {}) {
  const key = `${color}|${options.opacity ?? 1}|${options.transparent ?? false}`;
  if (!basicCache.has(key)) {
    basicCache.set(key, new THREE.MeshBasicMaterial({ color, ...options }));
  }
  return basicCache.get(key);
}

/* 屋顶色带跟随板块色，让建筑和板块一眼能对上 */
export function roofColor(zone, spot) {
  return spot.accent ? PALETTE.accentRoof : zone.color;
}
