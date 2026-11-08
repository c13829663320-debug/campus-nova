const http = require("node:http");
const path = require("node:path");
const { readFile } = require("node:fs/promises");
const { places, clubs, campusPois } = require("./js/mock.js");

const key = process.env.OPENROUTER_API_KEY?.trim();
const model = process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";
const feedbackSetting = process.env.FEISHU_FEEDBACK_URL?.trim();
const feedback = URL.canParse(feedbackSetting ?? "") ? new URL(feedbackSetting) : null;
const feedbackUrl = feedback?.protocol === "https:" && !feedback.username && !feedback.password
  && /(^|\.)(feishu\.cn|larksuite\.com)$/.test(feedback.hostname) ? feedback.href : "";
if (feedbackSetting && !feedbackUrl) console.warn("FEISHU_FEEDBACK_URL 需要使用飞书或 Lark 的 HTTPS 填写链接。");

const campusData = JSON.stringify({
  地点: places.map(({ name, hours, description }) => ({ name, hours, description })),
  地图地标: campusPois.map(({ name, zone }) => [name, zone]),
  社团: clubs.map(({ name, category, unit, status }) => [name, category, unit, status])
});
const instructions = [
  "你是星图校园的中文助手，服务东莞职业技术学院的校园探索。",
  "根据下列项目资料回答地点和社团问题，优先给出站内能搜索到的确切名称和下一步建议。用简洁纯文本，不使用 Markdown。",
  "地点时间和社团状态来自项目演示资料，提及时请注明以学校公告为准。资料不全时说明缺什么，不推测实时开放、招新时间、行走路线或联系方式。",
  "站内可用功能有地点搜索、地图位置、地点点亮、社团图鉴。站内没有从当前位置出发的步行路线、实时定位、实时开放查询或通用在线报名。组局和论坛是本机体验。只建议实际支持的操作。超出校园探索和站内功能的问题请引导回校园主题。",
  campusData
].join("\n");

const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon"
};
const pages = new Set(["/index.html", "/campus-map.html", "/logo-preview.html", "/map3d.html", "/panorama.html", "/styles.css"]);
let requests = [];
let inFlight = 0;

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": mime[".json"], "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function textWithin(value, limit) {
  return typeof value === "string" && value.length <= limit && value.trim().length > 0;
}

async function chat(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "请使用 POST 请求。" });
  if (req.headers["sec-fetch-site"] === "cross-site") return json(res, 403, { error: "请从星图校园访问。" });
  if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] ?? "")) {
    return json(res, 415, { error: "请提交 JSON 数据。" });
  }
  if (!key) return json(res, 503, { error: "AI 服务暂未配置 OpenRouter 密钥。" });

  let body;
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
      size += chunk.length;
      if (size > 48 * 1024) {
        res.setHeader("Connection", "close");
        return json(res, 413, { error: "问题和上下文太长。" });
      }
      chunks.push(chunk);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return json(res, 400, { error: "无法读取请求。" });
  }

  const { question, history = [] } = body ?? {};
  if (!textWithin(question, 500) || !Array.isArray(history) || history.length > 4 ||
      !history.every(turn => textWithin(turn?.question, 500) && textWithin(turn?.answer, 2500))) {
    return json(res, 400, { error: "请输入 1 至 500 字的问题。" });
  }

  const now = Date.now();
  requests = requests.filter(timestamp => now - timestamp < 60_000);
  if (requests.length >= 15 || inFlight >= 3) {
    return json(res, 429, { error: "校园助手请求较多，请稍后再试。" });
  }
  requests.push(now);
  inFlight++;
  try {
    const messages = [
      { role: "system", content: instructions },
      ...history.flatMap(turn => [
        { role: "user", content: turn.question },
        { role: "assistant", content: turn.answer }
      ]),
      { role: "user", content: question.trim() }
    ];
    const signal = AbortSignal.timeout(24_000);
    const maxAttempts = model === "openrouter/free" ? 2 : 1;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: 1600, messages }),
        signal
      });
      if (!upstream.ok) {
        await upstream.body?.cancel();
        if (upstream.status === 429) return json(res, 429, { error: "OpenRouter 请求已达限制，请稍后再试。" });
        console.warn(`OpenRouter HTTP ${upstream.status}`);
        const error = upstream.status === 401 || upstream.status === 403
          ? "OpenRouter 未接受当前密钥，请联系项目维护者检查配置。"
          : "OpenRouter 暂时无法提供回答，请稍后再试。";
        return json(res, 502, { error });
      }
      const result = await upstream.json();
      const answer = result.choices?.[0]?.message?.content;
      if (typeof answer === "string" && answer.trim()) {
        return json(res, 200, { answer: answer.trim().slice(0, 2500) });
      }
    }
    return json(res, 502, { error: "校园助手没有返回回答，请重试。" });
  } catch (error) {
    console.warn(`OpenRouter 请求失败 (${error.name})`);
    return json(res, 502, { error: "连接 OpenRouter 失败，请稍后重试。" });
  } finally {
    inFlight--;
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return json(res, 400, { error: "无效的请求路径。" });
  }
  if (pathname === "/api/campus-ai") return chat(req, res);
  if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "请求方法不受支持。" });
  if (pathname === "/api/features") return json(res, 200, { aiEnabled: Boolean(key), feedbackUrl });

  if (pathname === "/") pathname = "/index.html";
  const segments = pathname.slice(1).split("/");
  const staticFile = /^(assets|css|data|js|vendor)$/.test(segments[0])
    && segments.length > 1 && segments.every(segment => segment && !segment.startsWith(".") && !/[\\:\u0000]/.test(segment));
  const type = mime[path.extname(pathname).toLowerCase()];
  if (!type || !(pages.has(pathname) || staticFile)) return json(res, 404, { error: "页面不存在。" });
  try {
    const data = await readFile(path.join(__dirname, pathname.slice(1)));
    res.writeHead(200, { "Content-Type": type, "Content-Length": data.length });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    json(res, 404, { error: "页面不存在。" });
  }
});

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8080);
server.listen(port, host, () => console.log(`星图校园 http://${host}:${server.address().port}/`));
