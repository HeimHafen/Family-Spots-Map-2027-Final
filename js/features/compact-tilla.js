// Keep play suggestions visible when the introduction is collapsed.
export function initCompactTilla() {
  const details = document.getElementById("tilla-more");
  const play = document.getElementById("btn-play-idea");
  if (!details || !play || details.dataset.initialized) return;
  details.dataset.initialized = "1";
  play.addEventListener("click", () => { details.open = true; });
}
