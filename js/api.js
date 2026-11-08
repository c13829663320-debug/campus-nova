/* 数据接口层：配置 baseUrl 后走真实 HTTP，未配置时回退本地演示数据 */
(function () {
  const config = {
    baseUrl: String(window.NOVA_API_BASE || "").replace(/\/+$/, ""),
    timeout: 9000
  };
  const delay = (ms = 320) => new Promise(resolve => setTimeout(resolve, ms));

  async function respond(callback, ms) {
    await delay(ms);
    return callback();
  }

  function isRemote() {
    return Boolean(config.baseUrl);
  }

  function buildUrl(path, query) {
    const url = `${config.baseUrl}${path}`;
    if (!query) return url;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") return;
      params.set(key, value);
    });
    const search = params.toString();
    return search ? `${url}?${search}` : url;
  }

  async function request(path, { method = "GET", body, query } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeout);
    try {
      const response = await fetch(buildUrl(path, query), {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      if (!response.ok) {
        let message = `接口请求失败（${response.status}）`;
        try {
          const payload = await response.json();
          if (payload && payload.message) message = payload.message;
        } catch (error) {
          /* 非 JSON 错误体沿用状态码提示 */
        }
        throw new Error(message);
      }
      if (response.status === 204) return null;
      const payload = await response.json();
      return payload && Object.prototype.hasOwnProperty.call(payload, "data") ? payload.data : payload;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("接口请求超时，请稍后重试");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /* 远程模式请求接口，演示模式执行本地数据回调 */
  async function resolve(demoFactory, path, options = {}, ms) {
    if (!isRemote()) return respond(demoFactory, ms);
    return request(path, options);
  }

  window.NovaAPI = {
    configure({ baseUrl = "" } = {}) {
      config.baseUrl = String(baseUrl).replace(/\/+$/, "");
      return config.baseUrl;
    },

    get mode() {
      return isRemote() ? "remote" : "demo";
    },

    // GET /api/v1/map → { places, groups, zones, categories }
    fetchMap() {
      return resolve(() => ({
        places: window.NovaDB.places,
        groups: window.NovaStore.getGroups(),
        zones: window.NovaDB.zones,
        categories: window.NovaDB.categories,
        buildings: window.NovaDB.buildings || [],
        pois: window.NovaDB.campusPois || []
      }), "/map");
    },

    // GET /api/v1/places → { places }
    fetchPlaces() {
      return resolve(() => window.NovaDB.places, "/places");
    },

    // GET /api/v1/places/:placeId → { place }
    fetchPlace(placeId) {
      return resolve(() => {
        const place = window.NovaStore.getPlace(placeId);
        if (!place) throw new Error("没有找到这个校园地点");
        return place;
      }, `/places/${placeId}`);
    },

    // GET /api/v1/groups?placeId= → { groups }
    fetchGroups(placeId) {
      return resolve(() => window.NovaStore.getGroups(placeId), "/groups", { query: { placeId } });
    },

    // POST /api/v1/groups/:groupId/join → { group }
    joinGroup(groupId) {
      return resolve(() => window.NovaStore.joinGroup(groupId), `/groups/${groupId}/join`, { method: "POST" }, 420);
    },

    // DELETE /api/v1/groups/:groupId/join → { group }
    leaveGroup(groupId) {
      return resolve(() => window.NovaStore.leaveGroup(groupId), `/groups/${groupId}/join`, { method: "DELETE" }, 360);
    },

    // POST /api/v1/groups → { group }
    createGroup(payload) {
      return resolve(() => window.NovaStore.createGroup(payload), "/groups", { method: "POST", body: payload }, 520);
    },

    // POST /api/v1/places/:placeId/checkins → { result }
    checkIn(placeId) {
      return resolve(() => {
        if (!window.NovaStore.getPlace(placeId)) throw new Error("打卡地点不存在");
        return window.NovaStore.checkIn(placeId);
      }, `/places/${placeId}/checkins`, { method: "POST" }, 480);
    },

    // PATCH /api/v1/me → { user }
    updateProfile(payload) {
      return resolve(() => window.NovaStore.updateProfile(payload), "/me", { method: "PATCH", body: payload }, 420);
    },

    // GET /api/v1/club-catalog → { clubs, categories, events }
    fetchClubCatalog() {
      return resolve(() => ({
        clubs: window.NovaDB.clubs,
        categories: [...new Set(window.NovaDB.clubs.map(club => club.category))],
        events: window.NovaDB.clubEvents || []
      }), "/club-catalog");
    },

    // GET /api/v1/clubs?query=&category= → { clubs }
    fetchClubs({ query = "", category = "all" } = {}) {
      return resolve(() => {
        const keyword = query.trim().toLowerCase();
        return window.NovaDB.clubs.filter(club => {
          const categoryMatch = category === "all" || club.category === category;
          const text = `${club.name}${club.slogan}${club.description}${club.category}`.toLowerCase();
          return categoryMatch && (!keyword || text.includes(keyword));
        });
      }, "/clubs", { query: { query, category } });
    },

    // GET /api/v1/clubs/:clubId → { club }
    fetchClub(clubId) {
      return resolve(() => {
        const club = window.NovaDB.clubs.find(item => item.id === clubId);
        if (!club) throw new Error("没有找到这个社团");
        return club;
      }, `/clubs/${clubId}`);
    },

    // POST /api/v1/clubs/:clubId/applications → { application }
    applyClub(payload) {
      return resolve(() => window.NovaStore.applyClub(payload), `/clubs/${payload.clubId}/applications`, { method: "POST", body: payload }, 520);
    },

    // GET /api/v1/forum/categories → { categories }
    fetchForumCategories() {
      return resolve(() => window.NovaDB.forumCategories || ["吃瓜", "吐槽", "树洞", "求助", "闲置"], "/forum/categories");
    },

    // GET /api/v1/forum/posts?category=&query=&sort= → { posts }
    fetchForumPosts({ category = "all", query = "", sort = "latest" } = {}) {
      return resolve(() => {
        const keyword = query.trim().toLowerCase();
        const posts = window.NovaStore.getForumPosts().filter(post => {
          const categoryMatch = category === "all" || post.category === category;
          const text = `${post.title}${post.body}${post.author}`.toLowerCase();
          return categoryMatch && (!keyword || text.includes(keyword));
        });
        if (sort === "hot") {
          posts.sort((a, b) => (b.likes * 2 + b.commentCount * 3) - (a.likes * 2 + a.commentCount * 3));
        }
        return posts;
      }, "/forum/posts", { query: { category, query, sort } });
    },

    // GET /api/v1/forum/posts/:postId → { post }
    fetchForumPost(postId) {
      return resolve(() => {
        const post = window.NovaStore.getForumPost(postId);
        if (!post) throw new Error("这个话题不存在或已被删除");
        return post;
      }, `/forum/posts/${postId}`);
    },

    // POST /api/v1/forum/posts → { post }
    createForumPost(payload) {
      return resolve(() => window.NovaStore.createForumPost(payload), "/forum/posts", { method: "POST", body: payload }, 420);
    },

    // POST /api/v1/forum/posts/:postId/like → { liked, likes }
    toggleForumLike(postId) {
      return resolve(() => window.NovaStore.toggleForumLike(postId), `/forum/posts/${postId}/like`, { method: "POST" }, 220);
    },

    // POST /api/v1/forum/posts/:postId/comments → { post }
    addForumComment(postId, payload) {
      return resolve(() => window.NovaStore.addForumComment(postId, payload), `/forum/posts/${postId}/comments`, { method: "POST", body: payload }, 360);
    },

    // DELETE /api/v1/forum/posts/:postId
    deleteForumPost(postId) {
      return resolve(() => window.NovaStore.deleteForumPost(postId), `/forum/posts/${postId}`, { method: "DELETE" }, 300);
    },

    // GET /api/v1/me → { user, stats, places, badges, checkins, applications }
    fetchProfile() {
      return resolve(() => {
        const DB = window.NovaDB;
        const Store = window.NovaStore;
        return {
          user: Store.getProfile(),
          stats: Store.getStats(),
          places: DB.places,
          checkins: Store.state.checkins,
          applications: Store.state.applications.map(application => ({
            ...application,
            clubName: (DB.clubs.find(club => club.id === application.clubId) || {}).name || "社团"
          })),
          badges: DB.badges.map(badge => ({
            ...badge,
            progress: Math.min(Store.getBadgeCount(badge.type), badge.target),
            unlocked: Store.getBadgeCount(badge.type) >= badge.target
          }))
        };
      }, "/me");
    }
  };
})();
