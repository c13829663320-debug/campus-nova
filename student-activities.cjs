const path = require("node:path");
const { mkdir, readFile, rename, unlink, writeFile } = require("node:fs/promises");
const { createHash } = require("node:crypto");
const { types, categories, durations, coverMaxBytes, coverMaxSide } = require("./js/activity-tags.js");
const { places } = require("./js/mock.js");

const directory = process.env.NOVA_STATE_DIR || process.env.STATE_DIRECTORY || path.join(__dirname, ".nova-state");
const file = path.join(directory, "student-activities.json");
const placeIds = new Set(places.map(place => place.id));
const maxCoverEncoded = Math.ceil(coverMaxBytes / 3) * 4;
const DAY = 86_400_000;
const campusOffset = 8 * 60 * 60_000;
let pending = Promise.resolve();

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

async function load() {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function save(records) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temp = `${file}.${process.pid}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(records), { mode: 0o600 });
    await rename(temp, file);
  } finally {
    await unlink(temp).catch(() => {});
  }
}

function toPublic(record, identity) {
  const { owner, participants, ...activity } = record;
  return { ...activity, hasCover: Boolean(record.hasCover && !record.cancelled),
    isOwner: identity === owner, joined: participants.includes(identity), count: participants.length + 1 };
}

async function readPayload(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] || "")) fail(415, "请提交 JSON 数据。");
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 4096 + maxCoverEncoded) fail(413, "活动内容或封面图片太大。");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    fail(400, "无法读取活动信息。");
  }
}

function field(value, label, min, max) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < min || text.length > max) fail(400, `${label}请填写 ${min} 至 ${max} 个字符。`);
  return text;
}

function coverPath(id) {
  return path.join(directory, `${id}.jpg`);
}

function validCoverDimensions(image) {
  // 浏览器重新编码的 JPEG 在扫描数据前提供帧尺寸。
  let offset = 2;
  while (offset + 4 <= image.length && image[offset] === 0xff) {
    const marker = image[offset + 1];
    const length = image.readUInt16BE(offset + 2);
    if (marker === 0xda || length < 2 || offset + 2 + length > image.length) return false;
    if (marker === 0xc0 || marker === 0xc2) {
      if (length < 8) return false;
      const height = image.readUInt16BE(offset + 5);
      const width = image.readUInt16BE(offset + 7);
      return width > 0 && width <= coverMaxSide && height > 0 && height <= coverMaxSide;
    }
    offset += 2 + length;
  }
  return false;
}

function decodeCover(value) {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.length > maxCoverEncoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    fail(400, "封面图片格式无效或太大。");
  }
  const image = Buffer.from(value, "base64");
  if (image.length < 4 || image.length > coverMaxBytes || image.toString("base64") !== value ||
      image.readUInt16BE(0) !== 0xffd8 || image.readUInt16BE(image.length - 2) !== 0xffd9 || !validCoverDimensions(image)) {
    fail(400, "请提交有效的 JPEG 封面图片。");
  }
  return image;
}

async function publish(records, body, identity, now) {
  const { id, type, category, start, capacity, placeId = "", duration = "" } = body || {};
  if (typeof id !== "string" || !/^student-[a-f0-9]{32}$/.test(id)) fail(400, "活动编号无效。");
  const existing = records.find(record => record.id === id);
  if (existing) {
    if (existing.owner !== identity) fail(409, "活动编号已被使用。");
    return existing;
  }
  if (!types.includes(type) || !Object.hasOwn(categories, category)) fail(400, "请选择有效的活动类型和活动主题。");
  if (placeId !== "" && !placeIds.has(placeId)) fail(400, "发起地点无效，请重新打开活动表单。");
  if (duration !== "" && !durations.includes(duration)) fail(400, "请选择有效的预计时长。");
  const startAt = typeof start === "string" ? Date.parse(`${start}:00+08:00`) : NaN;
  if (!Number.isFinite(startAt) || new Date(startAt + campusOffset).toISOString().slice(0, 16) !== start ||
      startAt <= now || startAt > now + 90 * DAY) fail(400, "请选择未来 90 天内的活动时间（北京时间）。");
  if (!Number.isInteger(capacity) || capacity < 2 || capacity > 50) fail(400, "总人数（含发起人）应为 2 至 50 人。");
  const title = field(body.title, "活动标题", 2, 50);
  const venue = field(body.venue, "集合地点", 2, 60);
  const summary = field(body.summary, "活动说明", 5, 400);
  const host = field(body.host, "发起人昵称", 1, 16);
  if (records.filter(record => record.owner === identity && record.createdAt > now - DAY).length >= 8 ||
      records.filter(record => record.createdAt > now - 60 * 60_000).length >= 80) {
    fail(429, "活动发布较多，请稍后再试。");
  }

  const cover = decodeCover(body.cover);
  const record = { id, type, category, title, venue, summary, host, start, startAt, capacity, placeId, duration, hasCover: Boolean(cover), createdAt: now,
    owner: identity, participants: [], cancelled: false };
  records.push(record);
  try {
    if (cover) {
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(coverPath(id), cover, { mode: 0o600 });
    }
    await save(records);
  } catch (error) {
    if (cover) await unlink(coverPath(id)).catch(() => {});
    throw error;
  }
  return record;
}

function update(record, action, identity, now) {
  if (!record) fail(404, "没有找到这场活动。");
  if (action === "cancel") {
    if (record.owner !== identity) fail(403, "只有发起人可以取消活动。");
    if (record.cancelled) return;
  } else if (record.owner === identity) {
    fail(400, "发起人已占用一个名额。");
  }
  if (record.cancelled || record.startAt <= now) fail(409, "活动已开始或已取消，报名已关闭。");

  if (action === "cancel") {
    record.cancelled = true;
  } else if (action === "leave") {
    record.participants = record.participants.filter(participant => participant !== identity);
  } else if (!record.participants.includes(identity)) {
    if (record.participants.length + 1 >= record.capacity) fail(409, "这场活动已经满员。");
    record.participants.push(identity);
  }
}

async function handleStudentActivities(req, res, json, id, action, placeId) {
  try {
    const token = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || "")?.[1];
    const identity = token && createHash("sha256").update(token).digest("hex");
    if (action === "cover") {
      if (req.method !== "GET" && req.method !== "HEAD") fail(405, "请求方法不受支持。");
      const records = await load();
      if (!records.some(record => record.id === id && record.hasCover && !record.cancelled)) fail(404, "没有找到活动封面。");
      const cover = await readFile(coverPath(id));
      res.writeHead(200, { "Content-Type": "image/jpeg", "Content-Length": cover.length, "Cache-Control": "no-store" });
      return res.end(req.method === "HEAD" ? undefined : cover);
    }
    if (req.method === "GET" && !action) {
      const records = await load();
      if (id) {
        const record = records.find(item => item.id === id);
        return record ? json(res, 200, toPublic(record, identity)) : json(res, 404, { message: "没有找到这场活动。" });
      }
      const visible = records.filter(record => !placeId || record.placeId === placeId).map(record => toPublic(record, identity))
        .filter(record => !record.cancelled || record.isOwner || record.joined);
      return json(res, 200, visible);
    }
    if (req.method !== "POST" || Boolean(id) !== Boolean(action)) fail(405, "请求方法不受支持。");
    if (req.headers["sec-fetch-site"] === "cross-site" || !identity) fail(403, "请在星图校园页面操作。");
    const body = id ? null : await readPayload(req);

    // 单进程内串行更新，避免同时报名时超出名额，也避免覆盖其他请求的修改。
    const operation = pending.then(async () => {
      const records = await load();
      const now = Date.now();
      if (!id) return toPublic(await publish(records, body, identity, now), identity);
      const record = records.find(item => item.id === id);
      update(record, action, identity, now);
      await save(records);
      return toPublic(record, identity);
    });
    pending = operation.catch(() => {});
    return json(res, id ? 200 : 201, await operation);
  } catch (error) {
    if (error.status === 413) res.setHeader("Connection", "close");
    if (!error.status) console.error("学生活动存储错误", error.code || error.name);
    return json(res, error.status || 500, { message: error.status ? error.message : "学生活动服务暂时不可用，请稍后重试。" });
  }
}

module.exports = { handleStudentActivities };
