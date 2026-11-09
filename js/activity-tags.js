/* 学生活动的发布表单、筛选和服务端校验共用这些标签。 */
(() => {
  const types = ["找搭子", "组局", "其他活动"];
  const durations = ["约 1 小时", "约 1.5 小时", "约 2 小时", "约 3 小时"];
  const coverMaxBytes = 160 * 1024;
  const coverMaxSide = 960;
  const categories = {
    "学习自习": "book-open",
    "运动健身": "trophy",
    "美食聚餐": "utensils",
    "文艺娱乐": "ticket",
    "技能实战": "lightbulb",
    "就业创业": "compass",
    "志愿公益": "heart",
    "其他": "calendar"
  };
  const tags = { types, categories, durations, coverMaxBytes, coverMaxSide };
  if (typeof module !== "undefined" && module.exports) module.exports = tags;
  else window.NovaActivityTags = tags;
})();
