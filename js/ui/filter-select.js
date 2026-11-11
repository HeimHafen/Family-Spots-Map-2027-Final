// Progressive enhancement: retain the original selects as the filter data source.
// App-owned listboxes avoid platform-specific picker colours on mobile.
export function initFilterSelects() {
  for (const id of ['filter-age']) {
    const select = document.getElementById(id);
    if (!select || select.dataset.enhanced) continue;
    const wrap = document.createElement('div');
    wrap.className = 'filter-picker';
    const trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'input filter-picker__trigger';
    trigger.id = `${id}-trigger`;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const text = document.createElement('span'); text.id = `${id}-value`;
    trigger.append(text);
    trigger.setAttribute('aria-labelledby', `${id}-label ${text.id}`);
    if (select.hasAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', select.getAttribute('aria-describedby'));
    const list = document.createElement('div');
    list.className = 'filter-picker__list'; list.id = `${id}-listbox`;
    list.setAttribute('role', 'listbox'); list.setAttribute('aria-labelledby', `${id}-label`);
    list.hidden = true; trigger.setAttribute('aria-controls', list.id);
    wrap.append(trigger, list); select.after(wrap);
    let active = 0, options = [], search = '', lastKey = 0;
    const close = () => {
      list.hidden = true; trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
    };
    const highlight = (index, scroll = true) => {
      active = index;
      [...list.querySelectorAll('[role="option"]')].forEach((el, i) => el.classList.toggle('is-active', i === active));
      const item = document.getElementById(`${id}-option-${active}`);
      if (item) { trigger.setAttribute('aria-activedescendant', item.id); if (scroll) item.scrollIntoView({block:'nearest'}); }
    };
    const sync = () => {
      text.textContent = select.selectedOptions[0]?.textContent.trim() || '';
      trigger.disabled = select.disabled;
      trigger.classList.toggle('is-selected', select.selectedIndex > 0);
      list.querySelectorAll('[role="option"]').forEach((el, i) => el.setAttribute('aria-selected', String(options[i]?.selected || false)));
    };
    const build = () => {
      list.replaceChildren(); options = [...select.options];
      for (const child of select.children) {
        if (child.tagName === 'OPTGROUP') {
          const heading = document.createElement('div'); heading.className = 'filter-picker__group'; heading.textContent = child.label;
          heading.setAttribute('role', 'presentation'); list.append(heading);
        }
        for (const option of child.tagName === 'OPTGROUP' ? child.children : [child]) {
          if (option.tagName !== 'OPTION') continue;
          const i = options.indexOf(option), item = document.createElement('div');
          item.id = `${id}-option-${i}`; item.setAttribute('role', 'option');
          item.className = 'filter-picker__option'; item.textContent = option.textContent.trim();
          item.setAttribute('aria-disabled', String(option.disabled || option.parentElement.disabled || false));
          item.addEventListener('pointerdown', e => e.preventDefault());
          item.addEventListener('click', () => choose(i)); list.append(item);
        }
      }
      sync(); if (!list.hidden) highlight(Math.max(0, select.selectedIndex), false);
    };
    const enabled = i => options[i] && !options[i].disabled && !options[i].parentElement.disabled;
    const choose = i => {
      if (!enabled(i)) return;
      const changed = select.selectedIndex !== i;
      select.selectedIndex = i; close(); sync(); trigger.focus({preventScroll:true});
      if (changed) { select.dispatchEvent(new Event('input', {bubbles:true})); select.dispatchEvent(new Event('change', {bubbles:true})); }
    };
    const open = () => {
      document.dispatchEvent(new CustomEvent('fsm:picker-open', {detail:id}));
      build(); list.hidden = false; trigger.setAttribute('aria-expanded', 'true');
      highlight(Math.max(0, select.selectedIndex));
    };
    trigger.addEventListener('click', () => list.hidden ? open() : close());
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key === 'Tab') { close(); return; }
      if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
        e.preventDefault(); if (list.hidden) { open(); return; }
        const step = e.key === 'ArrowUp' || e.key === 'End' ? -1 : 1;
        let i = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : active + step;
        while (i >= 0 && i < options.length && !enabled(i)) i += step;
        if (enabled(i)) highlight(i); return;
      }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); list.hidden ? open() : choose(active); return; }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault(); if (list.hidden) open();
        const now = Date.now(); search = now - lastKey > 700 ? e.key : search + e.key; lastKey = now;
        const i = options.findIndex((o, i) => enabled(i) && o.textContent.trim().toLocaleLowerCase().startsWith(search.toLocaleLowerCase()));
        if (i >= 0) highlight(i);
      }
    });
    document.addEventListener('fsm:picker-open', e => { if (e.detail !== id) close(); });
    document.addEventListener('pointerdown', e => { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('focusin', e => { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('click', () => queueMicrotask(sync));
    document.addEventListener('change', sync);
    select.addEventListener('change', sync);
    new MutationObserver(build).observe(select, {subtree:true, childList:true, characterData:true, attributes:true});
    const label = document.querySelector(`label[for="${id}"]`); if (label) label.htmlFor = trigger.id;
    build(); select.hidden = true; select.dataset.enhanced = 'true';
  }
}
