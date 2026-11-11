// Shared focus and background handling for the menu and filter dialog.
export function createModalController(dialog) {
  let previousFocus = null;
  let blocked = [];
  let active = false;
  function controls() {
    return [...dialog.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex]')]
      .filter(element => element.tabIndex >= 0 && !element.disabled && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
  }
  function activate({ initialFocus = null } = {}) {
    if (active || !dialog) return;
    active = true;
    previousFocus = document.activeElement;
    // Disable every sibling outside the dialog, including ancestors' siblings.
    for (let node = dialog; node && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling === node || sibling.matches('script, style, link')) continue;
        blocked.push([sibling, sibling.inert]);
        sibling.inert = true;
      }
    }
    const start = initialFocus && dialog.contains(initialFocus)
      ? initialFocus
      : (controls()[0] || dialog);
    start.focus({ preventScroll: true });
  }
  function deactivate({ returnFocus = true } = {}) {
    if (!active) return;
    active = false;
    for (const [element, wasInert] of blocked) element.inert = wasInert;
    blocked = [];
    if (returnFocus && previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus({ preventScroll: true });
  }
  dialog?.addEventListener('keydown', event => {
    if (!active || event.key !== 'Tab') return;
    const items = controls();
    if (!items.length) { event.preventDefault(); dialog.focus(); return; }
    const index = items.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && (index < 0 || index === items.length - 1)) { event.preventDefault(); items[0].focus(); }
  });
  return { activate, deactivate };
}
