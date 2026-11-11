import { qs } from "../utils/dom.js";
import { createModalController } from "./modal.js";

export function initMenu() {
  const menuToggle = qs("#menu-toggle");
  const menu = qs("#app-menu");
  const controller = menu ? createModalController(menu) : null;
  const menuTitle = menu?.querySelector("#app-menu-title");

  function openMenu() {
    if (!menu || !menu.hidden) return;
    menu.hidden = false;
    menu.setAttribute("aria-hidden", "false");
    document.body.dataset.menuOpen = "1";
    menuToggle?.setAttribute("aria-expanded", "true");
    controller.activate({ initialFocus: menuTitle });
  }
  function closeMenu() {
    if (!menu || menu.hidden) return;
    controller.deactivate();
    menu.hidden = true;
    menu.setAttribute("aria-hidden", "true");
    delete document.body.dataset.menuOpen;
    menuToggle?.setAttribute("aria-expanded", "false");
  }
  menuToggle?.addEventListener("click", () => menu?.hidden ? openMenu() : closeMenu());
  menu?.addEventListener("click", event => {
    if (event.target?.closest("[data-menu-close]")) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu && !menu.hidden) { event.preventDefault(); closeMenu(); }
  });
  return { openMenu, closeMenu };
}
