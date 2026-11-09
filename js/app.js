/* Campus Nova 单页交互原型：Hash 路由 + 统一事件委托 */
(function () {
  const Store = window.NovaStore;
  const API = window.NovaAPI;
  const activityTags = window.NovaActivityTags;
  const view = document.getElementById("app-view");
  const modalRoot = document.getElementById("modal-root");
  const toastRegion = document.getElementById("toast-region");
  const pilotClubId = "club-39";
  const pilotSignup = { contact: "小明", wechat: "CMH5123" };
  const pilotSchedule = [
    {
      id: "ai-talk-2", category: "技能实战", image: "assets/ai/seminar.jpg",
      title: "第二期 · 元启 · AI Talk Workshop",
      date: "2026-11-11", time: "15:00–17:00",
      venue: "笃行楼（教二）303", mapPoint: "teach-2",
      summary: "现场练习用 AI 写文稿、做视觉素材和整理信息，并为「百校造百岛」作品构思创意、写脚本和生成素材。"
    },
    {
      id: "workbuddy", category: "技能实战", image: "assets/ai/coding.jpg",
      title: "元启 · 实战工坊｜WorkBuddy 小程序开发实战",
      date: "2026-11-11", time: "19:00–21:00",
      venue: "笃行楼（教二）303", mapPoint: "teach-2",
      summary: "从一个点子出发，用自然语言描述需求，跟练微信小程序的生成、预览、修改和试用版发布。零代码基础也可参加。"
    },
    {
      id: "wowland", category: "技能实战", image: "assets/ai/robotics.jpg",
      title: "抖音校园 WowLand「百校造百岛」AIGC 3D 世界创作训练营",
      date: "2026-11-14", time: "08:30–18:00",
      venue: "创新楼（教三）304、305", mapPoint: "teach-3",
      summary: "线下分会场学习 3D 场景和互动玩法创作，分组制作并试玩作品，后续在线完善和提交。签到教室以分场通知为准。"
    }
  ];
  const isDemo = () => API.mode === "demo";

  const ui = {
    mapFilter: "all",
    placeQuery: "",
    mapZoom: 1,
    activeRegion: null,
    activeBuilding: null,
    clubFilter: "all",
    clubQuery: "",
    clubCatalog: { clubs: [], categories: [], events: [] },
    activityCategory: "",
    activityPeriod: "",
    activityType: "",
    activityMine: false,
    studentActivitiesAvailable: false,
    activities: [],
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
  let dormitoryViewer = null;
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

  const defaultAvatar = "assets/profile/nova-star.webp";

  function avatarImage(user) {
    const src = user.avatarType === "upload" && user.avatarValue ? user.avatarValue : defaultAvatar;
    return `<img src="${escapeHTML(src)}" alt="">`;
  }

  function avatarMarkup(user, className = "") {
    return `<span class="avatar avatar-photo ${className}">${avatarImage(user)}</span>`;
  }

  function applyAvatar(element, user) {
    if (!element) return;
    element.classList.add("avatar-photo");
    element.innerHTML = avatarImage(user);
  }

  function maskPhone(phone) {
    return phone ? phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2") : "";
  }

  function syncShellProfile() {
    const profile = Store.getProfile();
    document.querySelectorAll("[data-shell-avatar]").forEach(element => applyAvatar(element, profile));
    document.querySelectorAll("[data-shell-name]").forEach(element => { element.textContent = profile.name; });
    document.querySelectorAll("[data-shell-meta]").forEach(element => {
      element.textContent = isDemo() ? "本机体验档案" : `${profile.grade} · ${profile.verified ? "已认证" : "未认证"}`;
    });
  }

  function parseRoute() {
    const [name = "map", id] = (location.hash.slice(1) || "map").split("/");
    return { name, id };
  }

  function applyTheme() {
    const theme = Store.state.theme;
    document.documentElement.dataset.theme = theme;
    const hero = view.querySelector(".nova-hero-bg");
    if (hero) {
      hero.classList.toggle("is-light", theme !== "dark");
      hero.classList.toggle("is-dark", theme === "dark");
      hero.src = heroImageUrl(theme);
    }
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#04101E" : "#E7F3FD";
    if (window.NovaSky) window.NovaSky.setTheme(theme);
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(button => {
      button.setAttribute("aria-label", theme === "dark" ? "切换浅色主题" : "切换深色主题");
    });
    document.querySelectorAll("[data-theme-switch]").forEach(toggle => toggle.classList.toggle("on", theme === "dark"));
  }

  function heroImageUrl(theme) {
    return theme === "dark" ? "assets/hero/atlas-night.jpg?v=4" : "assets/hero/atlas-day.jpg?v=4";
  }

  function updateShell(route) {
    const activeNav = route.name === "place" ? "map" : route.name === "club" ? "clubs" : route.name === "thread" ? "forum" : ["map", "forum", "clubs", "me", "events"].includes(route.name) ? route.name : "map";
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
    } else if (route.name === "events") {
      meta = { eyebrow: "CAMPUS EVENTS", title: "校园活动", subtitle: "按兴趣发现校园里的活动。", documentTitle: "校园活动" };
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
        if (route.id && route.id !== "browse" && !mapBundle.pois?.some(poi => encodeURIComponent(poi.id) === route.id)) {
          throw new Error("没有找到这个地图点位。可返回星图后按地点名称搜索。");
        }
        if (route.id) {
          mapIntroVisible = false;
          ui.activeRegion = ui.activeBuilding = null;
          ui.mapFilter = "all";
          ui.mapZoom = 1;
          updateShell(route);
        }
        view.innerHTML = renderMap();
        requestAnimationFrame(() => {
          applyMapFocus();
          syncChinaNode();
          if (request === routeRequest && route.id) focusMapPoint(route.id);
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
      } else if (route.name === "events") {
        const isStudentDetail = route.id?.startsWith("student-");
        const [catalog, students] = await Promise.all([
          isStudentDetail ? null : API.fetchClubCatalog(),
          isStudentDetail ? API.fetchStudentActivities(route.id) :
            route.id ? null : API.fetchStudentActivities().catch(() => null)
        ]);
        if (request !== routeRequest) return;
        if (route.id) {
          const activity = isStudentDetail ? studentActivity(students) : campusActivities(catalog).find(item => item.id === route.id);
          if (!activity) throw new Error("没有找到这场活动。可返回校园活动列表继续浏览。");
          document.title = `${activity.title} · 校园活动 · 星图校园`;
          view.innerHTML = renderActivityDetail(activity);
        } else {
          ui.studentActivitiesAvailable = Array.isArray(students);
          if (!ui.studentActivitiesAvailable && ui.activityMine) {
            ui.activityMine = false;
            resetActivityFilters();
          }
          const studentFeed = (ui.studentActivitiesAvailable ? students : []).map(studentActivity)
            .sort((a, b) => a.upcoming !== b.upcoming ? Number(b.upcoming) - Number(a.upcoming) :
              a.upcoming ? a.startAt - b.startAt : b.startAt - a.startAt);
          ui.activities = [...studentFeed, ...campusActivities(catalog)];
          view.innerHTML = renderActivities();
        }
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
    const occupancy = group.total > 0 ? Math.min(100, Math.max(0, group.joined / group.total * 100)) : 0;
    // 示例头像图集为五列两行，按从左到右、从上到下的顺序编号。
    const portrait = group.hostPortrait;
    const hasPortrait = Number.isInteger(portrait) && portrait >= 0 && portrait < 10;
    const avatar = isMine ? avatarMarkup(profile, "host-avatar") : hasPortrait
      ? `<span class="avatar host-avatar group-portrait" aria-hidden="true" style="--portrait-x:${portrait % 5 * 25}%;--portrait-y:${Math.floor(portrait / 5) * 100}%">${escapeHTML(group.hostInitial)}</span>`
      : `<span class="avatar host-avatar" aria-hidden="true">${escapeHTML(group.hostInitial)}</span>`;
    let button = `<button class="button button-small" data-action="join-group" data-id="${group.id}">${isDemo() ? "体验加入" : "加入组局"} ${icon("plus")}</button>`;
    if (group.isOwner) button = `<button class="button button-small button-ghost" disabled>我发起的</button>`;
    else if (group.isJoined) button = `<button class="button button-small button-outline" data-action="leave-group" data-id="${group.id}">退出组局</button>`;
    else if (remaining === 0) button = `<button class="button button-small button-ghost" disabled>已经满员</button>`;

    return `<article class="group-card card">
      <div class="group-content">
        <div class="group-top">
          ${avatar}
          <div class="host-info"><strong>${escapeHTML(isMine ? profile.name : group.host)}</strong><span>${escapeHTML(group.hostMajor)}</span></div>
          <span class="tag tag-secondary">${escapeHTML(group.category)}${isDemo() ? group.isOwner ? " · 本机记录" : " · 示例" : ""}</span>
        </div>
        <h3>${escapeHTML(group.title)}</h3>
        <p class="group-description">${escapeHTML(group.description)}</p>
        <div class="group-meta">
          <span>${icon("clock")}${escapeHTML(group.time)} · ${escapeHTML(group.duration)}</span>
          <span>${icon("map-pin")}<a href="#place/${group.placeId}">${escapeHTML(place ? place.name : "校园地点")}</a></span>
        </div>
      </div>
      <div class="group-footer">
        <div class="seat-info">
          <span>${group.joined}/${group.total} 人已加入</span>
          <div class="progress-track group-seat-progress" aria-hidden="true"><span style="width:${occupancy}%"></span></div>
          <small>${remaining ? `还差 ${remaining} 人` : "全员就位"}</small>
        </div>
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
    const { places = [] } = ui.mapData;
    return `<div class="nova-intro view-enter">
      <section class="nova-hero" aria-label="星图校园 · 前言">
        <div class="nova-hero-media" aria-hidden="true">
          <img class="nova-hero-bg ${Store.state.theme === "dark" ? "is-dark" : "is-light"}" src="${heroImageUrl(Store.state.theme)}" alt="" decoding="async" fetchpriority="high">
        </div>

        <div class="nova-hero-inner">
          <div class="nova-hero-copy">
            <a class="nova-hero-brand" href="#map" aria-label="星图校园">
              <span class="nova-hero-mark"><img src="assets/logo-mark.svg?v=2" width="52" height="52" alt=""></span>
              <span class="nova-hero-brand-copy"><strong>星图校园</strong><small>一站聚合 · 连接校园</small></span>
            </a>

            <div class="nova-hero-divider" aria-hidden="true"></div>

            <p class="nova-hero-lead">找教学楼、食堂和校园地标</p>
            ${renderPlaceSearch()}

            <div class="nova-hero-quick" aria-label="快速入口">
              <button class="nova-quick" type="button" data-action="enter-campus-map">${icon("map-pin")}<span>校园地图</span></button>
              <a class="nova-quick" href="#events">${icon("calendar")}<span>校园活动</span></a>
              <a class="nova-quick" href="#forum">${icon("message-square")}<span>校园论坛</span></a>
              <a class="nova-quick" href="#clubs">${icon("star")}<span>社团介绍</span></a>
              <a class="nova-quick" href="panorama.html">${icon("camera")}<span>3D 与全景</span></a>
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
              <p class="nova-card-note">${icon("layers")}${ui.mapData.pois?.length || places.length} 个校园地标 · 校本部导览</p>
              <button class="nova-card-btn" type="button" data-action="enter-campus-map">进入校园 ${icon("arrow-right")}</button>
            </div>
          </div>
        </div>
      </section>
    </div>`;
  }

  function renderPlaceSearch() {
    return `<section class="place-search card" aria-label="地点搜索">
      <label for="place-search">搜索校园地点</label>
      <input id="place-search" type="search" placeholder="例如：图书馆、一饭、教二" value="${escapeHTML(ui.placeQuery)}" autocomplete="off" maxlength="60">
      <div id="place-search-results" aria-live="polite">${renderPlaceResults()}</div>
    </section>`;
  }

  function renderPlaceResults() {
    const { places = [], pois = [] } = ui.mapData;
    const query = ui.placeQuery.trim().toLowerCase();
    if (!query) {
      return `<div class="place-search-shortcuts">${places.slice(0, 3).map(place =>
        `<a class="chip" href="#place/${encodeURIComponent(place.id)}">${escapeHTML(place.shortName || place.name)}</a>`
      ).join("")}</div>`;
    }
    const terms = query.split(/\s+/);
    const entries = [...pois, ...places.filter(place => !pois.some(poi => poi.placeId === place.id))
      .map(place => ({ id: place.id, name: place.name, placeId: place.id, zone: place.categoryLabel }))];
    const matches = entries.filter(poi => {
      const place = places.find(item => item.id === poi.placeId);
      const text = [poi.name, poi.zone, place?.name, place?.shortName, place?.en].join(" ").toLowerCase();
      return terms.every(term => text.includes(term));
    });
    if (!matches.length) return '<p class="muted">没有找到地点。试试建筑名、简称或片区名。</p>';
    return `<p class="muted">找到 ${matches.length} 个地点${matches.length > 8 ? "，显示前 8 个" : ""}</p>
      <ul class="place-search-results">${matches.slice(0, 8).map(poi => {
        const place = places.find(item => item.id === poi.placeId);
        const route = place ? `#place/${encodeURIComponent(place.id)}` : `#map/${encodeURIComponent(poi.id)}`;
        return `<li><a href="${route}"${place ? "" : ` data-map-point="${escapeHTML(poi.id)}"`}><strong>${escapeHTML(poi.name)}</strong><small>${escapeHTML(poi.zone)} · ${place ? "地点详情" : "地图上定位"}</small></a></li>`;
      }).join("")}</ul>`;
  }

  function focusMapPoint(id) {
    const pin = [...view.querySelectorAll(".map-pill")].find(item => encodeURIComponent(item.dataset.poiId) === id);
    if (!pin) return;
    view.querySelectorAll(".map-pill.is-open").forEach(item => item.classList.remove("is-open"));
    pin.classList.add("is-open");
    pin.focus({ preventScroll: true });
    pin.scrollIntoView({ block: "center", inline: "center" });
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
      <p>选择片区，再点击地图热点查看建筑档案。东北宿舍的学生住宿建筑可打开独立三维模型。</p>
      <div class="building-guide-list">${rows}</div>
      <p class="building-guide-note">${icon("info")}地图位置及建筑外观为近似示意。</p>
    </section>`;
  }

  function buildingCard(building) {
    const region = regionMeta(building.region);
    const place = building.placeId ? Store.getPlace(building.placeId) : null;
    const name = escapeHTML(building.name);
    const image = building.residenceModel ? `assets/buildings/residences/${building.id}.webp` : `assets/buildings/${building.file}`;
    return `<section class="building-card card" style="--rc:${region.color}">
      <div class="building-card-media">
        <img src="${image}" alt="${name}${building.residenceModel ? "的三维外观渲染" : "的等距建筑单元"}" decoding="async">
        <button class="building-card-close" type="button" data-action="close-building" aria-label="关闭建筑档案">${icon("x")}</button>
        <span class="building-card-tag">${building.id}</span>
      </div>
      <div class="building-card-body">
        <span class="eyebrow">${region.name} · ${building.residenceModel ? "RESIDENCE MODEL" : "ISOMETRIC UNIT"}</span>
        <h2>${name}</h2>
        <div class="building-meta">
          <span>${icon("layers")}${building.residenceModel ? "外观近似" : `约 ${building.floors} 层`}</span>
          <span>${icon("map-pin")}${region.name}</span>
          <span>${building.residenceModel ? "Blender 建模" : "矢量近似"}</span>
        </div>
        <p>${building.residenceModel ? "依据全景和校园地图制作。楼层、尺寸及遮挡面为估计。" : escapeHTML(building.note)}</p>
        ${building.residenceModel ? `<button class="button button-small building-model-open" type="button" data-action="open-dormitory-model" data-id="${building.id}">${icon("rotate-ccw")}查看 3D 模型</button>` : ""}
        ${place
          ? `<a class="building-link" href="#place/${place.id}">${icon("arrow-right")}前往 ${escapeHTML(place.name)}</a>`
          : `<div class="building-note">${icon("info")}点击其他热点，继续查看建筑档案。</div>`}
      </div>
    </section>`;
  }

  async function openDormitoryModel(id) {
    const building = ui.mapData?.buildings.find(item => item.id === id && item.residenceModel);
    if (!building) return;
    const name = escapeHTML(building.name);
    openModal(`${modalHeader("RESIDENCE MODEL", name, "外观为近似示意，可切换角度查看。")}
      <div class="dormitory-stage">
        <img src="assets/buildings/residences/${id}.webp" alt="${name}的三维渲染预览">
      </div>
      <p class="dormitory-status muted" role="status">正在加载三维模型…</p>
      <div class="dormitory-tools" role="group" aria-label="模型视角" hidden>
        <button class="button button-small button-secondary" type="button" data-dormitory-view="rotateView">旋转视角</button>
        <button class="button button-small button-secondary" type="button" data-dormitory-view="zoomIn">放大</button>
        <button class="button button-small button-secondary" type="button" data-dormitory-view="zoomOut">缩小</button>
        <button class="button button-small button-secondary" type="button" data-dormitory-view="reset">复位</button>
      </div>`);
    const viewer = new AbortController();
    dormitoryViewer = viewer;
    const container = modalRoot.querySelector(".dormitory-stage");
    const status = modalRoot.querySelector(".dormitory-status");
    const tools = modalRoot.querySelector(".dormitory-tools");
    try {
      const { mountDormitory } = await import("./dormitory-viewer.js");
      await mountDormitory(container, id, viewer.signal, controls => {
        tools.hidden = !controls;
        container.classList.toggle("is-ready", Boolean(controls));
        status.textContent = controls ? "拖动平移，滚轮或双指缩放。也可用下方按钮操作。" : "三维模型暂不可用，当前显示渲染预览。";
        tools.onclick = controls ? event => {
          const action = event.target.closest("[data-dormitory-view]")?.dataset.dormitoryView;
          if (action) controls[action]();
        } : null;
      });
    } catch (error) {
      if (viewer.signal.aborted) return;
      console.warn("Dormitory model could not load", error);
      status.textContent = "三维模型暂不可用，当前显示渲染预览。";
    }
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
      return `<button class="building-pin${building.residenceModel ? " is-residence" : ""}${active ? " is-active" : ""}" style="left:${building.x}%;top:${building.y}%;--rc:${color}" data-action="select-building" data-id="${building.id}" aria-pressed="${active ? "true" : "false"}" aria-label="查看${escapeHTML(building.name)}建筑档案">
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
      return `<button class="map-pill ${dimmed ? "is-dimmed" : ""}" style="left:${poi.x}%;top:${poi.y}%;--pc:${type.color};--pb:${type.bg}" ${action} data-poi-id="${escapeHTML(poi.id)}" data-type="${poi.type}" aria-label="${escapeHTML(poi.name)}，${type.label}，${poi.zone}">
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
    const mapStage = `<div class="campus-map-stage is-iso" style="transform:scale(${ui.mapZoom})"><img class="map-photo is-iso" src="assets/campus-bg.webp" alt="东莞职业技术学院校本部等距校园地图" draggable="false" decoding="async" fetchpriority="high">${buildingPins}${poiPins}</div>`;
    const mapControls = `<div class="map-zoom-controls" aria-label="地图缩放控制">
      <button type="button" data-action="map-zoom-in" aria-label="放大地图" title="放大" ${ui.mapZoom >= zoomMax ? "disabled" : ""}>${icon("zoom-in")}</button>
      <button type="button" data-action="map-zoom-out" aria-label="缩小地图" title="缩小" ${ui.mapZoom <= 1 ? "disabled" : ""}>${icon("zoom-out")}</button>
      <button type="button" data-action="map-zoom-reset" aria-label="重置地图视图" title="重置视图">${icon("rotate-ccw")}</button>
    </div>`;

    return `<div class="view-enter">
      ${renderPlaceSearch()}
      <div class="map-layout stagger">
        <section class="map-card card" aria-label="校园探索地图">
          <a class="button button-small button-secondary map-panorama-link" href="panorama.html">${icon("camera")}3D 与全景</a>
          <div class="map-toolbar">
            <div class="filter-chips" aria-label="地点分类">${categories}</div>
            <span class="map-scale">${icon("navigation")}${pois.length} 个地图点位 · ${new Set(pois.map(poi => poi.type)).size} 类标注</span>
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
          ${ui.activeRegion === "ne" ? `<div class="residence-picker">
            <label for="residence-picker">宿舍建筑档案</label>
            <select id="residence-picker">
              <option value="">选择楼栋</option>
              ${buildings.filter(building => building.residenceModel).map(building => `<option value="${building.id}"${selectedBuilding?.id === building.id ? " selected" : ""}>${escapeHTML(building.name)}</option>`).join("")}
            </select>
          </div>` : ""}
          <div class="map-caption">
            <div class="map-legend"><span><i class="legend-dot" style="--lc:#3E6FA8;--lb:#EAF2FB"></i>教学楼</span><span><i class="legend-dot" style="--lc:#2F8F63;--lb:#E8F5EC"></i>宿舍</span><span><i class="legend-dot" style="--lc:#C9762F;--lb:#FDF1E3"></i>生活服务</span><span><i class="legend-dot" style="--lc:#7A5AA6;--lb:#F1ECFA"></i>其他</span></div>
            <span>底图：校本部等距插画 · 点击标签查看所属板块${ui.activeRegion ? " · 当前片区已显示建筑热点" : ""}</span>
          </div>
        </section>
        <aside class="map-side">
          ${selectedBuilding ? buildingCard(selectedBuilding) : buildingGuideCard(buildings)}
          <section class="next-card card"><div class="next-card-header"><h3>${isDemo() ? "体验校园组局" : "接下来，去哪儿？"}</h3><span class="live-label">${isDemo() ? "仅当前浏览器" : "组局活动"}</span></div>${upcoming}</section>
        </aside>
      </div>
      <section class="section-block">
        <div class="section-heading"><div><span class="eyebrow">校园活动</span><h2>${isDemo() ? "校园组局体验" : "校园组局"}</h2><p>${isDemo() ? "示例活动和操作记录仅在当前浏览器可见。" : "按地点发现校园活动。"}</p></div><button class="text-button" data-action="open-create-group" data-place="${defaultPlaceId}">${isDemo() ? "体验发起组局" : "发起我的组局"} ${icon("plus")}</button></div>
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

  function selectBuilding(id, fromPicker = false) {
    ui.activeBuilding = id || null;
    view.innerHTML = renderMap();
    requestAnimationFrame(() => {
      applyMapFocus();
      if (ui.activeBuilding && window.matchMedia("(max-width: 1180px)").matches) {
        view.querySelector(".map-side")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (fromPicker) {
        document.getElementById("residence-picker")?.focus({ preventScroll: true });
      }
    });
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
    const point = (ui.mapData?.pois || window.NovaDB.campusPois).find(poi => poi.placeId === place.id);
    const mapLink = `#map/${point ? encodeURIComponent(point.id) : "browse"}`;
    const lit = Store.state.litPlaceIds.includes(place.id);
    const index = Math.max(0, Math.min(ui.galleryIndex, place.images.length - 1));
    ui.galleryIndex = index;
    const guideContent = `
      ${place.menu?.length ? `<section class="guide-card card"><div class="card-heading"><h3>${icon("utensils")}参考菜单</h3><span>供应和价格以现场为准</span></div><div class="menu-list">${place.menu.map(item => `<div class="menu-item"><span class="menu-icon">${icon("utensils")}</span><div><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.stall)}</small></div><span class="menu-price">${escapeHTML(item.price)}</span></div>`).join("")}</div></section>` : ""}
      ${place.tips?.length ? `<section class="guide-card card"><div class="card-heading"><h3>${icon("lightbulb")}地点提示</h3></div><div class="tip-list">${place.tips.map((tip, i) => `<div class="tip-item"><span class="tip-number">${i + 1}</span><div><strong>${escapeHTML(tip.title)}</strong><p>${escapeHTML(tip.text)}</p></div></div>`).join("")}</div></section>` : ""}`;
    const groupContent = groups.length ? `<div class="group-list">${groups.map(groupCard).join("")}</div>` : `<div class="empty-state">${icon("users")}<h3>这里还很安静</h3><p>成为第一个发起组局的人，让同好知道你现在想做什么。</p><button class="button button-small" data-action="open-create-group" data-place="${place.id}">${icon("plus")}发起第一场组局</button></div>`;

    return `<div class="view-enter">
      <nav class="breadcrumb" aria-label="面包屑"><a href="${mapLink}">${icon("arrow-left")}${point ? "在地图上查看" : "返回校园地图"}</a><span>/</span><span>${place.categoryLabel}</span><span>/</span><strong>${place.name}</strong></nav>
      <div class="place-hero stagger">
        <div class="place-gallery" aria-label="${place.name}地点图片">
          <img src="${place.images[index]}" alt="${place.name} · ${place.imageLabels[index]}" decoding="async" fetchpriority="high">
          <div class="gallery-shade"></div><span class="gallery-label">${icon("camera")}${place.imageLabels[index]}</span>
          ${place.images.length > 1 ? `<div class="gallery-dots">${place.images.map((_, i) => `<button class="gallery-dot ${i === index ? "active" : ""}" data-action="gallery-goto" data-index="${i}" aria-label="查看第 ${i + 1} 张图片"></button>`).join("")}</div>
          <div class="gallery-controls"><button class="icon-button" data-action="gallery-prev" aria-label="上一张图片">${icon("chevron-left")}</button><span class="gallery-count">${index + 1} / ${place.images.length}</span><button class="icon-button" data-action="gallery-next" aria-label="下一张图片">${icon("chevron-right")}</button></div>` : ""}
        </div>
        <section class="place-summary card">
          <div class="place-summary-top"><span class="tag tag-primary">${place.categoryLabel}</span></div>
          <h2>${place.name}</h2><p class="place-en">${place.en}</p><p class="place-description">${place.description}</p>
          <div class="place-facts"><div>${icon("clock")}${place.hours ? `参考开放时间 · ${escapeHTML(place.hours)}，以学校公告为准` : "开放与通行安排以学校公告或现场指引为准。"}</div>${point ? `<div>${icon("map-pin")}<a href="${mapLink}">在地图上定位 ${escapeHTML(place.shortName || place.name)}</a></div>` : ""}</div>
          ${lit ? `<div class="checkin-success">${icon("circle-check")}已点亮此地，探索积分已收入档案</div>` : ""}
          <div class="place-actions" style="margin-top:16px"><button class="button ${lit ? "button-ghost" : "button-secondary"}" data-action="check-in" data-id="${place.id}" ${lit ? "disabled" : ""}>${icon(lit ? "check" : "map-pin")}${lit ? "已点亮地点" : "点亮地点 +20"}</button><button class="button" data-action="open-create-group" data-place="${place.id}">${icon("plus")}${isDemo() ? "体验组局" : "一键组局"}</button></div>
          ${isDemo() ? '<p class="muted">点亮记录保存在当前浏览器。</p>' : ""}
        </section>
      </div>
      <div class="detail-grid">
        <div class="detail-main">${guideContent}<section class="groups-panel card" aria-labelledby="place-groups-title">
          <div class="card-heading group-panel-heading">
            <h3 id="place-groups-title"><span class="group-panel-icon">${icon("users")}</span>${isDemo() ? "地点组局示例" : "地点组局"}</h3>
            <span class="group-panel-count">${groups.length} 场组局</span>
          </div>${groupContent}
        </section></div>
        <aside class="detail-aside">
          <section class="next-card card"><div class="next-card-header"><h3>地点资料</h3><span class="tag">校园指南</span></div><p class="muted">图片供识别地点时参考。发现位置有误或有最新的开放通知，可通过「用户反馈」告诉我们。</p></section>
        </aside>
      </div>
    </div>`;
  }

  function changeGallery(direction) {
    if (!ui.placeData || ui.placeData.place.images.length < 2) return;
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
      showToast(leave ? "已退出组局" : "已加入组局", isDemo() ? "本次操作仅保存在当前浏览器。" : leave ? "可以继续在星图中寻找其他同好。" : `${group.time} · ${(Store.getPlace(group.placeId) || {}).name || "校园地点"}，记得准时赴约。`);
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
    button.textContent = "正在点亮地点…";
    try {
      const result = await API.checkIn(placeId);
      const place = Store.getPlace(placeId);
      showToast(result.isNew ? `点亮${place.name} · +20 积分` : "这个地点已经点亮", result.isNew ? "新的校园足迹已写入你的探索档案。" : "去其他地点继续探索吧。");
      if (ui.activeRoute.name === "place") view.innerHTML = renderPlace();
    } catch (error) {
      showToast("未能点亮地点", error.message, "error");
      button.disabled = false;
      button.innerHTML = `${icon("map-pin")}点亮地点 +20`;
    }
  }

  function openModal(content, small = false, variant = "") {
    if (dormitoryViewer) closeModal(false);
    lastFocused = document.activeElement;
    modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-backdrop><section class="modal ${small ? "modal-small" : ""} ${variant}" role="dialog" aria-modal="true"><div class="modal-handle"></div>${content}</section></div>`;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => {
      const target = modalRoot.querySelector("input, select, textarea, button");
      if (target) target.focus();
    });
  }

  function closeModal(restoreFocus = true) {
    if (!modalRoot.firstChild) return;
    dormitoryViewer?.abort();
    dormitoryViewer = null;
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
    openModal(`${modalHeader("CREATE A MEETUP", isDemo() ? "体验发起组局" : "发起组局", `集合地点为 ${place.name}。`)}
      <form id="group-form" data-place="${place.id}" novalidate>
        <div class="form-note">${icon("info")}${isDemo() ? "体验组局仅保存在当前浏览器，其他同学不会收到通知。" : "请发布真实的校园活动。"}</div>
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
      showToast(isDemo() ? "组局示例已保存" : "组局发布成功 · +15 积分", isDemo() ? "本次操作仅保存在当前浏览器。" : "已展示在对应地点，也加入了你的个人组局列表。");
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

  /* 按社团名称匹配主题封面，未命中时使用同类别素材 */
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

  /* 专属主题封面优先于名称匹配 */
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

  const clubWebpPhotos = new Set(["club-1", "club-83"]);

  function clubPhoto(club) {
    if (clubWebpPhotos.has(club.id)) return `assets/clubs/${club.id}.webp`;
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
    const applied = !isDemo() && club.id !== pilotClubId && Store.state.applications.some(item => item.clubId === club.id);
    return `<article class="club-card card"><a href="#club/${club.id}" aria-label="查看${club.name}"><div class="club-card-image"><img class="club-card-photo" src="${clubPhoto(club)}" alt="${club.id === "club-1" ? "编辑部封面插画" : `${escapeHTML(club.name)}主题配图`}" loading="lazy" decoding="async"><span class="tag">${club.category}</span></div></a><div class="club-card-body"><div class="club-title-row">${clubLogo(club)}<div><h3>${club.name}</h3><span>${club.slogan}</span></div></div><p>${club.description}</p><div class="club-stats"><span>${icon("shield-check")}${club.status}</span><span>${icon("school")}${club.unit}</span></div><div class="club-card-footer"><span>${applied ? "申请已提交" : club.recruit}</span><a href="#club/${club.id}">${applied ? "查看申请" : "了解社团"}${icon("arrow-right")}</a></div></div></article>`;
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
    const ctaHref = event.cta?.href || `#club/${club.id}`;
    const ctaLabel = event.cta ? event.cta.label : `${club.name} · 查看详情`;
    return `<section class="club-feature club-carousel" id="club-carousel" aria-label="${isDemo() ? "往期社团活动轮播" : "近期社团活动轮播"}">
      <div class="club-feature-copy club-slide">
        <span class="eyebrow">CLUB EVENTS · ${isDemo() ? "往期社团活动" : "近期社团动态"}</span>
        <div class="club-slide-meta"><span class="club-slide-tag">${event.kind}</span><span>${icon("calendar")}${[event.date, event.weekday, event.time].filter(Boolean).join(" ")}</span><span>${icon("map-pin")}${event.place}</span></div>
        <h2>${event.title}</h2>
        <p>${event.desc}</p>
        ${event.cta?.directory ? `<button class="button" data-action="show-club-directory">${ctaLabel} ${icon("arrow-right")}</button>` : `<a class="button" href="${ctaHref}">${ctaLabel} ${icon("arrow-right")}</a>`}
        <div class="club-carousel-controls">
          <button class="icon-button" data-action="club-slide-prev" aria-label="上一个活动">${icon("chevron-left")}</button>
          <div class="club-carousel-dots">${events.map((item, i) => `<button class="club-dot" data-action="club-slide-goto" data-index="${i}" aria-current="${i === index}" aria-label="第 ${i + 1} 个活动：${item.title}"></button>`).join("")}</div>
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
    return `<div class="view-enter">
      <section class="card pilot-card"><div><span class="eyebrow">社团试点</span><h2>元启AI社</h2><p>查看活动日程、报名方式和往期活动。</p></div><a class="button button-secondary" href="#club/${pilotClubId}">查看元启AI社 ${icon("arrow-right")}</a></section>
      ${renderClubCarousel()}
      <div class="club-tools"><div class="filter-chips">${categories.map(category => `<button class="chip ${ui.clubFilter === category ? "active" : ""}" data-action="filter-clubs" data-filter="${category}">${category === "all" ? "全部社团" : `<span class="chip-dot" style="background:${clubTone(category)[0]}"></span>${category}`}</button>`).join("")}</div><form class="search-box" id="club-search-form"><label class="sr-only" for="club-search" style="position:absolute;left:-9999px">搜索社团</label>${icon("search")}<input id="club-search" type="search" placeholder="搜索社团或兴趣…" value="${escapeHTML(ui.clubQuery)}" autocomplete="off"></form></div>
      ${isDemo() ? '<p class="muted">社团资料来自项目名录，封面为主题配图。最新招新安排以校方或社团通知为准。</p>' : ""}
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
    const application = isDemo() ? null : Store.state.applications.find(item => item.clubId === club.id);
    const place = Store.getPlace(club.locationId);
    const isPilot = club.id === pilotClubId;
    const applyContent = isPilot ? renderPilotSignup() : isDemo()
      ? "<p>此社团的报名渠道待核实。请留意学校或社团发布的招新通知。</p>"
      : application
        ? `<div class="applied-state"><h3>申请已提交</h3><p>当前状态：${escapeHTML(application.status)}。</p></div>`
        : `<button class="button button-block" data-action="apply-club" data-id="${club.id}">${icon("user-plus")}申请加入社团</button>`;
    const events = isPilot
      ? (window.NovaDB.clubEvents || []).filter(event => event.clubId === pilotClubId && event.signup.includes("已结束"))
      : club.activities;
    return `<div class="view-enter"><nav class="breadcrumb" aria-label="面包屑"><a href="#clubs">${icon("arrow-left")}返回社团矩阵</a><span>/</span><span>${club.category}</span><span>/</span><strong>${club.name}</strong></nav>
      <section class="club-hero"><img class="club-hero-photo" src="${clubPhoto(club)}" alt="${club.id === "club-1" ? "编辑部封面插画" : `${escapeHTML(club.name)}主题配图`}" decoding="async"><div class="club-hero-copy">${clubLogo(club)}<span class="eyebrow" style="color:#B9E1D5">${club.category} · ${club.recruit}</span><h2>${club.name}</h2><p>${club.slogan}</p><div class="club-hero-meta"><span>${icon("shield-check")}${club.status}</span><span>${icon("school")}指导教师 ${club.advisor}</span>${!isDemo() && place ? `<span>${icon("map-pin")}${place.name}</span>` : ""}</div></div></section>
      <div class="club-detail-grid"><div class="club-detail-main">${isPilot ? renderPilotSchedule() : ""}<section class="club-content-card card"><div class="card-heading"><h3>关于我们</h3><span>CLUB STORY</span></div><p>${club.detail}</p></section><section class="club-content-card card"><div class="card-heading"><h3>${isPilot ? "活动回顾" : "活动资料"}</h3><span>${isPilot ? "已结束" : "安排以社团通知为准"}</span></div>${events.length ? `<div class="activity-timeline">${events.map(activity => `<div class="activity-item"><time>${activity.date}</time><div><strong>${activity.title}</strong><p>${isPilot ? `${activity.place} · ` : ""}${activity.desc}</p></div></div>`).join("")}</div>` : `<p class="muted">暂无公开活动资料。</p>`}</section></div>
      <aside class="club-detail-aside"><section class="apply-card card"><div class="card-heading"><h3>报名方式</h3><span class="tag">${isPilot ? "社团试点" : "招新信息"}</span></div>${applyContent}</section>${!isDemo() && place ? `<section class="club-content-card card"><div class="card-heading"><h3>地点参考</h3><span>以活动通知为准</span></div><div class="compact-list"><a class="compact-list-item" href="#place/${place.id}">${icon("map-pin")}<div><strong>${place.name}</strong><small>打开校园地点指南</small></div>${icon("chevron-right")}</a></div></section>` : ""}</aside></div></div>`;
  }

  function pilotEventEnded(event) {
    const endTime = event.time.split("–")[1];
    return Date.now() >= Date.parse(`${event.date}T${endTime}:00+08:00`);
  }

  function campusActivities({ clubs, events = [] }) {
    const schedule = pilotSchedule.map(event => ({
      ...event,
      clubId: pilotClubId,
      dateLabel: event.date.replace(/^(\d+)-(\d+)-(\d+)$/, (_, year, month, day) => `${year}年${Number(month)}月${Number(day)}日`),
      status: pilotEventEnded(event) ? "计划时间已过" : "拟定安排"
    }));
    const archive = events.map(event => ({
      ...event,
      venue: event.place,
      summary: event.desc,
      dateLabel: [event.date, event.weekday].filter(Boolean).join(" "),
      status: "往期活动"
    }));
    const upcoming = schedule.filter(event => event.status === "拟定安排");
    const elapsed = schedule.filter(event => event.status === "计划时间已过").reverse();
    return [...upcoming, ...elapsed, ...archive]
      .map(event => ({
        ...event,
        type: "社团活动",
        category: event.category === "运动赛事" ? "运动健身" : event.category,
        upcoming: event.status === "拟定安排",
        club: clubs.find(club => club.id === event.clubId)
      }));
  }

  function studentActivity(event) {
    const upcoming = !event.cancelled && event.startAt > Date.now();
    const [year, month, day] = event.start.slice(0, 10).split("-");
    return {
      ...event, student: true, upcoming,
      dateLabel: `${year}年${Number(month)}月${Number(day)}日`, time: event.start.slice(11),
      status: event.cancelled ? "已取消" : !upcoming ? "已到活动时间" : event.count >= event.capacity ? "已满员" : "招募中"
    };
  }

  const activityThemeGroups = [
    ["学习与发展", ["学习自习", "技能实战", "就业创业"]],
    ["运动与生活", ["运动健身", "美食聚餐", "文艺娱乐"]],
    ["校园参与", ["志愿公益", "社团交流"]]
  ];

  function activityThemeLabel(category) {
    return category === "其他" ? "其他主题" : category;
  }

  function activityOption(value, label = value, selected = "") {
    return `<option value="${escapeHTML(value)}"${value === selected ? " selected" : ""}>${escapeHTML(label)}</option>`;
  }

  function activityThemeOptions(selected = "", includeClubThemes = false) {
    const categories = new Set(Object.keys(activityTags.categories));
    if (includeClubThemes) ui.activities.forEach(event => categories.add(event.category || "其他"));
    const groups = activityThemeGroups.map(([label, keys]) => {
      const options = keys.filter(key => categories.delete(key)).map(key => activityOption(key, key, selected));
      return `<optgroup label="${label}">${options.join("")}</optgroup>`;
    });
    return groups.join("") + [...categories].map(key => activityOption(key, activityThemeLabel(key), selected)).join("");
  }

  function activityLabels(event) {
    return `<p class="activity-tags"><span>${escapeHTML(event.type)}</span><span>${escapeHTML(activityThemeLabel(event.category || "其他"))}</span></p>`;
  }

  function activityMeta(event, showMap = false) {
    return `<ul class="activity-meta">
      <li>${icon("calendar")}<span>${escapeHTML([event.dateLabel, event.time].filter(Boolean).join(" · "))}</span></li>
      <li>${icon("map-pin")}<span>${showMap && event.mapPoint ? `<a href="#map/${encodeURIComponent(event.mapPoint)}">${escapeHTML(event.venue)} · 地图定位</a>` : escapeHTML(event.venue)}</span></li>
      ${event.student ? `<li>${icon("users")}<span>${event.count} / ${event.capacity} 人（含发起人）</span></li>` : ""}
    </ul>`;
  }

  function activityCover(event) {
    return `<div class="activity-cover${event.student ? " activity-cover-student" : ""}">
      ${event.student ? `<span class="activity-cover-symbol">${icon(activityTags.categories[event.category])}</span>` :
        `<img src="${escapeHTML(event.image)}" alt="" loading="lazy" decoding="async">`}
      <span class="activity-status${event.upcoming && event.status !== "已满员" ? " is-planned" : ""}">${event.status}</span>
      ${event.mapPoint ? '<span class="activity-illustration">主题配图</span>' : ""}
    </div>`;
  }

  function filteredActivities() {
    return ui.activities.filter(event =>
      (!ui.activityType || event.type === ui.activityType) &&
      (ui.activityMine ? event.isOwner || event.joined : !event.cancelled) &&
      (!ui.activityCategory || (event.category || "其他") === ui.activityCategory) &&
      (!ui.activityPeriod || event.upcoming === (ui.activityPeriod === "planned"))
    );
  }

  function hasActivityFilters() {
    return Boolean(ui.activityType || ui.activityCategory || ui.activityPeriod);
  }

  function resetActivityFilters() {
    ui.activityType = ui.activityCategory = ui.activityPeriod = "";
  }

  function renderActivityResults(events) {
    return events.length ? `<div class="activity-grid">${events.map(event => `<article class="activity-card card">
        <a href="#events/${encodeURIComponent(event.id)}" aria-labelledby="activity-title-${escapeHTML(event.id)}">
          ${activityCover(event)}
          <div class="activity-card-body">
            ${activityLabels(event)}
            <h3 id="activity-title-${escapeHTML(event.id)}">${escapeHTML(event.title)}</h3>
            ${activityMeta(event)}
            <span class="activity-card-link" aria-hidden="true">查看详情 ${icon("arrow-right")}</span>
          </div>
        </a>
      </article>`).join("")}</div>` : `<div class="empty-state">
        ${icon("calendar")}${hasActivityFilters()
          ? "<h3>这个筛选下暂无活动</h3><p>调整筛选条件，或清除筛选查看全部。</p>"
          : ui.activityMine
            ? "<h3>你还没有发起或报名的活动</h3><p>发布一场活动，或去「发现活动」看看。</p>"
            : "<h3>暂无校园活动</h3><p>有新的活动发布后，会在这里显示。</p>"}
      </div>`;
  }

  function refreshActivityResults() {
    const events = filteredActivities();
    view.querySelector(".activity-count").textContent = `${events.length} 场活动`;
    view.querySelector('[data-action="clear-activity-filters"]').disabled = !hasActivityFilters();
    view.querySelector("#activity-results").innerHTML = renderActivityResults(events);
  }

  function renderActivityFilter(field, label, options) {
    return `<label class="activity-filter-field"><span>${label}</span>
      <span class="activity-filter-control">
        <select data-activity-filter="${field}">${options}</select>${icon("chevron-right")}
      </span>
    </label>`;
  }

  function renderActivityFeed() {
    const events = filteredActivities();
    const types = ui.activityMine ? activityTags.types : [...activityTags.types, "社团活动"];
    const typeOptions = activityOption("", "全部类型") + types.map(type => activityOption(type, type, ui.activityType)).join("");
    const themeOptions = activityOption("", "全部主题") + activityThemeOptions(ui.activityCategory, !ui.activityMine);
    const timeOptions = [["", "全部时间"], ["planned", "即将开始"], ["past", "往期与归档"]]
      .map(([value, label]) => activityOption(value, label, ui.activityPeriod)).join("");
    return `<div class="activity-feed-heading">
      <h2 id="activity-feed-title">活动列表</h2>
      ${ui.studentActivitiesAvailable ? `<div class="activity-scope" role="group" aria-label="浏览范围">
        <button type="button" data-action="activity-scope" data-scope="all" aria-pressed="${!ui.activityMine}">发现活动</button>
        <button type="button" data-action="activity-scope" data-scope="mine" aria-pressed="${ui.activityMine}">我的活动</button>
      </div>` : ""}
    </div>
    <div class="activity-filter-panel" role="group" aria-label="筛选活动">
      ${renderActivityFilter("activityType", "活动类型", typeOptions)}
      ${renderActivityFilter("activityCategory", "活动主题", themeOptions)}
      ${renderActivityFilter("activityPeriod", "活动时间", timeOptions)}
    </div>
    <div class="activity-results-heading">
      <p class="activity-count" role="status">${events.length} 场活动</p>
      <button class="text-button" type="button" data-action="clear-activity-filters"${hasActivityFilters() ? "" : " disabled"}>清除筛选</button>
    </div>
    <div id="activity-results">${renderActivityResults(events)}</div>`;
  }

  function renderActivities() {
    return `<div class="activity-page view-enter">
      <section class="activity-banner">
        <div><span class="eyebrow">CAMPUS EVENTS · 东莞职业技术学院</span>
          <h1>校园活动</h1>
          <p>约同学自习、运动、吃饭，也可以发起自己的校园活动。</p>
          ${ui.studentActivitiesAvailable ? `<button class="button activity-publish" type="button" data-action="open-student-activity">${icon("plus")}发布活动</button>` : ""}
        </div>
      </section>
      ${ui.studentActivitiesAvailable ? "" : `<p class="activity-service-note">学生活动暂时无法加载，目前可查看社团活动。 <button type="button" class="text-button" data-action="retry-route">重新加载</button></p>`}
      <section class="activity-feed" aria-labelledby="activity-feed-title">
        ${renderActivityFeed()}
      </section>
    </div>`;
  }

  function renderActivityDetail(event) {
    const planned = event.status === "拟定安排";
    return `<div class="activity-page view-enter">
      <a class="button button-secondary button-small activity-back" href="#events">${icon("arrow-left")} 返回校园活动</a>
      <div class="activity-detail">
        <article class="activity-detail-main card">
          ${activityCover(event)}
          <div class="activity-detail-copy">
            ${activityLabels(event)}
            <h1 tabindex="-1">${escapeHTML(event.title)}</h1>
            ${activityMeta(event, true)}
            <h2>活动介绍</h2>
            <p>${escapeHTML(event.summary)}</p>
          </div>
        </article>
        ${event.student ? renderStudentSignup(event) : `<aside class="activity-detail-side card">
          <h2>${planned ? "报名咨询" : "活动状态"}</h2>
          <p>${planned ? "本场为拟定安排。请先向社团确认举办时间和报名方式。" : event.status === "计划时间已过" ? "拟定的活动时间已过，是否举办以社团通知为准。" : "这场活动已归档，可查看活动资料。"}</p>
          ${planned ? renderPilotSignup(event.title) : ""}
          ${event.club ? `<a class="button button-secondary button-small" href="#club/${encodeURIComponent(event.club.id)}">了解${escapeHTML(event.club.name)} ${icon("arrow-right")}</a>` : ""}
        </aside>`}
      </div>
    </div>`;
  }

  function renderStudentSignup(event) {
    const canJoin = event.upcoming && !event.isOwner && !event.joined && event.count < event.capacity;
    const action = !event.upcoming ? "" : event.isOwner ? "cancel" : event.joined ? "leave" : canJoin ? "join" : "";
    const labels = { cancel: "取消活动", leave: "退出活动", join: "报名参加" };
    const note = event.cancelled ? "发起人已取消这场活动。" : !event.upcoming ? "已到活动时间，报名已关闭。" :
      event.isOwner ? "你发起了这场活动，已占用一个名额。" : event.joined ? "你已报名，请按时到集合地点。" :
        canJoin ? `还剩 ${event.capacity - event.count} 个名额，报名后请按时到场。` : "这场活动的名额已满。";
    return `<aside class="activity-detail-side card">
      <h2>参与活动</h2>
      <p class="activity-host">发起人 · ${escapeHTML(event.host)}</p>
      <p>${note}</p>
      ${action ? `<button class="button ${canJoin ? "" : "button-secondary"}" type="button" data-action="student-activity-action" data-operation="${action}" data-id="${event.id}">${labels[action]}</button>` : ""}
    </aside>`;
  }

  function openStudentActivity() {
    openModal(`${modalHeader("CAMPUS EVENTS", "发布校园活动", "同学们可以在活动页看到并报名。请填写校园公共集合点。")}
      <form id="student-activity-form" data-id="${API.newStudentActivityId()}">
        <div class="field"><label for="activity-title">活动标题</label><input id="activity-title" name="title" required minlength="2" maxlength="50" placeholder="例如：周四晚一起打羽毛球"></div>
        <div class="activity-form-grid">
          <div class="field"><label for="activity-type">活动类型</label><select id="activity-type" name="type" required><option value="">选择类型</option>${activityTags.types.map(type => `<option>${type}</option>`).join("")}</select></div>
          <div class="field"><label for="activity-category">活动主题</label><select id="activity-category" name="category" required><option value="">选择主题</option>${activityThemeOptions()}</select></div>
          <div class="field"><label for="activity-start">开始时间（北京时间）</label><input id="activity-start" name="start" type="datetime-local" required></div>
          <div class="field"><label for="activity-capacity">总人数（含发起人）</label><input id="activity-capacity" name="capacity" type="number" min="2" max="50" value="4" required></div>
        </div>
        <div class="field"><label for="activity-venue">集合地点</label><input id="activity-venue" name="venue" required minlength="2" maxlength="60" placeholder="例如：图书馆一楼入口"></div>
        <div class="field"><label for="activity-host">发起人昵称</label><input id="activity-host" name="host" required maxlength="16" value="${escapeHTML(Store.getProfile().name)}"></div>
        <div class="field"><label for="activity-summary">活动说明</label><textarea id="activity-summary" name="summary" rows="3" required minlength="5" maxlength="400" placeholder="说说活动安排、需要带什么，或怎么在现场认出你。"></textarea></div>
        <p class="form-note">${icon("info")}请勿填写手机号、宿舍房号等隐私信息。发布和报名记录可在本浏览器中管理。</p>
        <p class="activity-form-error" role="alert"></p>
        <div class="form-actions"><button type="button" class="button button-ghost" data-action="close-modal">取消</button><button type="submit" class="button">${icon("plus")}确认发布</button></div>
      </form>`, false, "activity-editor");
  }

  async function submitStudentActivity(form) {
    const button = form.querySelector('[type="submit"]');
    const errorRegion = form.querySelector('[role="alert"]');
    const values = Object.fromEntries(new FormData(form));
    button.disabled = true;
    errorRegion.textContent = "";
    try {
      const activity = await API.createStudentActivity({ ...values, capacity: Number(values.capacity), id: form.dataset.id });
      showToast("活动已发布", "其他同学现在可以查看详情和报名。");
      if (form.isConnected) {
        resetActivityFilters();
        ui.activityMine = false;
        location.hash = `events/${activity.id}`;
      }
    } catch (error) {
      errorRegion.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  }

  async function updateStudentSignup(id, action, button) {
    button.disabled = true;
    try {
      const activity = await API.updateStudentActivity(id, action);
      if (ui.activeRoute.name === "events" && ui.activeRoute.id === id) {
        closeModal(false);
        view.innerHTML = renderActivityDetail(studentActivity(activity));
        view.querySelector(".activity-detail h1").focus({ preventScroll: true });
      }
      showToast({ join: "报名成功", leave: "已退出活动", cancel: "活动已取消" }[action], "");
    } catch (error) {
      showToast("操作未完成", error.message, "error");
    } finally {
      button.disabled = false;
    }
  }

  function renderPilotSchedule() {
    return `<section class="club-content-card card">
      <div class="card-heading"><h3>活动日程</h3><span>拟定安排</span></div>
      <p>面向全校师生。活动安排和报名截止时间以社团通知为准。</p>
      <div class="activity-timeline">${pilotSchedule.map(event => {
        const [year, month, day] = event.date.split("-").map(Number);
        return `<div class="activity-item">
          <time datetime="${event.date}">${month}月${day}日</time>
          <div><strong>${event.title}</strong>
            <p>${year}年 · ${event.time} · <a href="#map/${event.mapPoint}">${event.venue}</a>${pilotEventEnded(event) ? " · 计划时间已过" : ""}</p>
            <p>${event.summary}</p>
          </div>
        </div>`;
      }).join("")}</div>
    </section>`;
  }

  function renderPilotSignup(eventTitle) {
    return `<div class="pilot-signup">
      <p>在微信搜索并添加报名联系人「${pilotSignup.contact}」。${eventTitle ? `请备注「星图校园 + ${escapeHTML(eventTitle)}」。` : "社团报名请备注「星图校园 + 元启AI社报名」。咨询活动报名时，请附上活动名称。"}</p>
      <label for="pilot-wechat">微信号</label>
      <div><input id="pilot-wechat" value="${pilotSignup.wechat}" readonly><button class="button button-small" type="button" data-action="copy-pilot-wechat">复制微信号</button></div>
      <p id="pilot-copy-status" class="muted" role="status"></p>
    </div>`;
  }

  async function copyPilotWechat() {
    const field = document.getElementById("pilot-wechat");
    const status = document.getElementById("pilot-copy-status");
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(field.value);
      } else {
        field.select();
        if (!document.execCommand("copy")) throw new Error("Copy unavailable");
      }
      status.textContent = "微信号已复制，请打开微信添加。";
    } catch {
      field.focus();
      field.select();
      status.textContent = "已选中微信号，可手动复制。";
    }
  }

  function openApplication(clubId) {
    if (isDemo() || clubId === pilotClubId) return;
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
    if (isDemo() || form.dataset.club === pilotClubId) return;
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
    openModal(`${modalHeader("MY NOVA · 个人档案", "编辑个人资料", "头像、姓名和手机号仅保存在当前浏览器。")}
      <form id="profile-form" novalidate>
        <div class="profile-avatar-editor">
          <div class="profile-edit-head">
            <span class="avatar profile-avatar-preview" id="profile-avatar-preview"></span>
            <div><h3>个人头像</h3><p id="profile-avatar-caption" aria-live="polite"></p></div>
          </div>
          <div class="avatar-options">
            <button type="button" class="avatar-option" data-action="pick-avatar-initial" aria-pressed="false">
              <span class="avatar-option-icon"><img src="${defaultAvatar}" alt=""></span>
              <span>使用默认头像</span>
            </button>
            <button type="button" class="avatar-option" data-action="pick-avatar-file">
              <span class="avatar-option-icon">${icon("camera")}</span><span>上传照片</span>
            </button>
          </div>
        </div>
        <input type="file" id="avatar-file" accept="image/png,image/jpeg,image/webp" hidden>
        <div class="profile-edit-fields">
          <div class="field"><label for="profile-name">姓名<span aria-hidden="true"> *</span></label><input id="profile-name" name="name" maxlength="12" value="${escapeHTML(profile.name)}" autocomplete="name" required>${fieldError("name")}</div>
          <div class="field"><label for="profile-phone">手机号<small>选填</small></label><input id="profile-phone" name="phone" type="tel" inputmode="numeric" maxlength="11" value="${escapeHTML(profile.phone)}" placeholder="11 位手机号" autocomplete="tel-national" aria-describedby="profile-phone-hint">${fieldError("phone")}</div>
        </div>
        <p class="profile-edit-privacy" id="profile-phone-hint">${icon("shield-check")}个人资料页会隐藏手机号的中间四位。</p>
        <div class="form-actions"><button type="button" class="button button-ghost" data-action="close-modal">取消</button><button type="submit" class="button">${icon("check")}保存资料</button></div>
      </form>`, false, "profile-editor");
    const title = modalRoot.querySelector(".profile-editor h2");
    title.id = "profile-editor-title";
    title.closest("[role=dialog]").setAttribute("aria-labelledby", title.id);
    refreshProfilePreview();
  }

  function refreshProfilePreview() {
    const preview = document.getElementById("profile-avatar-preview");
    if (!preview || !ui.profileDraft) return;
    applyAvatar(preview, { ...Store.getProfile(), ...ui.profileDraft });
    const isUpload = ui.profileDraft.avatarType === "upload" && Boolean(ui.profileDraft.avatarValue);
    modalRoot.querySelector('[data-action="pick-avatar-initial"]').setAttribute("aria-pressed", String(!isUpload));
    document.getElementById("profile-avatar-caption").textContent = isUpload ? "自定义照片" : "星图小星 · 默认头像";
  }

  function handleAvatarFile(input) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("无法使用这个文件", "请选择 JPG、PNG 或 WebP 图片。", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("图片太大了", "请选择 8MB 以内的图片。", "error");
      return;
    }
    const draft = { ...ui.profileDraft };
    ui.profileDraft = draft;
    const isCurrent = () => input.isConnected && ui.profileDraft === draft;
    const reportError = () => {
      if (isCurrent()) showToast("图片读取失败", "换一张图片再试试。", "error");
    };
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (!isCurrent()) return;
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
      image.onerror = reportError;
      image.src = reader.result;
    };
    reader.onerror = reportError;
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
    const pointsPerLevel = 200;
    const level = Math.floor(stats.points / pointsPerLevel) + 1;
    const levelPoints = stats.points % pointsPerLevel;
    const profileStats = [
      { label: "已点亮地点", value: stats.lit, icon: "map-pin" },
      { label: "我的组局", value: stats.groups, icon: "users" },
      { label: isDemo() ? "历史申请示例" : "社团申请", value: stats.clubs, icon: "user-plus" },
      { label: "探索积分", value: stats.points, icon: "star" }
    ];
    const myGroups = Store.getGroups().filter(group => group.isJoined);
    const groupList = myGroups.length ? myGroups.map(group => {
      const place = Store.getPlace(group.placeId) || placeMap.get(group.placeId);
      return `<a class="compact-list-item" href="#place/${group.placeId}">${icon("calendar")}<div><strong>${escapeHTML(group.title)}</strong><small>${escapeHTML(group.time)} · ${escapeHTML(place ? place.name : "校园地点")}</small></div>${icon("chevron-right")}</a>`;
    }).join("") : `<div class="empty-state" style="padding:22px">${icon("users")}<p>${isDemo() ? "加入或发起组局后，本机记录会显示在这里。" : "加入或发起组局后，你的活动会显示在这里。"}</p><a class="text-button" href="#map/browse">去星图看看</a></div>`;
    const applicationList = applications.length ? applications.map(application => {
      return `<a class="compact-list-item" href="#club/${application.clubId}">${icon("heart")}<div><strong>${escapeHTML(application.clubName || "社团")}</strong><small>${escapeHTML(application.time)} · ${isDemo() ? "本机历史示例" : escapeHTML(application.status)}</small></div>${icon("chevron-right")}</a>`;
    }).join("") : `<div class="empty-state" style="padding:22px">${icon("heart")}<p>${isDemo() ? "没有本机历史申请记录。报名请使用社团公布的渠道。" : "还没有社团申请。"}</p><a class="text-button" href="#clubs">探索社团</a></div>`;
    const recentCheckins = checkins.filter(checkin => placeMap.has(checkin.placeId)).slice(0, 5);
    const checkinDate = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", dateStyle: "medium", timeStyle: "short" });
    const checkinList = recentCheckins.length ? recentCheckins.map(checkin => {
      const place = placeMap.get(checkin.placeId);
      const time = Number.isFinite(checkin.createdAt) ? checkinDate.format(checkin.createdAt)
        : checkin.time === "今天 · 刚刚" ? "历史点亮记录" : checkin.time;
      return `<a class="compact-list-item" href="#place/${place.id}">${icon(place.icon)}<div><strong>${escapeHTML(place.name)}</strong><small>${escapeHTML(time)} · +20 探索积分</small></div>${icon("circle-check")}</a>`;
    }).join("") : `<p class="muted">还没有足迹，从地图上的新地点开始吧。</p>`;

    return `<div class="view-enter">
      <section class="profile-hero card" aria-labelledby="profile-name">
        <div class="profile-user">
          <button type="button" class="profile-avatar-hit" data-action="edit-profile" aria-label="更换头像">
            ${avatarMarkup(user, "profile-avatar")}<span class="profile-avatar-edit">${icon("edit")}</span>
          </button>
          <div class="profile-identity">
            <span class="profile-kicker">校园探索档案</span>
            <h2 id="profile-name">${escapeHTML(user.name)}</h2>
            <p>${escapeHTML(user.grade)} · ${escapeHTML(user.major)}</p>
            <span class="tag">${isDemo() ? "本机体验档案" : user.verified ? "已认证" : "未认证"} · ${escapeHTML(user.title)}</span>
          </div>
        </div>
        <div class="profile-level">
          <div class="profile-level-heading">
            <span class="profile-level-title">${icon("compass")}探索等级</span>
            <strong>Lv. ${level}</strong>
          </div>
          <div class="progress-track" role="progressbar" aria-label="升级进度" aria-valuemin="0" aria-valuemax="${pointsPerLevel}" aria-valuenow="${levelPoints}">
            <span style="width:${levelPoints / pointsPerLevel * 100}%"></span>
          </div>
          <p>距离 Lv. ${level + 1} 还差 ${pointsPerLevel - levelPoints} 积分</p>
        </div>
        <dl class="profile-stats">${profileStats.map(stat => `<div class="profile-stat">
          <dt>${stat.label}</dt><dd>${icon(stat.icon)}<strong>${stat.value}</strong></dd>
        </div>`).join("")}</dl>
      </section>
      <div class="profile-grid"><div class="profile-main"><section class="profile-card card"><div class="card-heading"><h3>校园点亮进度</h3><span>${stats.lit} / ${places.length} · ${progress}%</span></div><div class="progress-track" style="margin-bottom:18px"><span style="width:${progress}%"></span></div><div class="explore-grid">${places.map(place => `<a class="explore-place ${Store.state.litPlaceIds.includes(place.id) ? "is-lit" : ""}" href="#place/${place.id}">${icon(place.icon)}<span>${escapeHTML(place.shortName || place.name)}</span></a>`).join("")}</div></section>
      <section class="profile-card card">
        <div class="card-heading"><h3>成就徽章</h3><span>已解锁 ${badges.filter(badge => badge.unlocked).length} / ${badges.length}</span></div>
        ${isDemo() ? '<p class="muted badge-note">按本机记录计算，初始档案含示例足迹。可点亮地点见「校园点亮进度」。</p>' : ""}
        <div class="badge-grid">${badges.map(badge => `<div class="badge-card ${badge.unlocked ? "" : "is-locked"}">
          <span class="badge-icon">${icon(badge.icon)}</span><strong>${escapeHTML(badge.name)}</strong>
          <small>${escapeHTML(badge.description)}</small><small class="badge-status">${badge.unlocked ? "已解锁" : `进度 ${badge.progress} / ${badge.target}`}</small>
        </div>`).join("")}</div>
      </section>
      <section class="profile-card card"><div class="card-heading"><h3>我的组局</h3><span>${myGroups.length} 场</span></div><div class="compact-list">${groupList}</div><div class="divider"></div><div class="card-heading"><h3>${isDemo() ? "历史申请示例" : "社团申请"}</h3><span>${applications.length} 份</span></div><div class="compact-list">${applicationList}</div></section></div>
      <aside class="profile-aside"><section class="profile-card card"><div class="card-heading"><h3>最近足迹</h3><span>CHECK-INS</span></div><div class="compact-list">${checkinList}</div></section><section class="profile-card card"><div class="card-heading"><h3>偏好与演示</h3><span>SETTINGS</span></div><div class="settings-list"><button class="setting-item" data-action="edit-profile">${icon("edit")}<span>编辑个人资料</span>${icon("chevron-right", "chevron")}</button><div class="setting-item">${icon("phone")}<span>手机号</span><small>${user.phone ? maskPhone(user.phone) : "未填写"}</small></div><button class="setting-item" data-action="toggle-theme">${icon("moon")}<span>深色主题</span><i class="switch ${Store.state.theme === "dark" ? "on" : ""}" data-theme-switch></i></button><div class="setting-item">${icon("shield-check")}<span>学生身份认证</span><small>${isDemo() ? "体验模式" : user.verified ? "已认证" : "未认证"}</small></div><button class="setting-item" data-action="reset-data">${icon("rotate-ccw")}<span>重置演示数据</span>${icon("chevron-right", "chevron")}</button></div></section></aside></div></div>`;
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
        <div><strong>${escapeHTML(profile.name)}，说点什么吧</strong><span>${isDemo() ? "论坛体验 · 帖子和评论仅保存在当前浏览器。" : "可选择匿名发布。"}</span></div>
        <span class="tag tag-secondary composer-badge">${icon("shield-check")}${isDemo() ? "本机体验" : "校园社区"}</span>
      </div>
      <input class="composer-title" id="forum-title" name="title" maxlength="40" placeholder="起个标题，让大家一眼看懂…" autocomplete="off" aria-label="话题标题">
      <p class="field-error" data-error-for="title"></p>
      <textarea class="composer-body" id="forum-body" name="body" maxlength="500" placeholder="写下想分享的校园见闻或想讨论的问题…" aria-label="话题正文"></textarea>
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
          <h2>课堂之外，也值得被听见。</h2>
          <p>${isDemo() ? "这里有示例话题。你发布的内容、点赞和回复只保存在当前浏览器。" : "吃瓜、吐槽、树洞、求助和闲置，都可以放在这里。"}开启匿名后，相关话题或回复只显示匿名昵称。</p>
        </div>
        <div class="forum-hero-stats">
          <div><strong>${allPosts.length}</strong><span>话题</span></div>
          <div><strong>${commentTotal}</strong><span>讨论</span></div>
          <div><strong>${anonTotal}</strong><span>匿名话题</span></div>
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
            <div class="card-heading"><h3>${icon("flame")}${isDemo() ? "话题推荐" : "正在热议"}</h3><span>TOP 3</span></div>
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
      showToast(isDemo() ? "话题示例已保存" : "话题已发布", isDemo() ? "这条话题仅在当前浏览器可见。" : "已添加到校园论坛。");
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
      showToast("评论已发表", isDemo() ? "这条评论仅在当前浏览器可见。" : anonymous ? "已使用匿名身份回复。" : "已使用校园身份回复。");
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
    openModal(`<div class="confirm-visual">${icon("rotate-ccw")}</div><h2>重置演示数据？</h2><p class="muted" style="margin-top:10px">将恢复初始足迹和探索积分，并清除本机的组局、论坛互动与历史申请。当前主题与个人资料会保留。</p><div class="form-actions"><button class="button button-ghost" data-action="close-modal">保留记录</button><button class="button" data-action="confirm-reset">确认重置</button></div>`, true);
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
    const mapResult = event.target.closest("a[data-map-point]");
    if (mapResult && mapResult.hash === location.hash) {
      event.preventDefault();
      focusMapPoint(encodeURIComponent(mapResult.dataset.mapPoint));
      return;
    }
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

    if (action === "copy-pilot-wechat") {
      copyPilotWechat();
    } else if (action === "open-student-activity") {
      openStudentActivity();
    } else if (action === "student-activity-action") {
      const { id, operation } = trigger.dataset;
      if (operation === "cancel") {
        openModal(`${modalHeader("CAMPUS EVENTS", "取消这场活动？", "取消后活动会从公开列表移除。已报名的同学仍可查看取消状态。")}
          <div class="form-actions"><button type="button" class="button button-ghost" data-action="close-modal">保留活动</button><button type="button" class="button" data-action="confirm-student-cancel" data-id="${id}">确认取消</button></div>`, true);
      } else {
        updateStudentSignup(id, operation, trigger);
      }
    } else if (action === "confirm-student-cancel") {
      updateStudentSignup(trigger.dataset.id, "cancel", trigger);
    } else if (action === "activity-scope") {
      if (trigger.getAttribute("aria-pressed") === "true") return;
      ui.activityMine = trigger.dataset.scope === "mine";
      resetActivityFilters();
      const feed = trigger.closest(".activity-feed");
      feed.innerHTML = renderActivityFeed();
      feed.querySelector('.activity-scope [aria-pressed="true"]').focus({ preventScroll: true });
    } else if (action === "clear-activity-filters") {
      resetActivityFilters();
      const filters = view.querySelectorAll("[data-activity-filter]");
      filters.forEach(filter => { filter.value = ""; });
      filters[0].focus({ preventScroll: true });
      refreshActivityResults();
    } else if (action === "toggle-poi") {
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
      selectBuilding(ui.activeBuilding === id ? null : id);
    } else if (action === "close-building") {
      if (!ui.activeBuilding) return;
      ui.activeBuilding = null;
      view.innerHTML = renderMap();
      requestAnimationFrame(applyMapFocus);
    } else if (action === "open-dormitory-model") {
      openDormitoryModel(trigger.dataset.id);
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
    } else if (action === "show-club-directory") {
      document.getElementById("club-search")?.focus();
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
    if (event.target.id === "student-activity-form") {
      event.preventDefault();
      submitStudentActivity(event.target);
    } else if (event.target.id === "group-form") {
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
    if (event.target.matches(".activity-filter-panel select[data-activity-filter]")) {
      ui[event.target.dataset.activityFilter] = event.target.value;
      refreshActivityResults();
    } else if (event.target.id === "residence-picker") {
      selectBuilding(event.target.value, true);
    } else if (event.target.id === "avatar-file") {
      handleAvatarFile(event.target);
    }
  });

  document.addEventListener("input", event => {
    if (event.target.id === "place-search") {
      ui.placeQuery = event.target.value;
      document.getElementById("place-search-results").innerHTML = renderPlaceResults();
    } else if (event.target.id === "club-search") {
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
