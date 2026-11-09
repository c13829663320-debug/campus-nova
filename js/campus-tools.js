(() => {
  const ai = document.getElementById("campus-ai");
  const feedbackLink = document.getElementById("feedback-link");
  const form = document.getElementById("campus-chat-form");
  const input = document.getElementById("campus-question");
  const send = form.querySelector("button[type=submit]");
  const status = document.getElementById("campus-chat-status");
  const chat = document.getElementById("campus-chat");
  const scroller = document.getElementById("campus-agent-body");
  const welcome = document.getElementById("campus-agent-welcome");
  const files = document.getElementById("campus-agent-files");
  const fileInput = document.getElementById("campus-agent-file");
  const audioInput = document.getElementById("campus-agent-audio");
  const attach = document.getElementById("campus-attach");
  const voice = document.getElementById("campus-voice");
  const reset = document.getElementById("campus-new-chat");
  const history = [];
  const imageTypes = ["image/png", "image/jpeg", "image/webp"];
  const voiceFormats = /\.(wav|mp3|flac|m4a|ogg|webm|aac)$/i;
  const served = location.protocol === "http:" || location.protocol === "https:";
  const liveVoice = Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  const links = new Set(["#clubs", "campus-map.html", "map3d.html"]);
  let lastFiles = [];
  let draft = [];
  let busy = false;
  let available = false;
  let recording = null;

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.hidden = !message;
    status.dataset.error = String(isError);
  }

  function updateControls() {
    send.disabled = !available || busy || Boolean(recording) || !(input.value.trim() || draft.length);
    attach.disabled = busy || Boolean(recording);
    reset.disabled = busy;
    voice.disabled = busy;
    input.readOnly = busy;
  }

  async function readFeatures() {
    if (served) {
      try {
        const response = await fetch("./api/features", { signal: AbortSignal.timeout(5000) });
        if (response.ok) return await response.json();
      } catch {}
    }
    return null;
  }

  const featureCheck = () => readFeatures().then(config => {
    if (config?.feedbackUrl) feedbackLink.href = config.feedbackUrl;
    available = Boolean(config?.aiEnabled);
    updateControls();
    if (ai.open && !busy) setStatus(available ? "" : served
      ? "暂时连不上校园助手。重新打开可以重试连接。"
      : "请打开星图校园网站后使用校园助手。", !available);
  });

  featureCheck();
  document.getElementById("open-campus-ai").addEventListener("click", () => {
    ai.showModal();
    if (!available) {
      setStatus("正在连接校园助手…");
      featureCheck();
    }
    if (matchMedia("(pointer: fine)").matches && !busy) input.focus();
  });

  ai.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => {
    if (busy) return;
    input.value = button.dataset.prompt;
    updateControls();
    input.focus();
  }));
  input.addEventListener("input", updateControls);
  input.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !event.isComposing && !send.disabled) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  function showDraft() {
    files.replaceChildren();
    for (const file of draft) {
      const item = document.createElement("button");
      item.className = "campus-agent-file";
      item.type = "button";
      item.textContent = file.name + " ×";
      item.setAttribute("aria-label", "移除 " + file.name);
      item.addEventListener("click", () => {
        if (busy) return;
        draft = draft.filter(entry => entry !== file);
        showDraft();
        attach.focus();
      });
      files.append(item);
    }
    files.hidden = !draft.length;
    updateControls();
  }

  function base64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function prepareImage(file) {
    if (file.size > 10 * 1024 * 1024) throw new Error("请选择 10 MB 以内的图片。");
    const bitmap = await createImageBitmap(file);
    try {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.77).split(",")[1];
      if (!data || data.length > 850_000) throw new Error("这张图片细节过多，请缩小后重试。");
      return { kind: "image", name: file.name.slice(0, 120), type: "image/jpeg", data };
    } finally {
      bitmap.close();
    }
  }

  async function prepareFile(file) {
    if (imageTypes.includes(file.type)) return prepareImage(file);
    if (!/\.(txt|md|csv)$/i.test(file.name)) throw new Error("支持 JPG、PNG、WebP、TXT、Markdown 和 CSV。");
    if (file.size > 32_000) throw new Error("文字附件请控制在 8000 字以内。");
    const content = (await file.text()).trim();
    if (!content || content.length > 8000) throw new Error("文字附件需要有内容，且最多 8000 字。");
    return { kind: "text", name: file.name.slice(0, 120), text: content };
  }

  attach.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const selected = [...fileInput.files];
    fileInput.value = "";
    if (!selected.length || busy) return;
    if (selected.length + draft.length > 3) return setStatus("每轮最多添加 3 个附件。", true);
    busy = true;
    updateControls();
    setStatus("正在读取附件…");
    try {
      const incoming = await Promise.all(selected.map(prepareFile));
      if ([...draft, ...incoming].filter(file => file.kind === "image").length > 1) {
        return setStatus("每轮可添加一张图片。", true);
      }
      draft = [...draft, ...incoming];
      showDraft();
      setStatus("");
    } catch (error) {
      setStatus(error.message || "附件读取失败，请换一个文件。", true);
    } finally {
      busy = false;
      updateControls();
    }
  });

  async function request(payload) {
    const response = await fetch("./api/campus-ai", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(75_000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || (response.status === 413 ? "附件太大，请缩小后重试。" : "助手暂时无法连接，请稍后重试。"));
    }
    return result;
  }

  const voiceLabel = voice.querySelector("span");
  let uploadVoice = !liveVoice;
  if (uploadVoice) voiceLabel.textContent = "上传录音";

  function stopVoice(discard = true) {
    if (!recording) return;
    const session = recording;
    recording = null;
    session.discard = discard;
    clearTimeout(session.timer);
    if (session.recorder?.state === "recording") {
      if (!discard) busy = true;
      session.recorder.stop();
    }
    session.stream?.getTracks().forEach(track => track.stop());
    voice.setAttribute("aria-pressed", "false");
    voiceLabel.textContent = "语音输入";
    if (discard) setStatus("");
    updateControls();
  }

  voice.addEventListener("click", async () => {
    if (uploadVoice) return audioInput.click();
    if (recording) return stopVoice(!recording.recorder);
    const session = { discard: false };
    recording = session;
    updateControls();
    setStatus("正在请求麦克风权限…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (session.discard) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      session.stream = stream;
      const mime = ["audio/webm;codecs=opus", "audio/mp4"].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, { ...(mime && { mimeType: mime }), audioBitsPerSecond: 48_000 });
      session.recorder = recorder;
      const chunks = [];
      recorder.addEventListener("dataavailable", event => { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", () => {
        if (session.discard) return;
        const type = recorder.mimeType.split(";")[0];
        const format = ({ "audio/mp4": "m4a", "audio/webm": "webm", "audio/ogg": "ogg" })[type];
        if (!format) {
          busy = false;
          updateControls();
          uploadVoice = true;
          voiceLabel.textContent = "上传录音";
          setStatus("录音格式暂不支持，可以上传常见格式的录音。", true);
          return;
        }
        transcribeFile(new File(chunks, "录音." + format, { type }));
      });
      recorder.addEventListener("error", () => {
        if (recording === session) stopVoice();
        setStatus("录音中断，可以上传一段录音。", true);
      });
      recorder.start();
      voice.setAttribute("aria-pressed", "true");
      voiceLabel.textContent = "结束录音";
      setStatus("正在录音，最长 20 秒。结束后会转写为可编辑的文字。");
      session.timer = setTimeout(() => stopVoice(false), 20_000);
    } catch {
      if (recording !== session) return;
      stopVoice();
      voiceLabel.textContent = "上传录音";
      uploadVoice = true;
      setStatus("麦克风暂不可用。再次点击可上传录音。", true);
    }
  });

  async function transcribeFile(file) {
    const format = file.name.match(voiceFormats)?.[1].toLowerCase() || ({
      "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/wav": "wav", "audio/webm": "webm", "audio/ogg": "ogg"
    })[file.type];
    if (!format || !file.size || file.size > 600_000) {
      busy = false;
      updateControls();
      return setStatus("请选择 600 KB 内的常见录音格式，例如 MP3、M4A 或 WAV。", true);
    }
    busy = true;
    updateControls();
    setStatus("正在转写录音…");
    try {
      const result = await request({ action: "transcribe", attachments: [
        { kind: "audio", name: file.name.slice(0, 120), format, data: await base64(file) }
      ] });
      if (typeof result.transcript !== "string") throw new Error("录音未能转写，请换一段录音。");
      input.value = [input.value.trim(), result.transcript].filter(Boolean).join(" ").slice(0, input.maxLength);
      setStatus("转写完成，可以修改后发送。");
    } catch (error) {
      setStatus(error instanceof TypeError ? "无法连接语音服务，请稍后重试。" : error.message, true);
    } finally {
      busy = false;
      updateControls();
    }
  }

  audioInput.addEventListener("change", () => {
    const file = audioInput.files[0];
    audioInput.value = "";
    if (file && !busy) transcribeFile(file);
  });


  ai.addEventListener("close", () => stopVoice());
  reset.addEventListener("click", () => {
    stopVoice();
    history.length = 0;
    lastFiles = [];
    draft = [];
    input.value = "";
    chat.replaceChildren();
    welcome.hidden = false;
    showDraft();
    setStatus("");
    input.focus();
  });

  function addMessage(speaker, message, options = {}) {
    const item = document.createElement("article");
    const label = document.createElement("strong");
    const body = document.createElement("p");
    item.className = "campus-message";
    item.dataset.speaker = speaker;
    label.textContent = speaker === "user" ? "你" : ({
      image: "图像生成", vision: "图片解读", lookup: "校园资料", text: "校园助手"
    })[options.mode] || "校园助手";
    body.textContent = message;
    item.append(label, body);
    if (options.files?.length) {
      const names = document.createElement("small");
      names.textContent = "附件 · " + options.files.map(file => file.name).join("、");
      item.append(names);
      const photo = options.files.find(file => file.kind === "image");
      if (photo) {
        const preview = document.createElement("img");
        preview.src = "data:" + photo.type + ";base64," + photo.data;
        preview.alt = "上传的图片";
        item.append(preview);
      }
    }
    if (options.image && imageTypes.includes(options.image.type)) {
      const picture = document.createElement("img");
      const download = document.createElement("a");
      picture.src = "data:" + options.image.type + ";base64," + options.image.data;
      picture.alt = "校园助手生成的图片";
      download.href = picture.src;
      download.download = "星图校园-" + Date.now() + "." + options.image.type.split("/")[1];
      download.textContent = "下载图片 ↓";
      item.append(picture, download);
    }
    for (const link of options.links || []) {
      if (!links.has(link.href)) continue;
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.textContent = link.label + " ↗";
      anchor.addEventListener("click", () => ai.close());
      item.append(anchor);
    }
    chat.append(item);
    return item;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (send.disabled) return;
    const question = input.value.trim() || "请帮我解读这份附件。";
    const reusesAttachment = /^(?:那|它|这|再|继续|上[一次轮]|刚才|根据|提取|总结|改成|换成|调整|把|给它加)/.test(question);
    const attachments = draft.length ? draft : reusesAttachment ? lastFiles : [];
    busy = true;
    updateControls();
    welcome.hidden = true;
    const pending = addMessage("user", question, { files: draft });
    pending.scrollIntoView({ block: "nearest" });
    setStatus("助手正在处理请求…");
    try {
      const result = await request({ question, history, attachments });
      if (typeof result.answer !== "string") throw new Error("助手暂时没有返回内容，请重试。");
      addMessage("assistant", result.answer, result);
      history.push({ question, answer: result.answer, mode: result.mode });
      if (history.length > 6) history.shift();
      if (draft.length) lastFiles = draft;
      if (result.image && result.image.data.length <= 850_000) {
        lastFiles = [{ kind: "image", name: "上一张生成图", ...result.image }];
      }
      draft = [];
      input.value = "";
      showDraft();
      setStatus("");
      scroller.scrollTop = scroller.scrollHeight;
    } catch (error) {
      pending.remove();
      welcome.hidden = Boolean(history.length);
      setStatus(error.name === "TimeoutError" ? "处理超时。草稿仍在，可以再试一次。"
        : error instanceof TypeError ? "连接中断。草稿仍在，可以重新发送。" : error.message, true);
    } finally {
      busy = false;
      updateControls();
    }
  });
})();
