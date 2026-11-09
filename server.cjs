const http = require("node:http");
const path = require("node:path");
const { readFile } = require("node:fs/promises");
const { aiEnabled, handleCampusAgent } = require("./campus-agent.cjs");
const { handleStudentActivities } = require("./student-activities.cjs");

const feedbackSetting = process.env.FEISHU_FEEDBACK_URL?.trim();
const feedback = URL.canParse(feedbackSetting ?? "") ? new URL(feedbackSetting) : null;
const feedbackUrl = feedback?.protocol === "https:" && !feedback.username && !feedback.password
  && /(^|\.)(feishu\.cn|larksuite\.com)$/.test(feedback.hostname) ? feedback.href : "";
if (feedbackSetting && !feedbackUrl) console.warn("FEISHU_FEEDBACK_URL 需要使用飞书或 Lark 的 HTTPS 填写链接。");

const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".glb": "model/gltf-binary", ".mjs": "text/javascript; charset=utf-8",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon"
};
const pages = new Set(["/index.html", "/campus-map.html", "/logo-preview.html", "/map3d.html", "/panorama.html", "/styles.css"]);

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": mime[".json"], "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  let pathname, searchParams;
  try {
    const url = new URL(req.url, "http://localhost");
    pathname = decodeURIComponent(url.pathname);
    searchParams = url.searchParams;
  } catch {
    return json(res, 400, { error: "无效的请求路径。" });
  }
  if (pathname === "/api/campus-ai") return handleCampusAgent(req, res, json);
  const activityRoute = /^\/api\/student-activities(?:\/(student-[a-f0-9]{32})(?:\/(join|leave|cancel|cover))?)?$/.exec(pathname);
  if (activityRoute) return handleStudentActivities(req, res, json, activityRoute[1], activityRoute[2], searchParams.get("placeId"));
  if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "请求方法不受支持。" });
  if (pathname === "/api/features") return json(res, 200, { aiEnabled, feedbackUrl });

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
