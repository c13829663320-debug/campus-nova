/*
 * 校园 2.5D 底图叠加层
 * 数据来自 data/campus-pois.json，坐标均为底图百分比（0–100）
 */
(function () {
  "use strict";

  const ICONS = {
    "book-open": '<path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2Z"/><path d="M12 6.5v13"/>',
    activity: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8"/><path d="M15 14.5a6 6 0 0 1 5 5.5"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5Z"/><path d="M9 21v-7h6v7"/>'
  };

  const CATEGORY_META = {
    "学习成长": { color: "#3E6FA8", icon: "book-open" },
    "运动活力": { color: "#2F8F63", icon: "activity" },
    "社交活动": { color: "#C46A46", icon: "users" },
    "校园生活": { color: "#A87A2F", icon: "home" }
  };

  const CATEGORY_ORDER = ["学习成长", "运动活力", "社交活动", "校园生活"];

  const layer = document.getElementById("poi-layer");
  const legend = document.getElementById("legend");
  const statTotal = document.getElementById("stat-total");
  const statCategories = document.getElementById("stat-categories");
  const statZones = document.getElementById("stat-zones");

  const categoryChips = document.getElementById("category-chips");
  const zoneSelect = document.getElementById("zone-select");
  const searchInput = document.getElementById("poi-search");
  const filterSummary = document.getElementById("filter-summary");

  const state = { category: "all", zone: "all", query: "" };
  let markers = [];
  let total = 0;

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS["book-open"]}</svg>`;
  }

  function closeOpenTips() {
    document.querySelectorAll(".poi.is-open").forEach(function (item) {
      item.classList.remove("is-open");
    });
  }

  function createMarker(poi, index) {
    const meta = CATEGORY_META[poi.category] || CATEGORY_META["学习成长"];
    const button = document.createElement("button");

    button.type = "button";
    button.className = "poi" + (poi.minor ? " poi--minor" : "");
    button.dataset.id = poi.id;
    button.dataset.category = poi.category;
    button.dataset.zone = poi.zone;
    button.dataset.x = poi.x;
    button.dataset.y = poi.y;
    button.style.left = poi.x + "%";
    button.style.top = poi.y + "%";
    button.style.setProperty("--delay", (index % 8) * 0.3 + "s");
    button.setAttribute("aria-label", poi.name + "，" + poi.category + "，" + poi.zone);

    const pin = poi.minor
      ? '<span class="poi-pin" aria-hidden="true"></span>'
      : '<span class="poi-pin" aria-hidden="true">' + icon(meta.icon) + '</span>';

    button.innerHTML =
      pin +
      '<span class="poi-tip" role="tooltip">' +
        '<span class="tip-zone">' + poi.zone + '</span>' +
        '<strong>' + poi.name + '</strong>' +
        '<span class="tip-cat"><i></i>' + poi.category + '</span>' +
      '</span>';

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const isOpen = button.classList.contains("is-open");
      closeOpenTips();
      if (!isOpen) button.classList.add("is-open");
    });

    return button;
  }

  function renderLegend(pois) {
    const counts = pois.reduce(function (map, poi) {
      map[poi.category] = (map[poi.category] || 0) + 1;
      return map;
    }, {});

    legend.innerHTML = CATEGORY_ORDER
      .filter(function (category) { return counts[category]; })
      .map(function (category) {
        const meta = CATEGORY_META[category];
        return '<span class="legend-item" style="--poi:' + meta.color + '"><i></i>' + category + '<em>' + counts[category] + '</em></span>';
      })
      .join("");
  }

  /* 根据容器宽度切换提示卡方向，窄屏时更早向两侧翻转 */
  function applyEdgeClasses() {
    const narrow = layer.clientWidth < 640;
    const startX = narrow ? 32 : 20;
    const endX = narrow ? 68 : 84;
    const belowY = narrow ? 46 : 20;

    layer.querySelectorAll(".poi").forEach(function (button) {
      const x = Number(button.dataset.x);
      const y = Number(button.dataset.y);
      button.classList.toggle("tip-start", x <= startX);
      button.classList.toggle("tip-end", x >= endX);
      button.classList.toggle("tip-below", y <= belowY);
    });
  }

  function render(pois) {
    const fragment = document.createDocumentFragment();
    markers = pois.map(function (poi, index) {
      const marker = createMarker(poi, index);
      marker.dataset.keyword = (poi.name + " " + poi.category + " " + poi.zone).toLowerCase();
      fragment.appendChild(marker);
      return marker;
    });
    layer.appendChild(fragment);

    total = pois.length;
    statTotal.textContent = pois.length;
    statCategories.textContent = new Set(pois.map(function (poi) { return poi.category; })).size;
    statZones.textContent = new Set(pois.map(function (poi) { return poi.zone; })).size;

    renderLegend(pois);
    renderControls(pois);
    applyFilters();
    applyEdgeClasses();
  }

  /* 分类 chips：全部 + 四个分类（带各自数量） */
  function renderControls(pois) {
    const counts = pois.reduce(function (map, poi) {
      map[poi.category] = (map[poi.category] || 0) + 1;
      return map;
    }, {});

    const chips = ['<button type="button" class="chip chip-all active" data-category="all">' +
      '<i></i>全部<em>' + pois.length + '</em></button>'];

    CATEGORY_ORDER.forEach(function (category) {
      if (!counts[category]) return;
      chips.push('<button type="button" class="chip" data-category="' + category + '" style="--poi:' + CATEGORY_META[category].color + '">' +
        '<i></i>' + category + '<em>' + counts[category] + '</em></button>');
    });
    categoryChips.innerHTML = chips.join("");

    categoryChips.addEventListener("click", function (event) {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      state.category = chip.dataset.category;
      categoryChips.querySelectorAll(".chip").forEach(function (item) {
        item.classList.toggle("active", item === chip);
      });
      applyFilters();
    });

    const zones = [];
    pois.forEach(function (poi) {
      if (zones.indexOf(poi.zone) === -1) zones.push(poi.zone);
    });

    zoneSelect.innerHTML = '<option value="all">全部板块</option>' +
      zones.map(function (zone) {
        return '<option value="' + zone + '">' + zone + '</option>';
      }).join("");

    zoneSelect.addEventListener("change", function () {
      state.zone = zoneSelect.value;
      applyFilters();
    });

    searchInput.addEventListener("input", function () {
      state.query = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function applyFilters() {
    let shown = 0;

    markers.forEach(function (marker) {
      const passCategory = state.category === "all" || marker.dataset.category === state.category;
      const passZone = state.zone === "all" || marker.dataset.zone === state.zone;
      const passQuery = !state.query || marker.dataset.keyword.indexOf(state.query) !== -1;
      const pass = passCategory && passZone && passQuery;

      marker.classList.toggle("is-muted", !pass);
      if (pass) shown += 1;
    });

    filterSummary.textContent = shown === total ? "共 " + total + " 个地点" : "显示 " + shown + " / " + total;
    closeOpenTips();
  }

  function renderError(message) {
    const tip = document.createElement("p");
    tip.className = "map-error";
    tip.textContent = message;
    layer.appendChild(tip);
  }

  document.addEventListener("click", closeOpenTips);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeOpenTips();
  });

  let edgeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(edgeTimer);
    edgeTimer = window.setTimeout(applyEdgeClasses, 120);
  });

  fetch("./data/campus-pois.json")
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (pois) {
      window.CAMPUS_POIS = pois;
      render(pois);
    })
    .catch(function (error) {
      renderError("地点数据加载失败，请通过本地 HTTP 服务打开页面后重试。");
      console.error("[campus-map] POI 数据加载失败：", error);
    });
})();
