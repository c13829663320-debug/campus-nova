import * as THREE from "three";

export function createLabels(stage, places, onSelect) {
  const layer = document.createElement("div");
  layer.className = "map3d-labels";
  stage.container.appendChild(layer);

  const items = places.map(place => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map3d-label";
    button.dataset.category = place.category;
    button.dataset.placeId = place.id;
    button.setAttribute("aria-label", place.name);
    button.setAttribute("aria-pressed", "false");
    const index = document.createElement("span");
    index.className = "place-index";
    index.textContent = place.index;
    const name = document.createElement("span");
    name.className = "map3d-label__name";
    name.textContent = place.name;
    button.append(index, name);
    button.addEventListener("click", () => onSelect(place));
    layer.appendChild(button);
    return { button, place, anchor: new THREE.Vector3(place.x, place.height + 0.32, place.z) };
  });

  const point = new THREE.Vector3();
  function update() {
    const width = layer.clientWidth;
    const height = layer.clientHeight;
    stage.camera.updateMatrixWorld();
    items.forEach(({ button, anchor }) => {
      point.copy(anchor).project(stage.camera);
      const x = (point.x * 0.5 + 0.5) * width;
      const y = (-point.y * 0.5 + 0.5) * height;
      button.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
      button.classList.toggle("is-out", point.z > 1 || x < 12 || x > width - 12 || y < 20 || y > height);
    });
  }

  update();
  return {
    update,
    setVisiblePlaces(ids) {
      items.forEach(({ button, place }) => button.classList.toggle("is-muted", !ids.has(place.id)));
    },
    setSelected(id) {
      items.forEach(({ button, place }) => button.setAttribute("aria-pressed", String(place.id === id)));
    },
    dispose() { layer.remove(); }
  };
}
