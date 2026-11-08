(() => {
  const ai = document.getElementById("campus-ai");
  const feedbackLink = document.getElementById("feedback-link");
  const form = document.getElementById("campus-chat-form");
  const input = document.getElementById("campus-question");
  const send = form.querySelector("button[type=submit]");
  const status = document.getElementById("campus-chat-status");
  const chat = document.getElementById("campus-chat");
  const served = location.protocol === "http:" || location.protocol === "https:";
  const history = [];

  async function readFeatures() {
    if (!served) return null;
    try {
      const response = await fetch("/api/features", { signal: AbortSignal.timeout(5000) });
      if (response.ok) return await response.json();
    } catch {}
    return null;
  }

  document.getElementById("open-campus-ai").addEventListener("click", () => ai.showModal());
  send.disabled = true;
  readFeatures().then(config => {
    if (config?.feedbackUrl) feedbackLink.href = config.feedbackUrl;
    if (config?.aiEnabled) {
      send.disabled = false;
      return;
    }
    status.textContent = config
      ? "AI 服务暂未配置 OpenRouter 密钥。"
      : "请通过项目的 Node 服务启动网页，即可连接校园助手。";
  });
  ai.querySelectorAll(".campus-prompts button").forEach(button => {
    button.addEventListener("click", () => {
      if (input.readOnly) return;
      input.value = button.textContent.trim();
      input.focus();
    });
  });

  function addMessage(speaker, message) {
    const item = document.createElement("article");
    const label = document.createElement("strong");
    const body = document.createElement("p");
    item.className = "campus-message";
    item.dataset.speaker = speaker;
    label.textContent = speaker === "user" ? "你" : "校园助手";
    body.textContent = message;
    item.append(label, body);
    chat.append(item);
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || send.disabled) return;
    send.disabled = input.readOnly = true;
    status.textContent = "正在查询校园资料…";
    try {
      const response = await fetch("/api/campus-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history: history.slice(-4) }),
        signal: AbortSignal.timeout(28000)
      });
      const result = await response.json();
      if (!response.ok || typeof result.answer !== "string") {
        status.textContent = result.error || "校园助手暂时无法回答，请稍后再试。";
        return;
      }
      addMessage("user", question);
      addMessage("assistant", result.answer);
      history.push({ question, answer: result.answer });
      if (history.length > 4) history.shift();
      chat.scrollTop = chat.scrollHeight;
      input.value = "";
      status.textContent = "";
    } catch {
      status.textContent = "连接校园助手失败，请稍后重试。";
    } finally {
      send.disabled = input.readOnly = false;
      if (ai.open) input.focus();
    }
  });
})();
