/* Campus Nova 单页交互原型：Hash 路由 + 统一事件委托 */
(function () {
  const Store = window.NovaStore;
  const API = window.NovaAPI;
  const view = document.getElementById("app-view");
  const modalRoot = document.getElementById("modal-root");
  const toastRegion = document.getElementById("toast-region");

  const ui = {
    mapFilter: "all",
    mapZoom: 1,
    activeRegion: null,
    activeBuilding: null,
    clubFilter: "all",
    clubQuery: "",
    clubCatalog: { clubs: [], categories: [], events: [] },
    forumCategory: "all",
    forumQuery: "",
    forumSort: "latest",
    forumCategories: [],
    galleryIndex: 0,
    mapData: null,
    placeData: null,
    clubData: null,
    threadData: null,
    profileDraft: null,
    activeRoute: { name: "map" }
  };
  let routeRequest = 0;
  let clubRequest = 0;
  let forumRequest = 0;
  let searchTimer = null;
  let clubSlideIndex = 0;
  let clubSlideTimer = null;
  let lastFocused = null;
  let touchStartX = null;
  let mapIntroVisible = true;

  const iconPaths = {
    "book-open": '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2V4Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7V4Z"/>',
    utensils: '<path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20M15 2v8h6V2M18 10v12"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    school: '<path d="m3 10 9-6 9 6M5 9v11h14V9M9 20v-6h6v6M2 20h20"/><path d="M12 7h.01"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8V5h5a3 3 0 0 1 3 3"/>',
    waves: '<path d="M2 6c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M2 12c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M2 18c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/>',
    store: '<path d="M3 9 5 3h14l2 6M5 13v8h14v-8M9 21v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "map-pin": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    navigation: '<path d="m3 11 19-9-9 19-2-8-8-2Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    "circle-check": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    "alert-circle": '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    sparkles: '<path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
    handshake: '<path d="m8 12-3-3 4-4 3 2 3-2 5 5-4 4M8 12l4 4 2-2M4 14l4 4M15 14l-2 2M18 15l-3 3"/>',
    crown: '<path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7ZM5 21h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    "user-plus": '<path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M19 8v6M16 11h6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    phone: '<path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>',
    camera: '<path d="M14.5 4 16 7h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4l1.5-3h5Z"/><circle cx="12" cy="14" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    ticket: '<path d="M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 0 0-6V5H2v4Z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
    lightbulb: '<path d="M9 18h6M10 22h4M8.5 15.5A7 7 0 1 1 15.5 15.5c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5ZM2 12l10 5 10-5M2 17l10 5 10-5"/>',
    "zoom-in": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4M10.5 7.5v6M7.5 10.5h6"/>',
    "zoom-out": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4M7.5 10.5h6"/>',
    "message-square": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-6.5 0-3-2-5.5-4-7.5-.7 2-1.7 3-3 4-.3-2.5-1.5-5-4-7 0 3-3 5.5-3 10.5C5 19.3 8 22 12 22Z"/>',
    "eye-off": '<path d="m3 3 18 18M10.6 10.6A2 2 0 0 0 12 14c.6 0 1.2-.3 1.6-.7"/><path d="M9.9 5.2A10 10 0 0 1 12 5c7 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.1 6.1C3.6 8 2 12 2 12s3 7 10 7c1.4 0 2.6-.2 3.7-.6"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>'
  };

  function icon(name, className = "") {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths["map-pin"]}</svg>`;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function avatarState(user) {
    if (user.avatarType === "upload" && user.avatarValue) {
      return { className: "avatar-photo", background: "", html: `<img src="${escapeHTML(user.avatarValue)}" alt="">` };
    }
    return { className: "", background: "", html: escapeHTML(user.initial) };
  }

  function avatarMarkup(user, className = "") {
    const state = avatarState(user);
    const style = state.background ? ` style="background:${state.background}"` : "";
    return `<span class="avatar ${className} ${state.className}"${style}>${state.html}</span>`;
  }

  function applyAvatar(element, user) {
    if (!element) return;
    const state = avatarState(user);
    element.classList.remove("avatar-photo");
    if (state.className) element.classList.add(state.className);
    element.style.background = state.background;
    element.innerHTML = state.html;
  }

  function maskPhone(phone) {
    return phone ? phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") : "";
  }

  function syncShellProfile() {
    const profile = Store.getProfile();
    document.querySelectorAll("[data-shell-avatar]").forEach(element => applyAvatar(element, profile));
    document.querySelectorAll("[data-shell-name]").forEach(element => { element.textContent = profile.name; });
    document.querySelectorAll("[data-shell-meta]").forEach(element => { element.textContent = `${profile.grade} · ${profile.verified ? "已认证" : "未认证"}`; });
  }

  function parseRoute() {
    const [name = "map", id] = (location.hash.slice(1) || "map").split("/");
    return { name, id };
  }

  function applyTheme() {
    const theme = Store.state.theme;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#04101E" : "#E7F3FD";
    if (window.NovaSky) window.NovaSky.setTheme(theme);
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(button => {
      button.setAttribute("aria-label", theme === "dark" ? "切换浅色主题" : "切换深色主题");
    });
    document.querySelectorAll("[data-theme-switch]").forEach(toggle => toggle.classList.toggle("on", theme === "dark"));
  }

  function updateShell(route) {
    const activeNav = route.name === "place" ? "map" : route.name === "club" ? "clubs" : route.name === "thread" ? "forum" : ["map", "forum", "clubs", "me"].includes(route.name) ? route.name : "map";
    document.body.dataset.page = activeNav;
    document.body.classList.toggle("map-intro", route.name === "map" && mapIntroVisible);
    document.querySelectorAll("[data-nav]").forEach(link => {
      if (link.dataset.nav === activeNav) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    let meta = {
      eyebrow: "DGPT CAMPUS ATLAS · 校本部",
      title: "东莞职业技术学院",
      subtitle: "一湖映月，楼宇相连。点击地标，开始你的校园探索。",
      documentTitle: "校本部 2.5D 校园地图"
    };
    if (route.name === "place") {
      const place = Store.getPlace(route.id);
      meta = { eyebrow: "SPACE DISCOVERY · 空间破茧", title: place ? place.name : "地点探索", subtitle: "看见实景，也遇见此刻同路的人。", documentTitle: place ? place.name : "地点探索" };
    } else if (route.name === "clubs") {
      meta = { eyebrow: "CLUB MATRIX · 同好宇宙", title: "让热爱，找到它的组织", subtitle: "从一次活动开始，认识一群志同道合的人。", documentTitle: "社团招新" };
    } else if (route.name === "forum") {
      meta = { eyebrow: "CAMPUS TALK · 校园论坛", title: "校园论坛", subtitle: "吃瓜、吐槽、树洞和求助，说点课堂外的事。", documentTitle: "校园论坛" };
    } else if (route.name === "thread") {
      const post = Store.getForumPost(route.id);
      meta = { eyebrow: "CAMPUS TALK · 话题讨论", title: "话题讨论", subtitle: "先听完，再开口。让每一种校园生活都被认真对待。", documentTitle: post ? post.title : "话题讨论" };
    } else if (route.name === "club") {
      const club = ui.clubData && ui.clubData.id === route.id ? ui.clubData : null;
      meta = { eyebrow: "CLUB PROFILE · 社团活动室", title: club ? club.name : "社团详情", subtitle: "先了解，再勇敢地迈出第一步。", documentTitle: club ? club.name : "社团详情" };
    } else if (route.name === "me") {
      meta = { eyebrow: "MY NOVA · 探索档案", title: "每一步，都在点亮星图", subtitle: "收藏足迹、组局和大学生活中的小小成就。", documentTitle: "我的星图" };
    }
    document.getElementById("page-eyebrow").textContent = meta.eyebrow;
    document.getElementById("page-title").textContent = meta.title;
    document.getElementById("page-subtitle").textContent = meta.subtitle;
    document.title = `${meta.documentTitle} · 星图校园`;
  }

  function loadingTemplate(type) {
    if (type === "clubs") {
      return `<div class="view-enter"><div class="skeleton" style="height:270px;border-radius:28px"></div><div class="section-block"><div class="club-grid">${Array(3).fill('<div class="card loading-card"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton" style="width:70%"></div></div>').join("")}</div></div></div>`;
    }
    if (type === "forum") {
      return `<div class="view-enter"><div class="skeleton" style="height:260px;border-radius:28px"></div><div class="section-block forum-loading">${Array(3).fill('<div class="card loading-card"><div class="skeleton"></div><div class="skeleton" style="width:85%"></div><div class="skeleton" style="width:60%"></div></div>').join("")}</div></div>`;
    }
    if (type === "thread") {
      return `<div class="view-enter"><div class="skeleton" style="height:44px;width:220px;border-radius:12px"></div><div class="skeleton" style="height:320px;margin-top:18px;border-radius:24px"></div></div>`;
    }
    return `<div class="view-enter"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-map"></div></div>`;
  }

  function errorTemplate(error) {
    return `<div class="error-state view-enter">${icon("alert-circle")}<h2>这颗星球暂时迷路了</h2><p>${escapeHTML(error.message || "内容加载失败，请再试一次。")}</p><button class="button" data-action="retry-route">重新加载</button><a class="text-button" href="#map">返回星图首页</a></div>`;
  }

  async function handleRoute() {
    const request = ++routeRequest;
    const route = parseRoute();
    stopClubCarousel();
    ui.activeRoute = route;
    ui.galleryIndex = 0;
    closeModal(false);
    updateShell(route);
    view.innerHTML = loadingTemplate(route.name);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    try {
      if (route.name === "map") {
        const mapBundle = await API.fetchMap();
        if (request !== routeRequest) return;
        ui.mapData = mapBundle;
        view.innerHTML = renderMap();
        requestAnimationFrame(() => {
          applyMapFocus();
          syncChinaNode();
        });
      } else if (route.name === "place") {
        const [place, groups] = await Promise.all([API.fetchPlace(route.id), API.fetchGroups(route.id)]);
        if (request !== routeRequest) return;
        ui.placeData = { place, groups };
        updateShell(route);
        view.innerHTML = renderPlace();
      } else if (route.name === "forum") {
        const [posts, categories] = await Promise.all([
          API.fetchForumPosts({ category: ui.forumCategory, query: ui.forumQuery, sort: ui.forumSort }),
          API.fetchForumCategories()
        ]);
        if (request !== routeRequest) return;
        ui.forumCategories = categories;
        view.innerHTML = renderForum(posts);
      } else if (route.name === "thread") {
        const post = await API.fetchForumPost(route.id);
        if (request !== routeRequest) return;
        ui.threadData = post;
        updateShell(route);
        view.innerHTML = renderThread(post);
      } else if (route.name === "clubs") {
        const [clubs, catalog] = await Promise.all([
          API.fetchClubs({ query: ui.clubQuery, category: ui.clubFilter }),
          API.fetchClubCatalog()
        ]);
        if (request !== routeRequest) return;
        ui.clubCatalog = catalog;
        view.innerHTML = renderClubs(clubs);
        startClubCarousel();
      } else if (route.name === "club") {
        const club = await API.fetchClub(route.id);
        if (request !== routeRequest) return;
        ui.clubData = club;
        updateShell(route);
        view.innerHTML = renderClubDetail(club);
      } else if (route.name === "me") {
        const profile = await API.fetchProfile();
        if (request !== routeRequest) return;
        view.innerHTML = renderProfile(profile);
        applyTheme();
      } else {
        throw new Error("这个页面不在当前星图中，请从主导航继续探索。");
      }
    } catch (error) {
      if (request === routeRequest) view.innerHTML = errorTemplate(error);
    }
  }

  function groupCard(group) {
    const place = Store.getPlace(group.placeId);
    const profile = Store.getProfile();
    const isMine = group.hostId === profile.id;
    const remaining = Math.max(group.total - group.joined, 0);
    let button = `<button class="button button-small" data-action="join-group" data-id="${group.id}">加入组局 ${icon("plus")}</button>`;
    if (group.isOwner) button = `<button class="button button-small button-ghost" disabled>我发起的</button>`;
    else if (group.isJoined) button = `<button class="button button-small button-outline" data-action="leave-group" data-id="${group.id}">退出组局</button>`;
    else if (remaining === 0) button = `<button class="button button-small button-ghost" disabled>已经满员</button>`;

    return `<article class="group-card card">
      <div class="group-top">
        ${isMine ? avatarMarkup(profile, "host-avatar") : `<span class="avatar host-avatar">${escapeHTML(group.hostInitial)}</span>`}
        <div class="host-info"><strong>${escapeHTML(isMine ? profile.name : group.host)}</strong><span>${escapeHTML(group.hostMajor)}</span></div>
        <span class="tag tag-secondary">${escapeHTML(group.category)}</span>
      </div>
      <h3>${escapeHTML(group.title)}</h3>
      <p class="group-description">${escapeHTML(group.description)}</p>
      <div class="group-meta">
        <span>${icon("clock")}${escapeHTML(group.time)} · ${escapeHTML(group.duration)}</span>
        <span>${icon("map-pin")}<a href="#place/${group.placeId}">${escapeHTML(place ? place.name : "校园地点")}</a></span>
      </div>
      <div class="group-footer">
        <div class="seat-info"><span>${group.joined}/${group.total} 人已加入</span><small>${remaining ? `还差 ${remaining} 人` : "全员就位"}</small></div>
        ${button}
      </div>
    </article>`;
  }

  /* 全国校园星网：中国版图 + 东莞职业技术学院定位点 */
  function renderChinaMap() {
    const map = window.ChinaMap;
    if (!map) return "";
    const { home, nodes, outline, viewBox } = map;
    const curve = (a, b) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const k = len * 0.16;
      const cx = (a.x + b.x) / 2 - (dy / len) * k;
      const cy = (a.y + b.y) / 2 + (dx / len) * k;
      return `<path d="M${a.x} ${a.y}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}"/>`;
    };

    const links = [];
    nodes.forEach((node, index) => {
      let nearest = -1;
      let min = Infinity;
      nodes.forEach((other, j) => {
        if (j === index) return;
        const d = Math.hypot(node.x - other.x, node.y - other.y);
        if (d < min) { min = d; nearest = j; }
      });
      if (nearest > index) links.push(curve(node, nodes[nearest]));
    });
    [...nodes]
      .sort((a, b) => Math.hypot(a.x - home.x, a.y - home.y) - Math.hypot(b.x - home.x, b.y - home.y))
      .slice(0, 5)
      .forEach(node => links.push(curve(home, node)));

    return `<svg class="china-map" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden="true">
      <path class="china-land" d="${outline}"/>
      <path class="china-outline" d="${outline}"/>
      <g class="china-links">${links.join("")}</g>
      <g class="china-dots">${nodes.map(node => `<circle class="china-dot-halo" cx="${node.x}" cy="${node.y}" r="7.5"/><circle cx="${node.x}" cy="${node.y}" r="3"/>`).join("")}</g>
    </svg>`;
  }

  function syncChinaNode() {
    const stage = view.querySelector(".china-stage");
    const svg = view.querySelector(".china-map");
    const node = view.querySelector(".nova-node");
    if (!stage || !svg || !node || !window.ChinaMap) return;
    const parts = window.ChinaMap.viewBox.split(" ");
    const vw = Number(parts[2]);
    const vh = Number(parts[3]);
    const rect = svg.getBoundingClientRect();
    const host = stage.getBoundingClientRect();
    const scale = Math.min(rect.width / vw, rect.height / vh);
    const offsetX = rect.left - host.left + (rect.width - vw * scale) / 2;
    const offsetY = rect.top - host.top + (rect.height - vh * scale) / 2;
    const cx = offsetX + window.ChinaMap.home.x * scale;
    const cy = offsetY + window.ChinaMap.home.y * scale;
    node.style.left = `${cx.toFixed(1)}px`;
    node.style.top = `${cy.toFixed(1)}px`;

    const beam = view.querySelector(".china-beam path");
    const card = view.querySelector(".nova-hero-card");
    if (!beam || !card) return;
    const cb = card.getBoundingClientRect();
    const overlapped = cb.left < host.right - 6 && cb.top < host.bottom - 6;
    if (!overlapped) { beam.removeAttribute("d"); return; }
    const x2 = cb.left - host.left + 4;
    const y2 = cb.top - host.top + 28;
    const midX = (cx + x2) / 2;
    const midY = (cy + y2) / 2 + Math.abs(x2 - cx) * 0.14;
    beam.setAttribute("d", `M${cx.toFixed(1)} ${cy.toFixed(1)}Q${midX.toFixed(1)} ${midY.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }

  function renderMapIntro() {
    const { places = [], groups = [] } = ui.mapData;
    return `<div class="nova-intro view-enter">
      <section class="nova-hero" aria-label="星图校园 · 前言">
        <div class="nova-hero-media" aria-hidden="true">
          <img class="nova-hero-bg is-light" src="assets/hero/atlas-day.jpg?v=4" alt="" decoding="async" fetchpriority="high">
          <img class="nova-hero-bg is-dark" src="assets/hero/atlas-night.jpg?v=4" alt="" decoding="async">
        </div>

        <div class="nova-hero-inner">
          <div class="nova-hero-copy">
            <a class="nova-hero-brand" href="#map" aria-label="星图校园">
              <span class="nova-hero-mark"><img src="assets/logo-mark.svg?v=2" width="52" height="52" alt=""></span>
              <span class="nova-hero-brand-copy"><strong>星图校园</strong><small>一站聚合 · 连接校园</small></span>
            </a>

            <div class="nova-hero-divider" aria-hidden="true"></div>

            <p class="nova-hero-lead">在星图，发现你的学校，<br>连接更多校园生活。</p>

            <div class="nova-hero-quick" aria-label="快速入口">
              <button class="nova-quick" type="button" data-action="enter-campus-map">${icon("map-pin")}<span>校园地图</span></button>
              <button class="nova-quick" type="button" data-action="enter-campus-map" data-target="groups">${icon("users")}<span>活动组队</span></button>
              <a class="nova-quick" href="#forum">${icon("message-square")}<span>校园论坛</span></a>
              <a class="nova-quick" href="#clubs">${icon("star")}<span>社团介绍</span></a>
            </div>

            <button class="nova-hero-scroll" type="button" data-action="enter-campus-map">
              <span class="scroll-track" aria-hidden="true"><i></i></span>
              向下探索更多
            </button>
          </div>

          <div class="nova-hero-visual">
            <div class="nova-hero-stage">
              <div class="china-stage">
                ${renderChinaMap()}
                <svg class="china-beam" aria-hidden="true"><path d=""/></svg>
                <button class="nova-node" type="button" data-action="enter-campus-map" aria-label="进入东莞职业技术学院校园地图">
                  <span class="nova-node-halo" aria-hidden="true"></span>
                  <span class="nova-node-halo is-delayed" aria-hidden="true"></span>
                  <span class="nova-node-core" aria-hidden="true"></span>
                  <span class="nova-node-label"><strong>东莞职业技术学院</strong>${icon("chevron-right")}</span>
                </button>
              </div>
            </div>

            <div class="nova-hero-card">
              <div class="nova-card-head">
                <img class="nova-card-badge" src="assets/dgpt-badge.png?v=1" alt="东莞职业技术学院校徽">
                <div><strong>东莞职业技术学院</strong><span>${icon("map-pin")}东莞市 · 松山湖</span></div>
              </div>
              <p class="nova-card-note">${icon("layers")}${places.length} 个校园地标 · 此刻 ${groups.length} 场组局</p>
              <button class="nova-card-btn" type="button" data-action="enter-campus-map">进入校园 ${icon("arrow-right")}</button>
            </div>
          </div>
        </div>
      </section>
    </div>`;
  }

  /* 等距底图片区：坐标与缩放均按底图百分比标定 */
  const MAP_REGIONS = [
    { id: "all", name: "全图总览", color: "#315F58", x: 49, y: 49, zoom: 1 },
    { id: "nw", name: "西北湖景", color: "#4FA79B", x: 33, y: 34, zoom: 1.7 },
    { id: "ne", name: "东北宿舍", color: "#CE8B6B", x: 72, y: 26, zoom: 1.6 },
    { id: "sw", name: "西南教学", color: "#6E93B8", x: 30, y: 64, zoom: 1.6 },
    { id: "se", name: "东南运动", color: "#76A97C", x: 78, y: 62, zoom: 1.6 }
  ];

  function regionMeta(id) {
    return MAP_REGIONS.find(item => item.id === id) || MAP_REGIONS[0];
  }

  function activeRegionMeta() {
    return regionMeta(ui.activeRegion || "all");
  }

  function activeBuilding() {
    const buildings = (ui.mapData && ui.mapData.buildings) || [];
    return buildings.find(item => item.id === ui.activeBuilding) || null;
  }

  function buildingGuideCard(buildings) {
    const rows = MAP_REGIONS.filter(item => item.id !== "all").map(item => {
      const count = buildings.filter(building => building.region === item.id).length;
      return `<button class="building-guide-row" data-action="filter-region" data-id="${item.id}" style="--rc:${item.color}"><i></i><span>${item.name}</span><strong>${count}</strong></button>`;
    }).join("");
    return `<section class="discovery-card card building-guide">
      <span class="eyebrow">BUILDING ATLAS · 等距建筑图鉴</span>
      <h2>${buildings.length} 栋建筑，一栋一档</h2>
      <p>从等距校园底图拆出的建筑单元，点击地图热点即可查看楼层、片区与形态说明。</p>
      <div class="building-guide-list">${rows}</div>
      <p class="building-guide-note">${icon("info")}建筑单元为底图矢量近似重建，被遮挡的背面未复原。</p>
    </section>`;
  }

  function buildingCard(building) {
    const region = regionMeta(building.region);
    const place = building.placeId ? Store.getPlace(building.placeId) : null;
    return `<section class="building-card card" style="--rc:${region.color}">
      <div class="building-card-media">
        <img src="assets/buildings/${building.file}" alt="${escapeHTML(building.name)}的等距建筑单元" decoding="async">
        <button class="building-card-close" type="button" data-action="close-building" aria-label="关闭建筑档案">${icon("x")}</button>
        <span class="building-card-tag">${building.id}</span>
      </div>
      <div class="building-card-body">
        <span class="eyebrow">${region.name} · ISOMETRIC UNIT</span>
        <h2>${escapeHTML(building.name)}</h2>
        <div class="building-meta">
          <span>${icon("layers")}约 ${building.floors} 层</span>
          <span>${icon("map-pin")}${region.name}</span>
          <span>矢量近似</span>
        </div>
        <p>${escapeHTML(building.note)}</p>
        ${place
          ? `<a class="building-link" href="#place/${place.id}">${icon("arrow-right")}前往 ${escapeHTML(place.name)}</a>`
          : `<div class="building-note">${icon("info")}点击其他热点，继续查看建筑档案。</div>`}
      </div>
    </section>`;
  }

  function renderMap() {
    if (mapIntroVisible) return renderMapIntro();
    const { places, groups, buildings = [], pois = [] } = ui.mapData;
    const selectedBuilding = activeBuilding();
    const defaultPlaceId = (places[0] || {}).id || "";
    const mapTypes = [
      { id: "all", label: "全部地点" },
      { id: "teach", label: "教学楼" },
      { id: "dorm", label: "宿舍" },
      { id: "life", label: "生活服务" },
      { id: "other", label: "其他" }
    ];
    const categories = mapTypes.map(type => `<button class="chip ${ui.mapFilter === type.id ? "active" : ""}" data-action="filter-map" data-filter="${type.id}">${type.label}</button>`).join("");
    const buildingPins = (ui.activeRegion ? buildings.filter(building => building.region === ui.activeRegion) : []).map(building => {
      const active = selectedBuilding && selectedBuilding.id === building.id;
      const color = regionMeta(building.region).color;
      return `<button class="building-pin ${active ? "is-active" : ""}" style="left:${building.x}%;top:${building.y}%;--rc:${color}" data-action="select-building" data-id="${building.id}" aria-pressed="${active ? "true" : "false"}" aria-label="查看${escapeHTML(building.name)}建筑档案">
        <span class="building-pin-dot" aria-hidden="true"></span>
        <span class="building-pin-name">${escapeHTML(building.name)}</span>
      </button>`;
    }).join("");
    const poiTypes = {
      teach: { label: "教学楼", color: "#3E6FA8", bg: "#EAF2FB" },
      dorm: { label: "宿舍", color: "#2F8F63", bg: "#E8F5EC" },
      life: { label: "生活服务", color: "#C9762F", bg: "#FDF1E3" },
      other: { label: "其他", color: "#7A5AA6", bg: "#F1ECFA" }
    };
    const poiPins = pois.map(poi => {
      const type = poiTypes[poi.type] || poiTypes.other;
      const dimmed = ui.mapFilter !== "all" && poi.type !== ui.mapFilter;
      const action = poi.placeId ? `data-action="open-place" data-id="${poi.placeId}"` : `data-action="toggle-poi"`;
      return `<button class="map-pill ${dimmed ? "is-dimmed" : ""}" style="left:${poi.x}%;top:${poi.y}%;--pc:${type.color};--pb:${type.bg}" ${action} data-type="${poi.type}" aria-label="${escapeHTML(poi.name)}，${type.label}，${poi.zone}">
        <span class="map-pill-text">${escapeHTML(poi.name)}</span>
        <span class="map-pill-tip" role="tooltip"><em>${poi.zone}</em><strong>${escapeHTML(poi.name)}</strong><small>${type.label}</small></span>
      </button>`;
    }).join("");
    const zoneBar = `<div class="map-zone-bar" aria-label="建筑片区">
      ${MAP_REGIONS.map(item => {
        const count = item.id === "all" ? buildings.length : buildings.filter(building => building.region === item.id).length;
        const active = (ui.activeRegion || "all") === item.id;
        return `<button class="zone-tab ${active ? "active" : ""}" data-action="filter-region" data-id="${item.id}" style="--zc:${item.color}"><i></i><span>${item.name}</span><small>${count}</small></button>`;
      }).join("")}
    </div>`;
    const upcoming = groups.slice(0, 2).map(group => {
      const place = Store.getPlace(group.placeId);
      return `<div class="mini-event"><div class="event-date"><strong>${escapeHTML(group.day)}</strong><span>${escapeHTML(group.month)}</span></div><div><h4>${escapeHTML(group.title)}</h4><p>${escapeHTML(group.time)} · ${escapeHTML(place ? place.name : "校园地点")}</p><a href="#place/${group.placeId}">查看组局 ${icon("arrow-right")}</a></div></div>`;
    }).join("");

    const zoomMax = 2.4;
    const mapStage = `<div class="campus-map-stage is-iso" style="transform:scale(${ui.mapZoom})"><img class="map-photo is-iso" src="assets/campus-bg.jpg?v=2" alt="东莞职业技术学院校本部等距校园地图" draggable="false" decoding="async" fetchpriority="high">${buildingPins}${poiPins}</div>`;
    const mapControls = `<div class="map-zoom-controls" aria-label="地图缩放控制">
      <button type="button" data-action="map-zoom-in" aria-label="放大地图" title="放大" ${ui.mapZoom >= zoomMax ? "disabled" : ""}>${icon("zoom-in")}</button>
      <button type="button" data-action="map-zoom-out" aria-label="缩小地图" title="缩小" ${ui.mapZoom <= 1 ? "disabled" : ""}>${icon("zoom-out")}</button>
      <button type="button" data-action="map-zoom-reset" aria-label="重置地图视图" title="重置视图">${icon("rotate-ccw")}</button>
    </div>`;

    return `<div class="view-enter">
      <div class="map-layout stagger">
        <section class="map-card card" aria-label="校园探索地图">
          <div class="map-toolbar">
            <div class="filter-chips" aria-label="地点分类">${categories}</div>
            <span class="map-scale">${icon("navigation")}${pois.length} 个地点 · 4 类标注</span>
          </div>
          <div class="map-frame">
            <div class="map-scroll">
              <div class="campus-map is-iso" data-region="${ui.activeRegion || "all"}">
                ${mapStage}
                <div class="map-campus-badge" aria-hidden="true"><span>等距</span><div><strong>东莞职业技术学院</strong><small>校本部 · 地点导览</small></div></div>
                <div class="map-distance" aria-hidden="true"><i></i><span>等距插画</span></div>
              </div>
            </div>
            ${mapControls}
          </div>
          ${zoneBar}
          <div class="map-caption">
            <div class="map-legend"><span><i class="legend-dot" style="--lc:#3E6FA8;--lb:#EAF2FB"></i>教学楼</span><span><i class="legend-dot" style="--lc:#2F8F63;--lb:#E8F5EC"></i>宿舍</span><span><i class="legend-dot" style="--lc:#C9762F;--lb:#FDF1E3"></i>生活服务</span><span><i class="legend-dot" style="--lc:#7A5AA6;--lb:#F1ECFA"></i>其他</span></div>
            <span>底图：校本部等距插画 · 点击标签查看所属板块${ui.activeRegion ? " · 当前片区已显示建筑热点" : ""}</span>
          </div>
        </section>
        <aside class="map-side">
          ${selectedBuilding ? buildingCard(selectedBuilding) : buildingGuideCard(buildings)}
          <section class="next-card card"><div class="next-card-header"><h3>接下来，去哪儿？</h3><span class="live-label">实时</span></div>${upcoming}</section>
        </aside>
      </div>
      <section class="section-block">
        <div class="section-heading"><div><span class="eyebrow">校园现场</span><h2>此刻，校园正在发生</h2><p>按地点找到搭子，不再让需求淹没在群聊里。</p></div><button class="text-button" data-action="open-create-group" data-place="${defaultPlaceId}">发起我的组局 ${icon("plus")}</button></div>
        <div class="group-preview-grid stagger">${groups.slice(0, 3).map(groupCard).join("")}</div>
      </section>
    </div>`;
  }

  function applyMapFocus() {
    const stage = document.querySelector(".campus-map-stage");
    if (!stage) return;
    const region = activeRegionMeta();
    const focus = region.id !== "all" ? { x: region.x, y: region.y } : null;
    const scale = ui.mapZoom;
    const tx = focus ? -(focus.x / 100 - 0.5) * scale * 100 : 0;
    const ty = focus ? -(focus.y / 100 - 0.5) * scale * 100 : 0;
    stage.style.transform = `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${scale.toFixed(3)})`;
    stage.style.setProperty("--spot-scale", (1 / scale).toFixed(3));
  }

  function updateMapZoom(nextZoom) {
    ui.mapZoom = Math.min(2.4, Math.max(1, Math.round(nextZoom * 10) / 10));
    applyMapFocus();
    document.querySelectorAll('[data-action="map-zoom-in"]').forEach(button => { button.disabled = ui.mapZoom >= 2.4; });
    document.querySelectorAll('[data-action="map-zoom-out"]').forEach(button => { button.disabled = ui.mapZoom <= 1; });
  }

  function enterCampusMap(target = "") {
    const hero = view.querySelector(".nova-hero");
    const reveal = () => {
      mapIntroVisible = false;
      document.body.classList.remove("map-intro");
      view.innerHTML = renderMap();
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      requestAnimationFrame(applyMapFocus);
      if (target === "groups") {
        const section = view.querySelector(".group-preview-grid");
        if (section) requestAnimationFrame(() => section.scrollIntoView({ behavior: "smooth", block: "center" }));
      }
    };
    if (!hero) {
      reveal();
      return;
    }
    hero.classList.add("is-leaving");
    setTimeout(reveal, 240);
  }

  function renderPlace() {
    const { place, groups } = ui.placeData;
    const lit = Store.state.litPlaceIds.includes(place.id);
    const index = Math.max(0, Math.min(ui.galleryIndex, place.images.length - 1));
    ui.galleryIndex = index;
    const guideContent = place.menu.length ? `
      <section class="guide-card card"><div class="card-heading"><h3>${icon("utensils")}今日特色菜单</h3><span>档口状态实时更新</span></div><div class="menu-list">${place.menu.map(item => `<div class="menu-item"><span class="menu-icon">${icon("utensils")}</span><div><strong>${item.name}</strong><small>${item.stall} · ${item.status}</small></div><span class="menu-price">${item.price}</span></div>`).join("")}</div></section>
      <section class="guide-card card"><div class="card-heading"><h3>${icon("lightbulb")}学长学姐的隐藏攻略</h3><span>${place.tips.length} 条实用经验</span></div><div class="tip-list">${place.tips.map((tip, i) => `<div class="tip-item"><span class="tip-number">0${i + 1}</span><div><strong>${tip.title}</strong><p>${tip.text}</p></div></div>`).join("")}</div></section>` : `
      <section class="guide-card card"><div class="card-heading"><h3>${icon("lightbulb")}学长学姐的隐藏攻略</h3><span>${place.tips.length} 条实用经验</span></div><div class="tip-list">${place.tips.map((tip, i) => `<div class="tip-item"><span class="tip-number">0${i + 1}</span><div><strong>${tip.title}</strong><p>${tip.text}</p></div></div>`).join("")}</div></section>`;
    const groupContent = groups.length ? `<div class="group-list">${groups.map(groupCard).join("")}</div>` : `<div class="empty-state">${icon("users")}<h3>这里还很安静</h3><p>成为第一个发起组局的人，让同好知道你现在想做什么。</p><button class="button button-small" data-action="open-create-group" data-place="${place.id}">${icon("plus")}发起第一场组局</button></div>`;

    return `<div class="view-enter">
      <nav class="breadcrumb" aria-label="面包屑"><a href="#map">${icon("arrow-left")}返回星图</a><span>/</span><span>${place.categoryLabel}</span><span>/</span><strong>${place.name}</strong></nav>
      <div class="place-hero stagger">
        <div class="place-gallery" aria-label="${place.name}实景画廊">
          <img src="${place.images[index]}" alt="${place.name} · ${place.imageLabels[index]}" decoding="async" fetchpriority="high">
          <div class="gallery-shade"></div><span class="gallery-label">${icon("camera")}实景 · ${place.imageLabels[index]}</span>
          <div class="gallery-dots">${place.images.map((_, i) => `<button class="gallery-dot ${i === index ? "active" : ""}" data-action="gallery-goto" data-index="${i}" aria-label="查看第 ${i + 1} 张实景"></button>`).join("")}</div>
          <div class="gallery-controls"><button class="icon-button" data-action="gallery-prev" aria-label="上一张实景">${icon("chevron-left")}</button><span class="gallery-count">${index + 1} / ${place.images.length}</span><button class="icon-button" data-action="gallery-next" aria-label="下一张实景">${icon("chevron-right")}</button></div>
        </div>
        <section class="place-summary card">
          <div class="place-summary-top"><span class="tag tag-primary">${place.categoryLabel}</span><span class="status-pill">${place.open ? "当前开放" : "暂未开放"}</span></div>
          <h2>${place.name}</h2><p class="place-en">${place.en}</p><p class="place-description">${place.description}</p>
          <div class="place-facts"><div>${icon("clock")}开放时间 · ${place.hours}</div><div>${icon("navigation")}${place.distance} · 从当前位置出发</div><div>${icon("users")}当前有 ${groups.reduce((sum, group) => sum + group.joined, 0)} 位同学已加入组局</div></div>
          ${lit ? `<div class="checkin-success">${icon("circle-check")}已点亮此地，探索积分已收入档案</div>` : ""}
          <div class="place-actions" style="margin-top:16px"><button class="button ${lit ? "button-ghost" : "button-secondary"}" data-action="check-in" data-id="${place.id}" ${lit ? "disabled" : ""}>${icon(lit ? "check" : "map-pin")}${lit ? "已完成打卡" : "实景打卡 +20"}</button><button class="button" data-action="open-create-group" data-place="${place.id}">${icon("plus")}一键组局</button></div>
        </section>
      </div>
      <div class="detail-grid">
        <div class="detail-main">${guideContent}<section class="groups-panel card"><div class="card-heading"><h3>${icon("users")}这里的实时搭子</h3><span class="live-label">${groups.length} 场组局</span></div>${groupContent}</section></div>
        <aside class="detail-aside">
          <section class="next-card card"><div class="next-card-header"><h3>地点速览</h3><span class="tag">NOVA GUIDE</span></div><div class="compact-list"><div class="compact-list-item">${icon("map-pin")}<div><strong>空间锚点社交</strong><small>只看与当前地点相关的组局</small></div></div><div class="compact-list-item">${icon("shield-check")}<div><strong>本校实名认证</strong><small>发布者均通过学生身份核验</small></div></div><div class="compact-list-item">${icon("camera")}<div><strong>真实场景共创</strong><small>实景与攻略由同学持续更新</small></div></div></div></section>
          ${place.sponsor ? `<section class="sponsor-card card"><span class="sponsor-label">${icon("ticket")}LBS 场景福利</span><h3>${place.sponsor.title}</h3><p>${place.sponsor.text}</p><button class="button button-small" data-action="show-sponsor" data-place="${place.id}">${place.sponsor.action} ${icon("arrow-right")}</button></section>` : ""}
        </aside>
      </div>
    </div>`;
  }

  function changeGallery(direction) {
    if (!ui.placeData) return;
    const total = ui.placeData.place.images.length;
    ui.galleryIndex = (ui.galleryIndex + direction + total) % total;
    view.innerHTML = renderPlace();
  }

  async function handleJoin(groupId, leave, button) {
    button.disabled = true;
    const original = button.innerHTML;
    button.textContent = leave ? "退出中…" : "加入中…";
    try {
      const group = leave ? await API.leaveGroup(groupId) : await API.joinGroup(groupId);
      showToast(leave ? "已退出组局" : "成功加入组局", leave ? "可以继续在星图中寻找其他同好。" : `${group.time} · ${(Store.getPlace(group.placeId) || {}).name || "校园地点"}，记得准时赴约。`);
      if (ui.activeRoute.name === "map" && ui.mapData) {
        ui.mapData.groups = await API.fetchGroups();
        view.innerHTML = renderMap();
      } else if (ui.activeRoute.name === "place" && ui.placeData) {
        ui.placeData.groups = await API.fetchGroups(ui.placeData.place.id);
        view.innerHTML = renderPlace();
      }
    } catch (error) {
      showToast("暂时无法完成操作", error.message, "error");
      button.disabled = false;
      button.innerHTML = original;
    }
  }

  async function handleCheckIn(placeId, button) {
    button.disabled = true;
    button.textContent = "正在确认位置…";
    try {
      const result = await API.checkIn(placeId);
      const place = Store.getPlace(placeId);
      showToast(result.isNew ? `点亮${place.name} · +20 积分` : "这个地点已经点亮", result.isNew ? "新的校园足迹已写入你的探索档案。" : "去其他地点继续探索吧。");
      if (ui.activeRoute.name === "place") view.innerHTML = renderPlace();
    } catch (error) {
      showToast("打卡未完成", error.message, "error");
      button.disabled = false;
      button.innerHTML = `${icon("map-pin")}实景打卡 +20`;
    }
  }

  function openModal(content, small = false) {
    lastFocused = document.activeElement;
    modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-backdrop><section class="modal ${small ? "modal-small" : ""}" role="dialog" aria-modal="true"><div class="modal-handle"></div>${content}</section></div>`;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
      const target = modalRoot.querySelector("input, select, textarea, button");
      if (target) target.focus();
    });
  }

  function closeModal(restoreFocus = true) {
    if (!modalRoot.firstChild) return;
    modalRoot.innerHTML = "";
    document.body.classList.remove("modal-open");
    if (restoreFocus && lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  function modalHeader(eyebrow, title, subtitle) {
    return `<div class="modal-header"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><p>${subtitle}</p></div><button class="icon-button" data-action="close-modal" aria-label="关闭弹层">${icon("x")}</button></div>`;
  }

  function fieldError(name) {
    return `<p class="field-error" data-error-for="${name}"></p>`;
  }

  function formatDateTimeValue(date) {
    const pad = number => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function defaultDateTime() {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    date.setHours(19, 0, 0, 0);
    return formatDateTimeValue(date);
  }

  function openGroupModal(placeId) {
    const place = Store.getPlace(placeId);
    if (!place) return;
    const category = place.category === "sports" ? "运动" : place.category === "study" ? "自习" : place.id === "cafeteria" ? "饭搭子" : "兴趣社交";
    const categoryOptions = [...new Set([category, "运动", "自习", "饭搭子", "桌游", "兴趣社交"])].map(option => `<option>${option}</option>`).join("");
    openModal(`${modalHeader("CREATE A MEETUP", "一键发起组局", `组局将绑定到 ${place.name}，只对同场景同学展示。`)}
      <form id="group-form" data-place="${place.id}" novalidate>
        <div class="form-note">${icon("shield-check")}你已通过校园实名认证。请发布真实、健康的校园活动，商业推广将被过滤。</div>
        <div class="field"><label for="group-title">想做什么？<span> *</span></label><input id="group-title" name="title" maxlength="30" placeholder="例如：今晚飞盘，新手友好局">${fieldError("title")}</div>
        <div class="form-row"><div class="field"><label for="group-category">活动类型<span> *</span></label><select id="group-category" name="category">${categoryOptions}</select>${fieldError("category")}</div><div class="field"><label for="group-time">集合时间<span> *</span></label><input id="group-time" name="time" type="datetime-local" value="${defaultDateTime()}" min="${formatDateTimeValue(new Date())}">${fieldError("time")}</div></div>
        <div class="form-row"><div class="field"><label for="group-total">希望人数<span> *</span></label><input id="group-total" name="total" type="number" min="2" max="20" value="4" inputmode="numeric"><p class="field-hint">包含你自己，2–20 人</p>${fieldError("total")}</div><div class="field"><label for="group-duration">预计时长</label><select id="group-duration" name="duration"><option>约 1 小时</option><option>约 1.5 小时</option><option>约 2 小时</option><option>约 3 小时</option></select>${fieldError("duration")}</div></div>
        <div class="field"><label for="group-description">补充说明<span> *</span></label><textarea id="group-description" name="description" maxlength="120" placeholder="说说集合点、是否适合新手、需要准备什么…"></textarea><p class="field-hint">至少 8 个字，最多 120 字</p>${fieldError("description")}</div>
        <div class="form-actions"><button type="button" class="button button-ghost" data-action="close-modal">再想想</button><button type="submit" class="button">${icon("plus")}发布组局</button></div>
      </form>`);
  }

  function clearFormErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach(node => node.textContent = "");
    form.querySelectorAll("[aria-invalid]").forEach(node => node.removeAttribute("aria-invalid"));
  }

  function setFormError(form, name, message) {
    const input = form.elements[name];
    if (input) input.setAttribute("aria-invalid", "true");
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (error) error.textContent = message;
  }

  async function submitGroup(form) {
    clearFormErrors(form);
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const time = String(data.get("time") || "");
    const total = Number(data.get("total"));
    const description = String(data.get("description") || "").trim();
    let valid = true;
    if (title.length < 4) { setFormError(form, "title", "请用至少 4 个字说清楚要做什么"); valid = false; }
    if (!time || Number.isNaN(new Date(time).getTime())) { setFormError(form, "time", "请选择有效的集合时间"); valid = false; }
    else if (new Date(time).getTime() < Date.now()) { setFormError(form, "time", "集合时间需要晚于现在"); valid = false; }
    if (!Number.isInteger(total) || total < 2 || total > 20) { setFormError(form, "total", "人数需为 2–20 之间的整数"); valid = false; }
    if (description.length < 8) { setFormError(form, "description", "再多介绍一点吧，至少 8 个字"); valid = false; }
    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = "正在发布…";
    try {
      const date = new Date(time);
      const pad = number => String(number).padStart(2, "0");
      const group = await API.createGroup({
        placeId: form.dataset.place,
        title,
        category: String(data.get("category")),
        total,
        description,
        duration: String(data.get("duration")),
        timeLabel: `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`,
        day: pad(date.getDate()),
        month: `${date.getMonth() + 1}月`
      });
      closeModal(false);
      showToast("组局发布成功 · +15 积分", "已展示在对应地点，也加入了你的个人组局列表。");
      ui.placeData = { place: Store.getPlace(group.placeId), groups: Store.getGroups(group.placeId) };
      ui.activeRoute = { name: "place", id: group.placeId };
      if (location.hash !== `#place/${group.placeId}`) location.hash = `place/${group.placeId}`;
      else view.innerHTML = renderPlace();
    } catch (error) {
      showToast("发布失败", error.message, "error");
      button.disabled = false;
      button.innerHTML = `${icon("plus")}发布组局`;
    }
  }

  function openSponsor(placeId) {
    const place = Store.getPlace(placeId);
    if (!place || !place.sponsor) return;
    openModal(`${modalHeader("NOVA BENEFIT · 场景福利", "把地理位置，变成真实福利", "基于当前地点精准出现，不打扰其他探索场景。")}
      <div class="sponsor-card card"><span class="sponsor-label">${icon("ticket")}滋兰餐厅 · 新生限定</span><h3>${place.sponsor.title}</h3><p>${place.sponsor.text}</p><div class="divider"></div><div class="place-facts" style="margin:0;border:0;padding:0"><div>${icon("clock")}11月1日–11月15日，每天 10:00–20:00</div><div>${icon("map-pin")}滋兰餐厅二楼新叶茶饮档口</div></div></div>
      <div class="form-note" style="margin-top:16px">${icon("info")}这是 LBS 原生商业化演示。优惠仅在同学主动进入食堂场景后展示。</div>
      <div class="form-actions"><button class="button button-ghost" data-action="close-modal">稍后再看</button><button class="button" data-action="claim-sponsor">${icon("ticket")}领取 5 元券</button></div>`, true);
  }

  /* 社团类别配色：用类别底图 + 程序化徽标替代重复的场景照片 */
  const clubTones = {
    "思想政治类": ["#C4695F", "#7B3A44"],
    "志愿公益类": ["#E0A073", "#A25C3B"],
    "自律互助类": ["#7FB9A7", "#3D7A71"],
    "学术科技类": ["#6C94CD", "#2F4E7B"],
    "创新创业类": ["#DBAC57", "#9A6F29"],
    "文化体育类": ["#9E92D0", "#5B518C"]
  };

  function clubTone(category) {
    return clubTones[category] || ["#7E96AD", "#43596F"];
  }

  function clubSeed(id) {
    let seed = 0;
    for (let index = 0; index < id.length; index += 1) seed = (seed * 31 + id.charCodeAt(index)) % 997;
    return seed;
  }

  /* 按社团名称语义匹配实拍图，越具体的规则越靠前；未命中再回落到同类别素材 */
  const clubPhotos = [
    // 传统文化 / 非遗
    { test: /醒狮|龙狮|舞狮/, src: "assets/activities/recruit-3.webp" },
    { test: /汉服/, src: "assets/activities/recruit-2.webp" },
    { test: /茶艺|茶文化|茶/, src: "assets/activities/tea.webp" },
    { test: /古琴|国粹|非遗|国潮|莞香|承古|手作|国学/, src: "assets/clubs/traditional-culture.jpg" },
    // 文艺演出
    { test: /啦啦操|健美操/, src: "assets/activities/recruit-1.webp" },
    { test: /音乐|歌手|合唱|乐队|乐集|声乐/, src: "assets/activities/singer-live.webp" },
    { test: /街舞|舞蹈|舞社|粤舞|社彩|文化团/, src: "assets/ai/street-dance.jpg" },
    // 思想政治
    { test: /国旗|向阳/, src: "assets/clubs/flag-guard.jpg" },
    { test: /编辑部|编辑|记者/, src: "assets/activities/ai-talk.jpg" },
    // 卫生健康
    { test: /红十字|急救|药学|本草|康复|人体|护理|医疗|卫生健康/, src: "assets/clubs/medical-lab.jpg" },
    { test: /汽车/, src: "assets/clubs/car-repair.jpg" },
    // 人文素养
    { test: /手语/, src: "assets/clubs/sign-language.jpg" },
    { test: /书画|书法/, src: "assets/clubs/calligraphy.jpg" },
    { test: /花艺|插花/, src: "assets/clubs/flower.jpg" },
    { test: /摄影|摄像/, src: "assets/clubs/photography.jpg" },
    { test: /桌游|棋牌|剧本/, src: "assets/clubs/board-games.jpg" },
    { test: /户外|登山|徒步|露营|定向/, src: "assets/clubs/outdoor.jpg" },
    { test: /咖啡/, src: "assets/clubs/coffee.jpg" },
    { test: /英语|外语/, src: "assets/clubs/english-corner.jpg" },
    { test: /彩绘|墙绘|美丽乡村/, src: "assets/clubs/mural.jpg" },
    { test: /辩论|演讲|口才|主持|宣讲|司仪|明辨|法思/, src: "assets/ai/debate.jpg" },
    { test: /动漫|ACG|次元|漫画|cos/i, src: "assets/ai/anime-club.jpg" },
    // 运动
    { test: /跆拳|武术|太极|格斗|散打|运动防护/, src: "assets/clubs/martial-arts.jpg" },
    { test: /滑板|轮滑|骑行/, src: "assets/ai/skateboard.jpg" },
    { test: /篮球/, src: "assets/ai/basketball.jpg" },
    { test: /足球|橄榄球/, src: "assets/stadium.jpg" },
    { test: /排球/, src: "assets/clubs/volleyball.jpg" },
    { test: /网球/, src: "assets/clubs/tennis.jpg" },
    { test: /乒乓|乒|羽|毽球|匹克|球/, src: "assets/clubs/racket-hall.jpg" },
    // 科技 / 双创
    { test: /无人机|航模|飞行/, src: "assets/activities/drone.jpg" },
    { test: /机器人|智能产品|智汇|智创|集模|机械/, src: "assets/ai/robotics.jpg" },
    { test: /工业|制造|工程/, src: "assets/activities/industry-software.jpg" },
    { test: /编程|计算机|软件|互联网|人工智能|AI|算法|数学建模|数字|元启|电子|物联网|科创/i, src: "assets/ai/coding.jpg" },
    { test: /金融|金鹰|电商|创业|创新|职业规划|就业/, src: "assets/ai/startup.jpg" },
    { test: /融媒|影视|视频|媒体/, src: "assets/activities/movie-night.jpg" },
    { test: /读者|图书|阅读|书香/, src: "assets/reading-room.jpg" },
    // 心理互助 / 志愿公益
    { test: /心理|朋辈|港湾|同伴/, src: "assets/ai/mutual-aid.jpg" },
    { test: /志愿|公益|环保|绿色|笃行|聆近|启创|东风窗/, src: "assets/ai/volunteer.jpg" }
  ];
  const clubFallbacks = {
    "思想政治类": ["assets/activities/ai-talk.jpg", "assets/ai/seminar.jpg", "assets/ai/debate.jpg"],
    "志愿公益类": ["assets/ai/volunteer.jpg", "assets/ai/volunteer-2.jpg", "assets/ai/volunteer-3.jpg"],
    "自律互助类": ["assets/ai/mutual-aid.jpg", "assets/clubs/medical-lab.jpg"],
    "学术科技类": ["assets/ai/coding.jpg", "assets/ai/robotics.jpg", "assets/activities/industry-software.jpg", "assets/clubs/medical-lab.jpg"],
    "创新创业类": ["assets/ai/startup.jpg", "assets/clubs/coffee.jpg"],
    "文化体育类": ["assets/clubs/racket-hall.jpg", "assets/ai/street-dance.jpg", "assets/ai/skateboard.jpg", "assets/activities/singer-live.webp"]
  };
  const defaultFallbacks = ["assets/activities/recruit.webp", "assets/ai/seminar.jpg", "assets/ai/volunteer.jpg", "assets/ai/startup.jpg", "assets/ai/mutual-aid.jpg", "assets/clubs/racket-hall.jpg"];

  /* 专属实拍封面：以下社团各独占一张 assets/clubs/<id>.jpg，优先于语义规则，保证 89 个社团封面互不重复 */
  const clubOwnPhotos = new Set([
    "club-3", "club-5", "club-6", "club-7", "club-8", "club-10",
    "club-12", "club-13", "club-16", "club-18", "club-19", "club-21",
    "club-22", "club-23", "club-24", "club-25", "club-26", "club-27",
    "club-28", "club-31", "club-33", "club-34", "club-35", "club-36",
    "club-37", "club-38", "club-39", "club-40", "club-43", "club-44",
    "club-47", "club-49", "club-50", "club-52", "club-54", "club-58",
    "club-62", "club-63", "club-66", "club-67", "club-70", "club-73",
    "club-75", "club-76", "club-77", "club-78", "club-79", "club-81",
    "club-84", "club-85", "club-86", "club-87", "club-89"
  ]);

  function clubPhoto(club) {
    if (clubOwnPhotos.has(club.id)) return `assets/clubs/${club.id}.jpg`;
    const hit = clubPhotos.find(item => item.test.test(club.name));
    if (hit) return hit.src;
    const pool = clubFallbacks[club.category] || defaultFallbacks;
    return pool[clubSeed(club.id) % pool.length];
  }

  function clubLogo(club) {
    return `<span class="club-logo"><img src="assets/logos/${club.id}.svg" alt="" loading="lazy" decoding="async"></span>`;
  }

  function clubCard(club) {
    const applied = Store.state.applications.some(item => item.clubId === club.id);
    return `<article class="club-card card"><a href="#club/${club.id}" aria-label="查看${club.name}"><div class="club-card-image"><img class="club-card-photo" src="${clubPhoto(club)}" alt="${escapeHTML(club.name)}活动照片" loading="lazy" decoding="async"><span class="tag">${club.category}</span></div></a><div class="club-card-body"><div class="club-title-row">${clubLogo(club)}<div><h3>${club.name}</h3><span>${club.slogan}</span></div></div><p>${club.description}</p><div class="club-stats"><span>${icon("shield-check")}${club.status}</span><span>${icon("school")}${club.unit}</span></div><div class="club-card-footer"><span>${applied ? "申请已提交" : club.recruit}</span><a href="#club/${club.id}">${applied ? "查看申请" : "了解社团"}${icon("arrow-right")}</a></div></div></article>`;
  }

  function renderClubGrid(clubs) {
    return clubs.length ? `<div class="club-grid stagger">${clubs.map(clubCard).join("")}</div>` : `<div class="empty-state">${icon("search")}<h3>暂时没有匹配的社团</h3><p>试试搜索“足球”“摄影”，或切换到其他分类。</p><button class="button button-small" data-action="clear-club-filters">清除筛选</button></div>`;
  }

  function renderClubCarousel() {
    const events = ui.clubCatalog.events || [];
    if (!events.length) return "";
    const index = ((clubSlideIndex % events.length) + events.length) % events.length;
    const event = events[index];
    const club = (ui.clubCatalog.clubs || []).find(item => item.id === event.clubId);
    if (!club) return "";
    const ctaHref = event.cta ? event.cta.href : `#club/${club.id}`;
    const ctaLabel = event.cta ? event.cta.label : `${club.name} · 查看详情`;
    return `<section class="club-feature club-carousel" id="club-carousel" aria-label="近期社团活动轮播">
      <div class="club-feature-copy club-slide">
        <span class="eyebrow">CLUB EVENTS · 近期社团动态</span>
        <div class="club-slide-meta"><span class="club-slide-tag">${event.kind}</span><span>${icon("calendar")}${event.date} ${event.weekday} ${event.time}</span><span>${icon("map-pin")}${event.place}</span></div>
        <h2>${event.title}</h2>
        <p>${event.desc}</p>
        <a class="button" href="${ctaHref}">${ctaLabel} ${icon("arrow-right")}</a>
        <div class="club-carousel-controls">
          <button class="icon-button" data-action="club-slide-prev" aria-label="上一个活动">${icon("chevron-left")}</button>
          <div class="club-carousel-dots">${events.map((item, i) => `<button class="club-dot ${i === index ? "active" : ""}" data-action="club-slide-goto" data-index="${i}" aria-label="第 ${i + 1} 个活动：${item.title}"></button>`).join("")}</div>
          <button class="icon-button" data-action="club-slide-next" aria-label="下一个活动">${icon("chevron-right")}</button>
          <span class="club-slide-count">${index + 1} / ${events.length}</span>
        </div>
      </div>
      <div class="club-feature-image"><img src="${event.image}" alt="${event.title}" decoding="async" loading="lazy"><span class="club-slide-signup">${icon("users")}${event.signup}</span></div>
    </section>`;
  }

  function goClubSlide(direction) {
    const total = (ui.clubCatalog.events || []).length;
    if (!total) return;
    clubSlideIndex = (clubSlideIndex + direction + total) % total;
    const carousel = document.getElementById("club-carousel");
    if (carousel) carousel.outerHTML = renderClubCarousel();
  }

  function stopClubCarousel() {
    if (clubSlideTimer) clearInterval(clubSlideTimer);
    clubSlideTimer = null;
  }

  function startClubCarousel() {
    stopClubCarousel();
    if (ui.activeRoute.name !== "clubs" || (ui.clubCatalog.events || []).length < 2) return;
    clubSlideTimer = setInterval(() => goClubSlide(1), 6000);
  }

  function renderClubs(clubs) {
    const categories = ["all", ...(ui.clubCatalog.categories || [])];
    return `<div class="view-enter">${renderClubCarousel()}
      <div class="club-tools"><div class="filter-chips">${categories.map(category => `<button class="chip ${ui.clubFilter === category ? "active" : ""}" data-action="filter-clubs" data-filter="${category}">${category === "all" ? "全部社团" : `<span class="chip-dot" style="background:${clubTone(category)[0]}"></span>${category}`}</button>`).join("")}</div><form class="search-box" id="club-search-form"><label class="sr-only" for="club-search" style="position:absolute;left:-9999px">搜索社团</label>${icon("search")}<input id="club-search" type="search" placeholder="搜索社团或兴趣…" value="${escapeHTML(ui.clubQuery)}" autocomplete="off"></form></div>
      <div id="club-grid-container">${renderClubGrid(clubs)}</div></div>`;
  }

  async function loadClubResults() {
    const container = document.getElementById("club-grid-container");
    if (!container) return;
    const request = ++clubRequest;
    container.innerHTML = `<div class="club-grid">${Array(3).fill('<div class="card loading-card"><div class="skeleton"></div><div class="skeleton"></div></div>').join("")}</div>`;
    try {
      const clubs = await API.fetchClubs({ query: ui.clubQuery, category: ui.clubFilter });
      const current = document.getElementById("club-grid-container");
      if (request === clubRequest && current) current.innerHTML = renderClubGrid(clubs);
    } catch (error) {
      if (request === clubRequest && container) container.innerHTML = errorTemplate(error);
    }
  }

  function renderClubDetail(club) {
    const application = Store.state.applications.find(item => item.clubId === club.id);
    const place = Store.getPlace(club.locationId);
    const applyContent = application ? `<div class="applied-state"><span class="success-icon">${icon("circle-check")}</span><h3>申请已送达</h3><p>${escapeHTML(application.name)}，你的申请已提交给社长。当前状态：${application.status}。</p><span class="tag tag-secondary">${application.time}</span><button class="button button-block button-ghost" style="margin-top:18px" disabled>等待社团联系</button></div>` : `<p>留下基础信息，社长会通过你填写的联系方式与你沟通。</p><div class="apply-benefits"><span>${icon("check")}无门槛新生体验</span><span>${icon("check")}直接触达社团负责人</span><span>${icon("check")}信息仅用于本次招新</span></div><button class="button button-block" data-action="apply-club" data-id="${club.id}">${icon("user-plus")}申请加入社团</button>`;
    return `<div class="view-enter"><nav class="breadcrumb" aria-label="面包屑"><a href="#clubs">${icon("arrow-left")}返回社团矩阵</a><span>/</span><span>${club.category}</span><span>/</span><strong>${club.name}</strong></nav>
      <section class="club-hero"><img class="club-hero-photo" src="${clubPhoto(club)}" alt="${escapeHTML(club.name)}活动现场" decoding="async"><div class="club-hero-copy">${clubLogo(club)}<span class="eyebrow" style="color:#B9E1D5">${club.category} · ${club.recruit}</span><h2>${club.name}</h2><p>${club.slogan}</p><div class="club-hero-meta"><span>${icon("shield-check")}${club.status}</span><span>${icon("school")}指导教师 ${club.advisor}</span><span>${icon("map-pin")}${place.name}</span></div></div></section>
      <div class="club-detail-grid"><div class="club-detail-main"><section class="club-content-card card"><div class="card-heading"><h3>关于我们</h3><span>CLUB STORY</span></div><p>${club.detail}</p></section><section class="club-content-card card"><div class="card-heading"><h3>近期活动与招新安排</h3><span>${club.activities.length ? `${club.activities.length} 场可参与` : "信息待发布"}</span></div>${club.activities.length ? `<div class="activity-timeline">${club.activities.map(activity => `<div class="activity-item"><time>${activity.date}</time><div><strong>${activity.title}</strong><p>${activity.desc}</p></div></div>`).join("")}</div>` : `<p class="muted">暂无公开活动安排，提交申请后由社团负责人同步。</p>`}</section></div>
      <aside class="club-detail-aside"><section class="apply-card card"><div class="card-heading"><h3>加入我们</h3><span class="live-label">${club.recruit}</span></div>${applyContent}</section><section class="club-content-card card"><div class="card-heading"><h3>活动室信息</h3><span>OFFLINE SPACE</span></div><div class="compact-list"><a class="compact-list-item" href="#place/${place.id}">${icon("map-pin")}<div><strong>${place.name}</strong><small>查看线下空间实景与攻略</small></div>${icon("chevron-right")}</a><div class="compact-list-item">${icon("users")}<div><strong>社长 · ${club.leader}</strong><small>提交申请后由负责人联系</small></div></div><div class="compact-list-item">${icon("shield-check")}<div><strong>学校认证社团</strong><small>活动与招新内容经过审核</small></div></div></div></section></aside></div></div>`;
  }

  function openApplication(clubId) {
    const club = (ui.clubCatalog.clubs || []).find(item => item.id === clubId) || (ui.clubData && ui.clubData.id === clubId ? ui.clubData : null);
    if (!club) return;
    const profile = Store.getProfile();
    openModal(`${modalHeader("JOIN THE CLUB", `申请加入 ${club.name}`, "信息仅用于本次招新联系，不会公开展示。")}
      <form id="application-form" data-club="${club.id}" novalidate>
        <div class="form-row"><div class="field"><label for="apply-name">姓名<span> *</span></label><input id="apply-name" name="name" value="${escapeHTML(profile.name)}" maxlength="20">${fieldError("name")}</div><div class="field"><label for="apply-major">年级专业<span> *</span></label><input id="apply-major" name="major" value="${escapeHTML(`${profile.grade} ${profile.major}`)}" maxlength="40">${fieldError("major")}</div></div>
        <div class="field"><label for="apply-contact">联系方式<span> *</span></label><input id="apply-contact" name="contact" value="${escapeHTML(profile.phone)}" placeholder="微信号或手机号" maxlength="40"><p class="field-hint">仅社团负责人可见</p>${fieldError("contact")}</div>
        <div class="field"><label for="apply-note">想对社团说的话</label><textarea id="apply-note" name="note" maxlength="120" placeholder="可以聊聊你的兴趣、经验，或想尝试的方向…"></textarea>${fieldError("note")}</div>
        <div class="form-note">${icon("shield-check")}实名校园用户 ${escapeHTML(profile.name)}，学生身份已通过验证。</div>
        <div class="form-actions"><button type="button" class="button button-ghost" data-action="close-modal">取消</button><button type="submit" class="button">${icon("user-plus")}提交申请</button></div>
      </form>`);
  }

  async function submitApplication(form) {
    clearFormErrors(form);
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const major = String(data.get("major") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    let valid = true;
    if (name.length < 2) { setFormError(form, "name", "请填写真实姓名"); valid = false; }
    if (major.length < 2) { setFormError(form, "major", "请填写年级与专业"); valid = false; }
    if (contact.length < 5) { setFormError(form, "contact", "请填写可用于联系的微信号或手机号"); valid = false; }
    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = "正在送达…";
    try {
      await API.applyClub({ clubId: form.dataset.club, name, major, contact, note: String(data.get("note") || "").trim() });
      closeModal(false);
      showToast("申请已送达 · +15 积分", "社长会通过你留下的联系方式沟通后续安排。");
      if (ui.clubData) view.innerHTML = renderClubDetail(ui.clubData);
    } catch (error) {
      showToast("申请未提交", error.message, "error");
      button.disabled = false;
      button.innerHTML = `${icon("user-plus")}提交申请`;
    }
  }

  function openProfileModal() {
    const profile = Store.getProfile();
    ui.profileDraft = { avatarType: profile.avatarType, avatarValue: profile.avatarValue };
    openModal(`${modalHeader("MY NOVA", "编辑个人资料", "头像、姓名和手机号只保存在本机，手机号不会公开展示。")}
      <form id="profile-form" novalidate>
        <div class="profile-edit-head">
          <span class="avatar profile-avatar-preview" id="profile-avatar-preview"></span>
          <div><strong>头像</strong><p class="muted">默认使用姓名首字，也可以上传你自己的照片</p></div>
        </div>
        <div class="avatar-options">
          <button type="button" class="avatar-option avatar-option-initial" data-action="pick-avatar-initial" title="默认头像" aria-label="使用默认头像">${escapeHTML(profile.initial)}</button>
          <button type="button" class="avatar-option avatar-option-upload" data-action="pick-avatar-file" title="上传照片" aria-label="上传照片">${icon("camera")}</button>
        </div>
        <input type="file" id="avatar-file" accept="image/png,image/jpeg,image/webp" hidden>
        <div class="field"><label for="profile-name">姓名<span> *</span></label><input id="profile-name" name="name" maxlength="12" value="${escapeHTML(profile.name)}" autocomplete="name">${fieldError("name")}</div>
        <div class="field"><label for="profile-phone">手机号</label><input id="profile-phone" name="phone" type="tel" inputmode="numeric" maxlength="11" value="${escapeHTML(profile.phone)}" placeholder="选填，用于社团联系">${fieldError("phone")}<p class="field-hint">仅在本机保存，申请社团时可自动填入，展示时自动脱敏。</p></div>
        <div class="form-actions"><button type="button" class="button button-ghost" data-action="close-modal">取消</button><button type="submit" class="button">${icon("check")}保存资料</button></div>
      </form>`);
    refreshProfilePreview();
  }

  function refreshProfilePreview() {
    const preview = document.getElementById("profile-avatar-preview");
    if (!preview || !ui.profileDraft) return;
    applyAvatar(preview, { ...Store.getProfile(), ...ui.profileDraft });
    const draft = ui.profileDraft;
    const initial = document.querySelector(".avatar-option-initial");
    if (initial) initial.classList.toggle("active", draft.avatarType !== "upload");
    const upload = document.querySelector(".avatar-option-upload");
    if (upload) {
      const isUpload = draft.avatarType === "upload" && Boolean(draft.avatarValue);
      upload.classList.toggle("active", isUpload);
      upload.classList.toggle("has-image", isUpload);
      upload.innerHTML = isUpload ? `<img src="${escapeHTML(draft.avatarValue)}" alt="">` : icon("camera");
    }
  }

  function handleAvatarFile(input) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("无法使用这个文件", "请选择 JPG、PNG 或 WebP 图片。", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("图片太大了", "请选择 8MB 以内的图片。", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        const scale = Math.max(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        ui.profileDraft = { avatarType: "upload", avatarValue: canvas.toDataURL("image/jpeg", 0.82) };
        refreshProfilePreview();
      };
      image.onerror = () => showToast("图片读取失败", "换一张图片再试试。", "error");
      image.src = reader.result;
    };
    reader.onerror = () => showToast("图片读取失败", "换一张图片再试试。", "error");
    reader.readAsDataURL(file);
  }

  async function submitProfile(form) {
    clearFormErrors(form);
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    let valid = true;
    if (name.length < 2) { setFormError(form, "name", "请填写 2–12 个字的姓名"); valid = false; }
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) { setFormError(form, "phone", "请输入 11 位手机号，例如 13800138000"); valid = false; }
    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = "正在保存…";
    try {
      await API.updateProfile({ name, phone, ...(ui.profileDraft || {}) });
      ui.profileDraft = null;
      closeModal(false);
      syncShellProfile();
      showToast("资料已更新", "新的头像和称呼会同步到组局与论坛。");
      if (ui.activeRoute.name === "me") handleRoute();
    } catch (error) {
      showToast("保存失败", error.message, "error");
      button.disabled = false;
      button.innerHTML = `${icon("check")}保存资料`;
    }
  }

  function renderProfile(profile) {
    const { user, stats, badges, checkins, applications, places = [] } = profile;
    const placeMap = new Map(places.map(place => [place.id, place]));
    const progress = places.length ? Math.round(stats.lit / places.length * 100) : 0;
    const level = Math.floor(stats.points / 200) + 1;
    const levelProgress = Math.min((stats.points % 200) / 2, 100);
    const myGroups = Store.getGroups().filter(group => group.isJoined);
    const groupList = myGroups.length ? myGroups.map(group => {
      const place = Store.getPlace(group.placeId) || placeMap.get(group.placeId);
      return `<a class="compact-list-item" href="#place/${group.placeId}">${icon("calendar")}<div><strong>${escapeHTML(group.title)}</strong><small>${escapeHTML(group.time)} · ${escapeHTML(place ? place.name : "校园地点")}</small></div>${icon("chevron-right")}</a>`;
    }).join("") : `<div class="empty-state" style="padding:22px">${icon("users")}<p>加入或发起一场组局后，会在这里生成你的赴约清单。</p><a class="text-button" href="#map">去星图看看</a></div>`;
    const applicationList = applications.length ? applications.map(application => {
      return `<a class="compact-list-item" href="#club/${application.clubId}">${icon("heart")}<div><strong>${escapeHTML(application.clubName || "社团")}</strong><small>${escapeHTML(application.time)} · ${escapeHTML(application.status)}</small></div>${icon("chevron-right")}</a>`;
    }).join("") : `<div class="empty-state" style="padding:22px">${icon("heart")}<p>还没有社团申请，先去认识一群同好吧。</p><a class="text-button" href="#clubs">探索社团</a></div>`;
    const checkinList = checkins.length ? checkins.slice(0, 5).map(checkin => {
      const place = placeMap.get(checkin.placeId);
      if (!place) return "";
      return `<a class="compact-list-item" href="#place/${place.id}">${icon(place.icon)}<div><strong>${escapeHTML(place.name)}</strong><small>${escapeHTML(checkin.time)} · +20 探索积分</small></div>${icon("circle-check")}</a>`;
    }).join("") : `<p class="muted">还没有足迹，从地图上的新地点开始吧。</p>`;

    return `<div class="view-enter"><section class="profile-hero card"><div class="profile-user"><button type="button" class="profile-avatar-hit" data-action="edit-profile" aria-label="更换头像">${avatarMarkup(user, "profile-avatar")}</button><div><h2>${escapeHTML(user.name)}</h2><p>${user.grade} · ${user.major}</p><span class="tag">${icon("shield-check")}校园实名认证 · ${user.title}</span></div></div><div class="profile-level"><div><strong>NOVA LV.${level}</strong><span>${stats.points} 成长值</span></div><div class="progress-track"><span style="width:${levelProgress}%"></span></div></div><div class="profile-stats"><div class="profile-stat"><strong>${stats.lit}</strong><span>已点亮地点</span></div><div class="profile-stat"><strong>${stats.groups}</strong><span>我的组局</span></div><div class="profile-stat"><strong>${stats.clubs}</strong><span>社团申请</span></div><div class="profile-stat"><strong>${stats.points}</strong><span>探索积分</span></div></div></section>
      <div class="profile-grid"><div class="profile-main"><section class="profile-card card"><div class="card-heading"><h3>校园点亮进度</h3><span>${stats.lit} / ${places.length} · ${progress}%</span></div><div class="progress-track" style="margin-bottom:18px"><span style="width:${progress}%"></span></div><div class="explore-grid">${places.map(place => `<a class="explore-place ${Store.state.litPlaceIds.includes(place.id) ? "is-lit" : ""}" href="#place/${place.id}">${icon(place.icon)}<span>${escapeHTML(place.shortName || place.name)}</span></a>`).join("")}</div></section>
      <section class="profile-card card"><div class="card-heading"><h3>成就徽章</h3><span>${badges.filter(badge => badge.unlocked).length} / ${badges.length} 已解锁</span></div><div class="badge-grid">${badges.map(badge => `<div class="badge-card ${badge.unlocked ? "" : "is-locked"}"><span class="badge-icon">${icon(badge.icon)}</span><strong>${badge.name}</strong><small>${badge.unlocked ? badge.description : `${badge.progress}/${badge.target} · ${badge.description}`}</small></div>`).join("")}</div></section>
      <section class="profile-card card"><div class="card-heading"><h3>我的组局</h3><span>${myGroups.length} 场</span></div><div class="compact-list">${groupList}</div><div class="divider"></div><div class="card-heading"><h3>社团申请</h3><span>${applications.length} 份</span></div><div class="compact-list">${applicationList}</div></section></div>
      <aside class="profile-aside"><section class="profile-card card"><div class="card-heading"><h3>最近足迹</h3><span>CHECK-INS</span></div><div class="compact-list">${checkinList}</div></section><section class="profile-card card"><div class="card-heading"><h3>偏好与演示</h3><span>SETTINGS</span></div><div class="settings-list"><button class="setting-item" data-action="edit-profile">${icon("edit")}<span>编辑个人资料</span>${icon("chevron-right", "chevron")}</button><div class="setting-item">${icon("phone")}<span>手机号</span><small>${user.phone ? maskPhone(user.phone) : "未填写"}</small></div><button class="setting-item" data-action="toggle-theme">${icon("moon")}<span>深色主题</span><i class="switch ${Store.state.theme === "dark" ? "on" : ""}" data-theme-switch></i></button><div class="setting-item">${icon("shield-check")}<span>学生身份认证</span><small>${user.verified ? "已认证" : "未认证"}</small></div><button class="setting-item" data-action="reset-data">${icon("rotate-ccw")}<span>重置演示数据</span>${icon("chevron-right", "chevron")}</button></div></section></aside></div></div>`;
  }

  function forumCategoryClass(category) {
    if (category === "吃瓜") return "tag-accent";
    if (category === "吐槽") return "tag-primary";
    if (category === "树洞" || category === "求助") return "tag-secondary";
    return "";
  }

  function forumAvatar(item) {
    const profile = Store.getProfile();
    if (!item.anonymous && item.authorId === profile.id) return avatarMarkup(profile, "avatar-small");
    return `<span class="avatar avatar-small ${item.anonymous ? "is-anon" : ""}">${escapeHTML(item.authorInitial)}</span>`;
  }

  function forumPostCard(post) {
    return `<article class="forum-post card">
      <div class="forum-post-head">
        ${forumAvatar(post)}
        <div class="forum-post-author"><strong>${escapeHTML(post.author)}</strong><span>${escapeHTML(post.time)}</span></div>
        <span class="tag ${forumCategoryClass(post.category)}">${escapeHTML(post.category)}</span>
      </div>
      <a class="forum-post-title" href="#thread/${post.id}"><h3>${escapeHTML(post.title)}</h3></a>
      <p class="forum-post-body">${escapeHTML(post.body)}</p>
      <div class="forum-post-foot">
        <button class="post-action ${post.liked ? "active" : ""}" type="button" data-action="toggle-post-like" data-id="${post.id}" aria-pressed="${post.liked}" aria-label="点赞，当前 ${post.likes} 个赞">${icon("heart")}<span>${post.likes}</span></button>
        <a class="post-action" href="#thread/${post.id}" aria-label="查看 ${post.commentCount} 条评论">${icon("message-square")}<span>${post.commentCount}</span></a>
        ${post.mine ? `<button class="post-action post-action-danger" type="button" data-action="delete-post" data-id="${post.id}">${icon("trash")}<span>删除</span></button>` : ""}
        <a class="post-more" href="#thread/${post.id}">进入讨论${icon("arrow-right")}</a>
      </div>
    </article>`;
  }

  function renderForumFeed(posts) {
    if (!posts.length) {
      return `<div class="empty-state">${icon("message-square")}<h3>这个话题分类还很安静</h3><p>换个分类看看，或者在上方发布第一个话题。</p><button class="button button-small" type="button" data-action="filter-forum" data-filter="all">看看全部话题</button></div>`;
    }
    return `<div class="forum-feed stagger">${posts.map(forumPostCard).join("")}</div>`;
  }

  function forumComposer() {
    const options = ui.forumCategories.map(category => `<option>${category}</option>`).join("");
    const profile = Store.getProfile();
    return `<form class="forum-composer card" id="forum-form" novalidate>
      <div class="composer-head">
        ${avatarMarkup(profile, "avatar-small")}
        <div><strong>${escapeHTML(profile.name)}，说点什么吧</strong><span>真实身份仅用于社区安全，可随时切换匿名。</span></div>
        <span class="tag tag-secondary composer-badge">${icon("shield-check")}实名社区</span>
      </div>
      <input class="composer-title" id="forum-title" name="title" maxlength="40" placeholder="起个标题，让大家一眼看懂…" autocomplete="off" aria-label="话题标题">
      <p class="field-error" data-error-for="title"></p>
      <textarea class="composer-body" id="forum-body" name="body" maxlength="500" placeholder="吃瓜、吐槽、树洞、求助…… 只要真诚，就有人回应。" aria-label="话题正文"></textarea>
      <p class="field-error" data-error-for="body"></p>
      <div class="composer-foot">
        <select class="composer-category" name="category" aria-label="话题分类">${options}</select>
        <label class="anon-control"><input type="checkbox" name="anonymous"><span class="switch" aria-hidden="true"></span><span>匿名发布</span></label>
        <button class="button button-small composer-submit" type="submit">${icon("send")}发布话题</button>
      </div>
    </form>`;
  }

  function renderForum(posts) {
    const allPosts = Store.getForumPosts();
    const commentTotal = allPosts.reduce((sum, post) => sum + post.commentCount, 0);
    const anonTotal = allPosts.filter(post => post.anonymous).length;
    const categories = [{ id: "all", label: "全部" }, ...ui.forumCategories.map(category => ({ id: category, label: category }))];
    const chips = categories.map(category => `<button class="chip ${ui.forumCategory === category.id ? "active" : ""}" type="button" data-action="filter-forum" data-filter="${category.id}">${category.label}</button>`).join("");
    const hot = [...allPosts].sort((a, b) => (b.likes * 2 + b.commentCount * 3) - (a.likes * 2 + a.commentCount * 3)).slice(0, 3);
    const hotList = hot.map((post, index) => `<a class="forum-hot-item" href="#thread/${post.id}"><span class="hot-index">${index + 1}</span><div><strong>${escapeHTML(post.title)}</strong><small>${post.likes} 赞 · ${post.commentCount} 条讨论</small></div></a>`).join("");

    return `<div class="view-enter forum-view">
      <section class="forum-hero">
        <div class="forum-hero-copy">
          <span class="eyebrow">CAMPUS TALK · 校园论坛</span>
          <h2>课堂之外，<br>也值得被听见。</h2>
          <p>吃瓜、吐槽、树洞、求助和闲置，都可以放在这里。开启匿名后，你的姓名与头像不会出现在话题和评论中。</p>
        </div>
        <div class="forum-hero-stats">
          <div><strong>${allPosts.length}</strong><span>个话题</span></div>
          <div><strong>${commentTotal}</strong><span>条讨论</span></div>
          <div><strong>${anonTotal}</strong><span>条匿名</span></div>
        </div>
      </section>
      <div class="forum-layout">
        <div class="forum-main">
          ${forumComposer()}
          <div class="forum-tools">
            <div class="filter-chips">${chips}</div>
            <div class="forum-tools-right">
              <form class="search-box forum-search" id="forum-search-form">
                <label for="forum-search" style="position:absolute;left:-9999px">搜索论坛话题</label>
                ${icon("search")}<input id="forum-search" type="search" placeholder="搜索话题或关键词…" value="${escapeHTML(ui.forumQuery)}" autocomplete="off">
              </form>
              <div class="sort-toggle">
                <button type="button" class="${ui.forumSort === "latest" ? "active" : ""}" data-action="sort-forum" data-sort="latest">最新</button>
                <button type="button" class="${ui.forumSort === "hot" ? "active" : ""}" data-action="sort-forum" data-sort="hot">${icon("flame")}最热</button>
              </div>
            </div>
          </div>
          <div id="forum-feed">${renderForumFeed(posts)}</div>
        </div>
        <aside class="forum-aside">
          <section class="forum-side-card card">
            <div class="card-heading"><h3>${icon("shield-check")}匿名与边界</h3><span>BE KIND</span></div>
            <p>匿名保护的是表达，不是伤害。请不要发布真实姓名、联系方式或未经证实的指控。</p>
            <p class="forum-side-note">${icon("eye-off")}匿名话题不会展示你的姓名、头像与年级专业；自己发布的话题仍可在列表和详情中删除。</p>
          </section>
          <section class="forum-side-card card">
            <div class="card-heading"><h3>${icon("flame")}正在热议</h3><span>TOP 3</span></div>
            <div class="forum-hot-list">${hotList}</div>
          </section>
        </aside>
      </div>
    </div>`;
  }

  function renderThread(post) {
    const categoryClass = forumCategoryClass(post.category);
    const related = Store.getForumPosts().filter(item => item.id !== post.id && item.category === post.category).slice(0, 3);
    const relatedList = related.length
      ? related.map(item => `<a class="forum-hot-item" href="#thread/${item.id}"><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.time)} · ${item.commentCount} 条讨论</small></div></a>`).join("")
      : `<p class="muted" style="font-size:12px">这个分类暂时没有其他话题。</p>`;
    const comments = post.comments.length
      ? post.comments.map(comment => `<div class="comment-item">
          ${forumAvatar(comment)}
          <div class="comment-main">
            <div class="comment-head"><strong>${escapeHTML(comment.author)}</strong><span>${escapeHTML(comment.time)}</span></div>
            <p>${escapeHTML(comment.body)}</p>
          </div>
        </div>`).join("")
      : `<div class="empty-state" style="padding:28px 20px">${icon("message-square")}<h3>还没有人回复</h3><p>做第一个回应的人，让这个话题有下文。</p></div>`;

    return `<div class="view-enter thread-view">
      <nav class="breadcrumb" aria-label="面包屑"><a href="#forum">${icon("arrow-left")}返回校园论坛</a><span>/</span><span>${escapeHTML(post.category)}</span></nav>
      <div class="thread-layout">
        <div class="thread-main">
          <article class="thread-post card">
            <div class="forum-post-head">
              ${forumAvatar(post)}
              <div class="forum-post-author"><strong>${escapeHTML(post.author)}</strong><span>${escapeHTML(post.time)}${post.anonymous ? " · 匿名发布" : ""}</span></div>
              <span class="tag ${categoryClass}">${escapeHTML(post.category)}</span>
            </div>
            <h2 class="thread-title">${escapeHTML(post.title)}</h2>
            <p class="thread-body">${escapeHTML(post.body)}</p>
            <div class="forum-post-foot thread-post-foot">
              <button class="post-action ${post.liked ? "active" : ""}" type="button" data-action="toggle-post-like" data-id="${post.id}" aria-pressed="${post.liked}" aria-label="点赞，当前 ${post.likes} 个赞">${icon("heart")}<span>${post.likes}</span></button>
              <span class="post-action post-action-static">${icon("message-square")}<span>${post.commentCount}</span></span>
              ${post.mine ? `<button class="post-action post-action-danger" type="button" data-action="delete-post" data-id="${post.id}">${icon("trash")}<span>删除话题</span></button>` : ""}
            </div>
          </article>
          <section class="thread-comments card">
            <div class="card-heading"><h3>${icon("message-square")}讨论 ${post.commentCount}</h3><span>${post.commentCount ? "友善发言，理性吃瓜" : "等待第一个回应"}</span></div>
            <form class="comment-form" id="comment-form" data-post="${post.id}" novalidate>
              <textarea name="body" maxlength="300" placeholder="说点什么，给这个话题一点回声…" aria-label="评论内容"></textarea>
              <p class="field-error" data-error-for="body"></p>
              <div class="comment-form-foot">
                <label class="anon-control"><input type="checkbox" name="anonymous"><span class="switch" aria-hidden="true"></span><span>匿名回复</span></label>
                <button class="button button-small" type="submit">${icon("send")}发表评论</button>
              </div>
            </form>
            <div class="comment-list">${comments}</div>
          </section>
        </div>
        <aside class="thread-aside">
          <section class="forum-side-card card">
            <div class="card-heading"><h3>${icon("shield-check")}讨论守则</h3><span>HOUSE RULES</span></div>
            <p>就事论事，不人身攻击；不曝光他人隐私；未经证实的消息请注明“听说”。</p>
            <p class="forum-side-note">${icon("eye-off")}匿名只隐藏身份，不隐藏责任。</p>
          </section>
          <section class="forum-side-card card">
            <div class="card-heading"><h3>同类话题</h3><span>MORE</span></div>
            <div class="forum-hot-list">${relatedList}</div>
          </section>
        </aside>
      </div>
    </div>`;
  }

  async function reloadForumFeed() {
    const feed = document.getElementById("forum-feed");
    if (!feed) return;
    const request = ++forumRequest;
    feed.innerHTML = `<div class="forum-feed">${Array(2).fill('<div class="card loading-card"><div class="skeleton"></div><div class="skeleton" style="width:80%"></div></div>').join("")}</div>`;
    try {
      const posts = await API.fetchForumPosts({ category: ui.forumCategory, query: ui.forumQuery, sort: ui.forumSort });
      const current = document.getElementById("forum-feed");
      if (request === forumRequest && current) current.innerHTML = renderForumFeed(posts);
    } catch (error) {
      if (request === forumRequest && feed) feed.innerHTML = errorTemplate(error);
    }
  }

  async function submitForumPost(form) {
    clearFormErrors(form);
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const body = String(data.get("body") || "").trim();
    const category = String(data.get("category") || "吐槽");
    const anonymous = data.get("anonymous") === "on";
    let valid = true;
    if (title.length < 4) { setFormError(form, "title", "标题至少 4 个字，让大家知道你想聊什么"); valid = false; }
    if (body.length < 8) { setFormError(form, "body", "正文至少 8 个字，再多说一点吧"); valid = false; }
    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = "正在发布…";
    try {
      const post = await API.createForumPost({ title, body, category, anonymous });
      showToast(anonymous ? "匿名话题已发布" : "话题已发布", anonymous ? "你的真实姓名与头像不会出现在这条话题中。" : "已同步到校园论坛的最新列表。");
      ui.forumCategory = "all";
      ui.forumQuery = "";
      location.hash = `thread/${post.id}`;
    } catch (error) {
      showToast("发布失败", error.message, "error");
      button.disabled = false;
      button.innerHTML = `${icon("send")}发布话题`;
    }
  }

  async function submitForumComment(form) {
    clearFormErrors(form);
    const data = new FormData(form);
    const body = String(data.get("body") || "").trim();
    if (body.length < 2) {
      setFormError(form, "body", "至少写 2 个字再发送");
      if (form.elements.body) form.elements.body.focus();
      return;
    }
    const anonymous = data.get("anonymous") === "on";
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = "正在发送…";
    try {
      const post = await API.addForumComment(form.dataset.post, { body, anonymous });
      ui.threadData = post;
      view.innerHTML = renderThread(post);
      showToast("评论已发表", anonymous ? "已使用匿名身份回复。" : "已使用校园身份回复。");
    } catch (error) {
      showToast("评论未发送", error.message, "error");
      button.disabled = false;
      button.innerHTML = `${icon("send")}发表评论`;
    }
  }

  async function handleForumLike(postId, button) {
    if (button.dataset.busy) return;
    button.dataset.busy = "1";
    try {
      const result = await API.toggleForumLike(postId);
      button.classList.toggle("active", result.liked);
      button.setAttribute("aria-pressed", String(result.liked));
      button.innerHTML = `${icon("heart")}<span>${result.likes}</span>`;
      button.setAttribute("aria-label", `点赞，当前 ${result.likes} 个赞`);
    } catch (error) {
      showToast("操作失败", error.message, "error");
    } finally {
      delete button.dataset.busy;
    }
  }

  function openDeletePostConfirm(postId) {
    const post = Store.getForumPost(postId);
    if (!post) return;
    openModal(`<div class="confirm-visual">${icon("trash")}</div><h2>删除这个话题？</h2><p class="muted" style="margin-top:10px">删除后，这个话题和下面的 ${post.commentCount} 条讨论都会从本机移除，且无法恢复。</p><div class="form-actions"><button class="button button-ghost" data-action="close-modal">保留</button><button class="button" data-action="confirm-delete-post" data-id="${post.id}">确认删除</button></div>`, true);
  }

  async function handleDeletePost(postId) {
    try {
      await API.deleteForumPost(postId);
      closeModal(false);
      showToast("话题已删除", "这个话题不会再出现在校园论坛中。");
      if (ui.activeRoute.name === "thread") {
        location.hash = "forum";
      } else {
        handleRoute();
      }
    } catch (error) {
      showToast("删除失败", error.message, "error");
    }
  }

  function openResetConfirm() {
    openModal(`<div class="confirm-visual">${icon("rotate-ccw")}</div><h2>重置演示数据？</h2><p class="muted" style="margin-top:10px">将恢复初始的 2 个点亮地点，并清除你发布的组局、论坛话题、点赞、加入记录和社团申请。当前主题与个人资料会保留。</p><div class="form-actions"><button class="button button-ghost" data-action="close-modal">保留记录</button><button class="button" data-action="confirm-reset">确认重置</button></div>`, true);
  }

  function showToast(title, message, type = "success") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `${icon(type === "error" ? "alert-circle" : "circle-check")}<div><strong>${escapeHTML(title)}</strong><span>${escapeHTML(message)}</span></div>`;
    toastRegion.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  document.addEventListener("click", event => {
    if (event.target.matches("[data-modal-backdrop]")) {
      closeModal();
      return;
    }
    const trigger = event.target.closest("[data-action]");
    if (!trigger) {
      view.querySelectorAll(".map-pill.is-open").forEach(item => item.classList.remove("is-open"));
      return;
    }
    const action = trigger.dataset.action;
    event.preventDefault();

    if (action === "toggle-poi") {
      const isOpen = trigger.classList.contains("is-open");
      view.querySelectorAll(".map-pill.is-open").forEach(item => item.classList.remove("is-open"));
      if (!isOpen) trigger.classList.add("is-open");
    } else if (action === "toggle-theme") {
      Store.setTheme(Store.state.theme === "dark" ? "light" : "dark");
      applyTheme();
    } else if (action === "enter-campus-map") {
      enterCampusMap(trigger.dataset.target || "");
    } else if (action === "filter-map") {
      ui.mapFilter = trigger.dataset.filter;
      view.innerHTML = renderMap();
      requestAnimationFrame(applyMapFocus);
    } else if (action === "filter-region") {
      const id = trigger.dataset.id;
      if (!id || id === "all") {
        ui.activeRegion = null;
        ui.mapZoom = 1;
      } else {
        ui.activeRegion = ui.activeRegion === id ? null : id;
        ui.mapZoom = ui.activeRegion ? regionMeta(ui.activeRegion).zoom : 1;
      }
      ui.activeBuilding = null;
      view.innerHTML = renderMap();
      requestAnimationFrame(applyMapFocus);
    } else if (action === "select-building") {
      const id = trigger.dataset.id;
      ui.activeBuilding = ui.activeBuilding === id ? null : id;
      view.innerHTML = renderMap();
      requestAnimationFrame(applyMapFocus);
      if (window.matchMedia("(max-width: 1180px)").matches) {
        const side = view.querySelector(".map-side");
        if (side) requestAnimationFrame(() => side.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    } else if (action === "close-building") {
      if (!ui.activeBuilding) return;
      ui.activeBuilding = null;
      view.innerHTML = renderMap();
      requestAnimationFrame(applyMapFocus);
    } else if (action === "map-zoom-in") {
      updateMapZoom(ui.mapZoom + 0.2);
    } else if (action === "map-zoom-out") {
      updateMapZoom(ui.mapZoom - 0.2);
    } else if (action === "map-zoom-reset") {
      if (ui.activeRegion || ui.mapZoom !== 1) {
        ui.activeRegion = null;
        ui.mapZoom = 1;
        view.innerHTML = renderMap();
        requestAnimationFrame(applyMapFocus);
      } else {
        updateMapZoom(1);
      }
    } else if (action === "open-place") {
      location.hash = `place/${trigger.dataset.id}`;
      return;
    } else if (action === "open-create-group") {
      openGroupModal(trigger.dataset.place);
    } else if (action === "join-group") {
      handleJoin(trigger.dataset.id, false, trigger);
    } else if (action === "leave-group") {
      handleJoin(trigger.dataset.id, true, trigger);
    } else if (action === "check-in") {
      handleCheckIn(trigger.dataset.id, trigger);
    } else if (action === "gallery-prev") {
      changeGallery(-1);
    } else if (action === "gallery-next") {
      changeGallery(1);
    } else if (action === "gallery-goto") {
      ui.galleryIndex = Number(trigger.dataset.index);
      view.innerHTML = renderPlace();
    } else if (action === "show-sponsor") {
      openSponsor(trigger.dataset.place);
    } else if (action === "claim-sponsor") {
      closeModal(false);
      showToast("5 元券已放入卡包", "这是演示福利，到店出示星图徽章即可体验完整流程。");
    } else if (action === "filter-forum") {
      ui.forumCategory = trigger.dataset.filter;
      document.querySelectorAll('[data-action="filter-forum"]').forEach(chip => chip.classList.toggle("active", chip.dataset.filter === ui.forumCategory));
      reloadForumFeed();
    } else if (action === "sort-forum") {
      if (ui.forumSort === trigger.dataset.sort) return;
      ui.forumSort = trigger.dataset.sort;
      document.querySelectorAll('[data-action="sort-forum"]').forEach(button => button.classList.toggle("active", button.dataset.sort === ui.forumSort));
      reloadForumFeed();
    } else if (action === "toggle-post-like") {
      handleForumLike(trigger.dataset.id, trigger);
    } else if (action === "delete-post") {
      openDeletePostConfirm(trigger.dataset.id);
    } else if (action === "confirm-delete-post") {
      handleDeletePost(trigger.dataset.id);
    } else if (action === "filter-clubs") {
      ui.clubFilter = trigger.dataset.filter;
      document.querySelectorAll('[data-action="filter-clubs"]').forEach(chip => chip.classList.toggle("active", chip.dataset.filter === ui.clubFilter));
      loadClubResults();
    } else if (action === "club-slide-prev" || action === "club-slide-next") {
      goClubSlide(action === "club-slide-prev" ? -1 : 1);
      startClubCarousel();
    } else if (action === "club-slide-goto") {
      const target = Number(trigger.dataset.index);
      if (!Number.isNaN(target)) {
        goClubSlide(target - (clubSlideIndex % (ui.clubCatalog.events || []).length));
        startClubCarousel();
      }
    } else if (action === "clear-club-filters") {
      ui.clubFilter = "all";
      ui.clubQuery = "";
      clubSlideIndex = 0;
      view.innerHTML = renderClubs(ui.clubCatalog.clubs);
      startClubCarousel();
    } else if (action === "apply-club") {
      openApplication(trigger.dataset.id);
    } else if (action === "edit-profile") {
      openProfileModal();
    } else if (action === "pick-avatar-initial") {
      ui.profileDraft = { avatarType: "initial", avatarValue: "" };
      refreshProfilePreview();
    } else if (action === "pick-avatar-file") {
      const input = document.getElementById("avatar-file");
      if (input) input.click();
    } else if (action === "reset-data") {
      openResetConfirm();
    } else if (action === "confirm-reset") {
      Store.reset();
      closeModal(false);
      showToast("演示数据已重置", "已恢复初始探索进度，主题偏好保持不变。");
      if (location.hash === "#map" || !location.hash) handleRoute();
      else location.hash = "map";
    } else if (action === "close-modal") {
      closeModal();
    } else if (action === "retry-route") {
      handleRoute();
    }
  });

  document.addEventListener("submit", event => {
    if (event.target.id === "group-form") {
      event.preventDefault();
      submitGroup(event.target);
    } else if (event.target.id === "application-form") {
      event.preventDefault();
      submitApplication(event.target);
    } else if (event.target.id === "profile-form") {
      event.preventDefault();
      submitProfile(event.target);
    } else if (event.target.id === "club-search-form") {
      event.preventDefault();
      clearTimeout(searchTimer);
      loadClubResults();
    } else if (event.target.id === "forum-form") {
      event.preventDefault();
      submitForumPost(event.target);
    } else if (event.target.id === "comment-form") {
      event.preventDefault();
      submitForumComment(event.target);
    } else if (event.target.id === "forum-search-form") {
      event.preventDefault();
      clearTimeout(searchTimer);
      reloadForumFeed();
    }
  });

  document.addEventListener("change", event => {
    if (event.target.id === "avatar-file") handleAvatarFile(event.target);
  });

  document.addEventListener("input", event => {
    if (event.target.id === "club-search") {
      ui.clubQuery = event.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(loadClubResults, 260);
    } else if (event.target.id === "forum-search") {
      ui.forumQuery = event.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(reloadForumFeed, 260);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modalRoot.firstChild) closeModal();
    if (!modalRoot.firstChild && ui.activeRoute.name === "place" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      if (event.key === "ArrowLeft") changeGallery(-1);
      if (event.key === "ArrowRight") changeGallery(1);
    }
  });

  view.addEventListener("touchstart", event => {
    if (event.target.closest(".place-gallery")) touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  view.addEventListener("touchend", event => {
    if (touchStartX === null || !event.target.closest(".place-gallery")) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) > 45) changeGallery(distance > 0 ? -1 : 1);
  }, { passive: true });

  window.addEventListener("hashchange", handleRoute);
  let chinaSyncFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(chinaSyncFrame);
    chinaSyncFrame = requestAnimationFrame(syncChinaNode);
  });
  applyTheme();
  syncShellProfile();
  if (!location.hash) history.replaceState(null, "", "#map");
  handleRoute();
})();
