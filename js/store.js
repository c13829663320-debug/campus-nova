/* 轻量状态与本地持久化，种子数据和用户操作分离 */
(function () {
  const STORAGE_KEY = "campus-nova:v1";
  const anonymousAliases = ["夜航星", "纸飞机", "橘子汽水", "半糖去冰", "晚风信箱", "北门路灯", "云层观察员", "无名小熊"];

  function pickAlias() {
    return anonymousAliases[Math.floor(Math.random() * anonymousAliases.length)];
  }

  function relativeTime(timestamp) {
    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} 天前`;
    return `${Math.floor(days / 7)} 周前`;
  }

  const defaultState = () => ({
    version: 1,
    theme: "light",
    profile: {
      name: window.NovaDB ? window.NovaDB.user.name : "林小星",
      phone: "",
      avatarType: "initial",
      avatarValue: ""
    },
    litPlaceIds: ["library", "cafeteria"],
    points: 180,
    checkins: [
      { placeId: "cafeteria", time: "11月4日 12:10" },
      { placeId: "library", time: "11月3日 16:20" }
    ],
    joinedGroupIds: [],
    createdGroups: [],
    applications: [],
    forumPosts: [],
    forumLikes: [],
    forumComments: {}
  });

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || saved.version !== 1) return fallback;
      return {
        ...fallback,
        ...saved,
        profile: {
          ...fallback.profile,
          ...(saved.profile && typeof saved.profile === "object" ? saved.profile : {})
        },
        litPlaceIds: Array.isArray(saved.litPlaceIds) ? saved.litPlaceIds : fallback.litPlaceIds,
        checkins: Array.isArray(saved.checkins) ? saved.checkins : fallback.checkins,
        joinedGroupIds: Array.isArray(saved.joinedGroupIds) ? saved.joinedGroupIds : [],
        createdGroups: Array.isArray(saved.createdGroups) ? saved.createdGroups : [],
        applications: Array.isArray(saved.applications) ? saved.applications : [],
        forumPosts: Array.isArray(saved.forumPosts) ? saved.forumPosts : [],
        forumLikes: Array.isArray(saved.forumLikes) ? saved.forumLikes : [],
        forumComments: saved.forumComments && typeof saved.forumComments === "object" ? saved.forumComments : {}
      };
    } catch (error) {
      return fallback;
    }
  }

  window.NovaStore = {
    state: loadState(),

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (error) {
        /* 隐私模式下仍保留当前会话状态 */
      }
    },

    setTheme(theme) {
      this.state.theme = theme === "dark" ? "dark" : "light";
      this.save();
    },

    getProfile() {
      const seed = window.NovaDB.user;
      const profile = this.state.profile || {};
      const name = profile.name || seed.name;
      const uploaded = profile.avatarType === "upload" && profile.avatarValue;
      return {
        ...seed,
        name,
        phone: profile.phone || "",
        initial: Array.from(name)[0] || seed.initial,
        avatarType: uploaded ? "upload" : "initial",
        avatarValue: uploaded ? profile.avatarValue : ""
      };
    },

    updateProfile(payload = {}) {
      if (!this.state.profile) this.state.profile = { ...defaultState().profile };
      const profile = this.state.profile;
      if (typeof payload.name === "string") profile.name = payload.name.trim().slice(0, 12);
      if (typeof payload.phone === "string") profile.phone = payload.phone.trim();
      if (payload.avatarType) {
        profile.avatarType = payload.avatarType;
        profile.avatarValue = payload.avatarType === "initial" ? "" : String(payload.avatarValue || "");
      }
      this.save();
      return this.getProfile();
    },

    getPlace(placeId) {
      return window.NovaDB.places.find(place => place.id === placeId) || null;
    },

    getGroup(groupId) {
      const group = [...this.state.createdGroups, ...window.NovaDB.groups].find(item => item.id === groupId);
      if (!group) return null;
      const joinedByUser = this.state.joinedGroupIds.includes(groupId);
      const isOwner = Boolean(group.createdByUser);
      return {
        ...group,
        joined: isOwner ? group.joined : group.joined + (joinedByUser ? 1 : 0),
        isJoined: isOwner || joinedByUser,
        isOwner
      };
    },

    getGroups(placeId) {
      const ids = [...this.state.createdGroups, ...window.NovaDB.groups].map(group => group.id);
      return ids.map(id => this.getGroup(id)).filter(group => !placeId || group.placeId === placeId);
    },

    joinGroup(groupId) {
      const group = this.getGroup(groupId);
      if (!group) throw new Error("这场组局不存在");
      if (group.isJoined) return group;
      if (group.joined >= group.total) throw new Error("这场组局已经满员，看看其他活动吧");
      this.state.joinedGroupIds.push(groupId);
      this.state.points += 10;
      this.save();
      return this.getGroup(groupId);
    },

    leaveGroup(groupId) {
      const group = this.getGroup(groupId);
      if (!group) throw new Error("这场组局不存在");
      if (group.isOwner) throw new Error("你发起的组局会保留在我的组局中");
      this.state.joinedGroupIds = this.state.joinedGroupIds.filter(id => id !== groupId);
      this.save();
      return this.getGroup(groupId);
    },

    createGroup(payload) {
      const user = this.getProfile();
      const group = {
        id: `g-user-${Date.now()}`,
        placeId: payload.placeId,
        title: payload.title,
        category: payload.category,
        hostId: user.id,
        host: user.name,
        hostMajor: `${user.major} · 大一`,
        hostInitial: user.initial,
        time: payload.timeLabel,
        day: payload.day,
        month: payload.month,
        joined: 1,
        total: Number(payload.total),
        description: payload.description,
        duration: payload.duration || "约 1 小时",
        createdByUser: true
      };
      this.state.createdGroups.unshift(group);
      this.state.points += 15;
      this.save();
      return this.getGroup(group.id);
    },

    checkIn(placeId) {
      const isNew = !this.state.litPlaceIds.includes(placeId);
      if (isNew) {
        this.state.litPlaceIds.push(placeId);
        this.state.points += 20;
        this.state.checkins.unshift({ placeId, time: "今天 · 刚刚" });
        this.save();
      }
      return { isNew, points: this.state.points, litCount: this.state.litPlaceIds.length };
    },

    applyClub(payload) {
      if (this.state.applications.some(item => item.clubId === payload.clubId)) {
        throw new Error("你已经向这个社团提交过申请");
      }
      const application = {
        id: `apply-${Date.now()}`,
        clubId: payload.clubId,
        name: payload.name,
        major: payload.major,
        contact: payload.contact,
        note: payload.note || "",
        status: "待社团联系",
        time: "今天 · 刚刚"
      };
      this.state.applications.unshift(application);
      this.state.points += 15;
      this.save();
      return application;
    },

    hydrateForumPost(post) {
      const createdAt = post.createdAt || Date.now() - (post.minutesAgo || 0) * 60000;
      const profile = this.getProfile();
      const withProfileName = item => (!item.anonymous && item.authorId === profile.id ? { ...item, author: profile.name, authorInitial: profile.initial } : item);
      const seedComments = (post.comments || []).map(comment => ({
        ...withProfileName(comment),
        createdAt: comment.createdAt || Date.now() - (comment.minutesAgo || 0) * 60000,
        time: relativeTime(comment.createdAt || Date.now() - (comment.minutesAgo || 0) * 60000)
      }));
      const userComments = (this.state.forumComments[post.id] || []).map(comment => ({
        ...withProfileName(comment),
        time: relativeTime(comment.createdAt)
      }));
      const liked = this.state.forumLikes.includes(post.id);
      const isOwn = !post.anonymous && post.authorId === profile.id;
      return {
        ...post,
        author: isOwn ? profile.name : post.author,
        authorInitial: isOwn ? profile.initial : post.authorInitial,
        createdAt,
        time: relativeTime(createdAt),
        comments: [...seedComments, ...userComments],
        commentCount: seedComments.length + userComments.length,
        liked,
        likes: (post.likes || 0) + (liked ? 1 : 0),
        mine: Boolean(post.mine)
      };
    },

    getForumPosts() {
      const seedPosts = (window.NovaDB.forumPosts || []).map(post => this.hydrateForumPost(post));
      const userPosts = this.state.forumPosts.map(post => this.hydrateForumPost(post));
      return [...userPosts, ...seedPosts].sort((a, b) => b.createdAt - a.createdAt);
    },

    getForumPost(postId) {
      return this.getForumPosts().find(post => post.id === postId) || null;
    },

    createForumPost(payload) {
      const anonymous = Boolean(payload.anonymous);
      const user = this.getProfile();
      const post = {
        id: `post-user-${Date.now()}`,
        category: payload.category || "吐槽",
        title: payload.title,
        body: payload.body,
        anonymous,
        authorId: user.id,
        author: anonymous ? `匿名 · ${pickAlias()}` : user.name,
        authorInitial: anonymous ? "匿" : user.initial,
        createdAt: Date.now(),
        likes: 0,
        comments: [],
        mine: true
      };
      this.state.forumPosts.unshift(post);
      this.save();
      return this.hydrateForumPost(post);
    },

    toggleForumLike(postId) {
      if (!this.getForumPost(postId)) throw new Error("这个话题不存在或已被删除");
      const liked = this.state.forumLikes.includes(postId);
      this.state.forumLikes = liked
        ? this.state.forumLikes.filter(id => id !== postId)
        : [...this.state.forumLikes, postId];
      this.save();
      const post = this.getForumPost(postId);
      return { liked: post.liked, likes: post.likes };
    },

    addForumComment(postId, payload) {
      if (!this.getForumPost(postId)) throw new Error("这个话题不存在或已被删除");
      const anonymous = Boolean(payload.anonymous);
      const user = this.getProfile();
      const comment = {
        id: `comment-${Date.now()}`,
        authorId: user.id,
        author: anonymous ? `匿名 · ${pickAlias()}` : user.name,
        authorInitial: anonymous ? "匿" : user.initial,
        anonymous,
        body: payload.body,
        createdAt: Date.now()
      };
      this.state.forumComments = {
        ...this.state.forumComments,
        [postId]: [...(this.state.forumComments[postId] || []), comment]
      };
      this.save();
      return this.getForumPost(postId);
    },

    deleteForumPost(postId) {
      if (!this.state.forumPosts.some(post => post.id === postId)) {
        throw new Error("只能删除自己发布的话题");
      }
      this.state.forumPosts = this.state.forumPosts.filter(post => post.id !== postId);
      delete this.state.forumComments[postId];
      this.state.forumLikes = this.state.forumLikes.filter(id => id !== postId);
      this.save();
    },

    getStats() {
      return {
        lit: this.state.litPlaceIds.length,
        points: this.state.points,
        groups: this.state.joinedGroupIds.length + this.state.createdGroups.length,
        clubs: this.state.applications.length
      };
    },

    getBadgeCount(type) {
      const stats = this.getStats();
      if (type === "lit") return stats.lit;
      if (type === "groups") return stats.groups;
      if (type === "clubs") return stats.clubs;
      return 0;
    },

    reset() {
      const currentTheme = this.state.theme;
      const currentProfile = { ...this.state.profile };
      const fresh = { ...defaultState(), theme: currentTheme, profile: currentProfile };
      Object.keys(this.state).forEach(key => delete this.state[key]);
      Object.assign(this.state, fresh);
      this.save();
    }
  };
})();
