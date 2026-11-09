import { mountCampusMap } from "./index.js";

const stage = document.getElementById("stage");
const status = document.getElementById("map-status");
const hint = document.getElementById("map-hint");
const controls = document.getElementById("map-controls");
const filters = document.getElementById("filters");
const list = document.getElementById("places");
const count = document.getElementById("result-count");
const detail = document.getElementById("place-detail");
const zoneSelect = document.getElementById("zone");

let map;
let category = "all";
let selected = null;

function unavailable(message) {
  map = null;
  stage.classList.remove("is-ready");
  status.textContent = message;
  hint.textContent = "可从地标列表打开地点详情";
  controls.hidden = true;
}

function selectPlace(place) {
  selected = place.id;
  for (const button of list.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.placeId === selected));
  }
  map?.setSelected(selected);
  map?.focus({ x: place.x, z: place.z, zoom: 2.15 });
  const title = document.createElement("strong");
  title.textContent = place.name;
  const summary = document.createElement("p");
  summary.textContent = place.summary;
  const link = document.createElement("a");
  link.href = `./#place/${encodeURIComponent(place.id)}`;
  link.textContent = "查看地点详情 →";
  detail.replaceChildren(title, summary, link);
  detail.hidden = false;
}

async function initialize() {
  const response = await fetch("data/campus-map.json");
  if (!response.ok) throw new Error("Campus landmarks could not load");
  const { places, categories, zones } = await response.json();
  places.forEach((place, i) => { place.index = String(i + 1).padStart(2, "0"); });
  const categoriesById = new Map(categories.map(item => [item.id, item.label]));

  function renderPlaces() {
    const zone = zoneSelect.value;
    const visible = places.filter(place => (!zone || place.zone === zone) && (category === "all" || place.category === category));
    const ids = new Set(visible.map(place => place.id));
    if (!ids.has(selected)) {
      selected = null;
      detail.hidden = true;
    }
    count.textContent = visible.length ? `${visible.length} 个地标` : "此区域暂无该类别的地标";
    list.replaceChildren(...visible.map(place => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-place";
      button.dataset.category = place.category;
      button.dataset.placeId = place.id;
      button.setAttribute("aria-pressed", String(place.id === selected));
      const index = document.createElement("span");
      index.className = "place-index";
      index.textContent = place.index;
      const name = document.createElement("strong");
      name.textContent = place.name;
      const label = document.createElement("span");
      label.textContent = categoriesById.get(place.category);
      button.append(index, name, label);
      button.addEventListener("click", () => selectPlace(place));
      li.appendChild(button);
      return li;
    }));
    map?.setVisiblePlaces(ids);
    map?.setSelected(selected);
  }

  for (const item of categories) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.setAttribute("aria-pressed", String(item.id === category));
    button.addEventListener("click", () => {
      category = item.id;
      for (const other of filters.children) other.setAttribute("aria-pressed", String(other === button));
      renderPlaces();
    });
    filters.appendChild(button);
  }

  for (const zone of zones) zoneSelect.add(new Option(zone.name, zone.id));
  zoneSelect.disabled = false;
  const focusZone = () => {
    const zone = zones.find(item => item.id === zoneSelect.value);
    if (zone) map?.focus(zone.camera);
    else map?.resetView();
  };
  zoneSelect.addEventListener("change", () => {
    renderPlaces();
    focusZone();
  });
  renderPlaces();

  map = await mountCampusMap(stage, { places, onSelect: selectPlace, onUnavailable: unavailable });
  if (!map) return;
  stage.classList.add("is-ready");
  status.textContent = "三维模型已就绪";
  controls.hidden = false;
  const controlActions = {
    "zoom-in": "zoomIn", "zoom-out": "zoomOut", "rotate-view": "rotateView",
    "zoom-reset": "resetView"
  };
  for (const [id, action] of Object.entries(controlActions)) {
    document.getElementById(id).addEventListener("click", () => map?.[action]());
  }
  renderPlaces();
  const place = places.find(item => item.id === selected);
  if (place) selectPlace(place);
  else if (zoneSelect.value) focusZone();
}

initialize().catch(error => {
  console.warn(error);
  unavailable("地标数据暂未加载，当前显示模型预览");
  count.textContent = "刷新页面可重新加载地标";
});
