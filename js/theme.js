// Apply the saved theme before loading the page styles.
(function () {
  try {
    const saved = JSON.parse(localStorage.getItem("campus-nova:v1"));
    if (saved?.version === 1 && saved.theme === "dark") {
      document.documentElement.dataset.theme = "dark";
      document.querySelector('meta[name="theme-color"]').content = "#04101E";
    }
  } catch {
    // Keep the default theme when storage is unavailable.
  }
})();
