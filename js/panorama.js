const tourButton = document.getElementById("campus-tour-toggle");
const tourPlayer = document.getElementById("campus-tour-player");
const tourFrame = tourPlayer.querySelector("iframe");
const tourPath = "./assets/campus-tour/";

// The panorama package is optional. Its player only loads after the user opens it.
fetch(tourPath + "scenes.js", { method: "HEAD", signal: AbortSignal.timeout(4000) })
  .then(response => {
    if (response.ok && /(?:java|ecma)script/.test(response.headers.get("Content-Type") ?? "")) {
      tourButton.hidden = false;
      document.getElementById("campus-tour-unavailable").hidden = true;
    }
  })
  .catch(() => {});

tourButton.addEventListener("click", () => {
  const opening = tourPlayer.hidden;
  tourPlayer.hidden = !opening;
  tourButton.setAttribute("aria-expanded", String(opening));
  tourButton.textContent = opening ? "收起全景漫游" : "进入全景漫游 →";
  if (opening) {
    tourFrame.src = tourPath + "index.html";
    tourPlayer.scrollIntoView({ block: "nearest" });
  } else {
    tourFrame.removeAttribute("src");
  }
});
