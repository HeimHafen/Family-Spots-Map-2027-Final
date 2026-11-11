import { createCrownIcon } from "../utils/dom.js?v=20261010-unified-4";
import { $ } from "../utils/utils.js";
import { getLanguage, t } from "../i18n.js?v=20261106-app-feinschliff-16";
// Compatibility for the historical renderer; the current UI lives in app.js.
import { showToast as showTillaMessage } from "../toast.js";

/**
 * Kurzbeschreibung für die Listenkarte bauen.
 */
function buildSpotListDescription(spot, isDe) {
  const primarySummary = isDe ? spot.summary_de : spot.summary_en;
  const secondarySummary = isDe ? spot.summary_en : spot.summary_de;

  // WICHTIG: beide Varianten unterstützen (visitLabel_* UND visit_label_*)
  const visitLabel =
    (isDe
      ? spot.visitLabel_de || spot.visit_label_de
      : spot.visitLabel_en || spot.visit_label_en) || "";

  const poetry = spot.poetry;

  let text =
    (primarySummary && String(primarySummary).trim()) ||
    (visitLabel && String(visitLabel).trim()) ||
    (poetry && String(poetry).trim()) ||
    (secondarySummary && String(secondarySummary).trim()) ||
    "";

  if (!text) return "";

  const maxLen = 140;
  if (text.length > maxLen) {
    return text.slice(0, maxLen - 1) + "…";
  }
  return text;
}

/**
 * Rendert die Spot-Liste in der Sidebar.
 */
export function renderSpotList(spots, options) {
  const { favorites = [], onSelect } = options || {};
  const container = $("#spot-list");
  if (!container) return;

  const lang = getLanguage() || "de";
  const isDe = lang.startsWith("de");

  container.innerHTML = "";

  // Wenn keine Spots matchen, bekommt Tilla eine tröstende Nachricht 🐢
  if (!spots || spots.length === 0) {
    const empty = document.createElement("div");
    empty.className = "spot-list-empty";
    empty.textContent = isDe
      ? "Gerade passt kein Spot zu euren Filtern. Probiert andere Kategorien oder einen größeren Radius."
      : "No spots match your filters right now. Try other categories or a wider radius.";
    container.appendChild(empty);

    showTillaMessage(
      t(
        "turtle_intro_2",
        isDe
          ? "Gerade finde ich keinen passenden Spot. Vielleicht passt heute ein kleiner Spaziergang in eurer Nähe – oder ihr dreht den Radius ein Stück weiter auf. 🐢"
          : "Right now I can’t find a fitting spot. Maybe a small walk nearby is perfect today – or you widen the radius a little. 🐢"
      )
    );

    return;
  }

  spots.forEach((spot) => {
    const isFav = favorites.includes(spot.id);

    const card = document.createElement("article");
    card.className = "spot-card";
    card.tabIndex = 0;

    const title = document.createElement("h3");
    title.className = "spot-card-title";
    title.textContent = spot.name || spot.title || "Spot";

    // NEU: a11y für Card
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", title.textContent || "Spot");

    const meta = document.createElement("div");
    meta.className = "spot-card-meta";

    if (spot.city) {
      const cityEl = document.createElement("span");
      cityEl.className = "spot-card-meta-item";
      cityEl.textContent = spot.city;
      meta.appendChild(cityEl);
    }

    if (spot.categories && spot.categories.length > 0) {
      const catEl = document.createElement("span");
      catEl.className = "spot-card-meta-item";

      const mainCat = spot.categories[0];
      const label = t("category_" + mainCat, mainCat) || mainCat;

      catEl.textContent = label;
      meta.appendChild(catEl);
    }

    const descText = buildSpotListDescription(spot, isDe);
    let descEl = null;
    if (descText) {
      descEl = document.createElement("p");
      descEl.className = "spot-card-description";
      descEl.textContent = descText;
    }

    const badgesRow = document.createElement("div");
    badgesRow.className = "spot-card-badges";

    if (spot.verified) {
      const b = document.createElement("span");
      b.className = "badge badge--verified";
      b.textContent = isDe ? "Infos geprüft" : "Information checked";
      badgesRow.appendChild(b);
    }

    if (spot.plus_only) {
      const bPlus = document.createElement("span");
      bPlus.className = "badge badge--plus";
      bPlus.append(createCrownIcon(), document.createTextNode("Plus"));
      badgesRow.appendChild(bPlus);
    }

    if (Array.isArray(spot.tags) && spot.tags.length > 0) {
      const tag = String(spot.tags[0]);
      const bTag = document.createElement("span");
      bTag.className = "badge badge--tag";
      bTag.textContent = tag;
      badgesRow.appendChild(bTag);
    }

    const actionsRow = document.createElement("div");
    actionsRow.className = "spot-card-actions";

    const favIcon = document.createElement("span");
    favIcon.className = "spot-card-fav-icon";
    favIcon.textContent = isFav ? "★" : "☆";

    // NEU: a11y für Fav-Icon
    favIcon.setAttribute("role", "button");
    favIcon.setAttribute("aria-pressed", isFav ? "true" : "false");

    actionsRow.appendChild(favIcon);

    const detailLabel = document.createElement("span");
    detailLabel.className = "spot-card-detail-label";
    detailLabel.textContent = isDe ? "Details öffnen" : "Open details";
    actionsRow.appendChild(detailLabel);

    card.appendChild(title);
    card.appendChild(meta);
    if (badgesRow.childNodes.length > 0) {
      card.appendChild(badgesRow);
    }
    if (descEl) {
      card.appendChild(descEl);
    }
    card.appendChild(actionsRow);

    const onCardSelect = () => {
      if (typeof onSelect === "function") {
        onSelect(spot.id);
      }
    };

    // NEU: keine Doppel-Aktion, wenn innerhalb ein Button geklickt wird
    card.addEventListener("click", (ev) => {
      const target = ev.target;
      if (target.closest("button")) return; // keine Doppel-Aktion
      onCardSelect();
    });

    card.addEventListener("keypress", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        onCardSelect();
      }
    });

    container.appendChild(card);
  });
}

/**
 * Rendert das Detail-Panel für einen Spot.
 */
export function renderSpotDetails(spot, options) {
  const { isFavorite = false, onToggleFavorite } = options || {};
  const container = $("#spot-detail");
  if (!container || !spot) return;

  const lang = getLanguage() || "de";
  const isDe = lang.startsWith("de");

  container.classList.remove("spot-details--hidden");

  const title = spot.name || spot.title || "Spot";

  const summaryPrimary = isDe ? spot.summary_de : spot.summary_en;
  const summarySecondary = isDe ? spot.summary_en : spot.summary_de;

  // WICHTIG: beide Varianten visitLabel_* und visit_label_*.
  const visitLabel =
    (isDe
      ? spot.visitLabel_de || spot.visit_label_de
      : spot.visitLabel_en || spot.visit_label_en) || "";

  let description = "";
  if (summaryPrimary) description = summaryPrimary;
  else if (visitLabel) description = visitLabel;
  else if (summarySecondary) description = summarySecondary;

  let visitTimeText = "";
  if (spot.visit_minutes && Number(spot.visit_minutes) > 0) {
    const mins = Number(spot.visit_minutes);
    if (isDe) {
      visitTimeText =
        mins >= 180 ? `${Math.round(mins / 60)}+ Stunden` : `${mins} Minuten`;
    } else {
      visitTimeText =
        mins >= 180 ? `${Math.round(mins / 60)}+ hours` : `${mins} minutes`;
    }
  }

  const googleLabel = isDe ? "Route (Google Maps)" : "Route (Google Maps)";
  const appleLabel = isDe ? "Route (Apple Karten)" : "Route (Apple Maps)";

  let googleMapsUrl = "";
  let appleMapsUrl = "";

  if (spot.location && spot.location.lat != null && spot.location.lng != null) {
    const lat = spot.location.lat;
    const lng = spot.location.lng;
    const encodedName = encodeURIComponent(
      (spot.name || spot.title || "") + (spot.city ? " " + spot.city : "")
    );

    googleMapsUrl =
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(lat + "," + lng) +
      (encodedName ? "&destination_place_id=&query=" + encodedName : "");

    appleMapsUrl =
      "https://maps.apple.com/?daddr=" + encodeURIComponent(lat + "," + lng);
  }

  const favLabel = isDe ? "Favorit" : "Favourite";
  const closeLabel = isDe ? "Details schließen" : "Close details";

  const categoriesText = Array.isArray(spot.categories)
    ? spot.categories.join(", ")
    : "";

  container.innerHTML = `
    <header class="spot-details-header">
      <div>
        <h2 class="spot-details-title">${escapeHtml(title)}</h2>
        <div class="spot-details-meta">
          ${spot.city ? `<span>${escapeHtml(spot.city)}</span>` : ""}
          ${categoriesText ? `<span>${escapeHtml(categoriesText)}</span>` : ""}
          ${visitTimeText ? `<span>${escapeHtml(visitTimeText)}</span>` : ""}
          ${spot.verified ? `<span>${isDe ? "Verifiziert" : "Verified"}</span>` : ""}
        </div>
      </div>
      <div class="spot-details-actions">
        <button
          type="button"
          class="btn-icon"
          data-role="favorite-toggle"
          aria-label="${favLabel}"
        >
          ${isFavorite ? "★" : "☆"}
        </button>
        <button
          type="button"
          class="btn-icon"
          data-role="close-details"
          aria-label="${closeLabel}"
        >
          ×
        </button>
      </div>
    </header>

    ${
      spot.tags && spot.tags.length
        ? `<div class="spot-details-tags">
             ${spot.tags
               .map(
                 (tag) =>
                   `<span class="badge badge--tag">${escapeHtml(
                     String(tag)
                   )}</span>`
               )
               .join(" ")}
           </div>`
        : ""
    }

    ${
      description
        ? `<p class="spot-details-description">${escapeHtml(description)}</p>`
        : ""
    }

    ${
      spot.poetry
        ? `<p class="spot-details-poetry">„${escapeHtml(spot.poetry)}“</p>`
        : ""
    }

    ${
      spot.address
        ? `<p class="spot-details-address">${escapeHtml(spot.address)}</p>`
        : ""
    }

    ${
      googleMapsUrl || appleMapsUrl
        ? `<div class="spot-details-routes">
             ${
               googleMapsUrl
                 ? `<a class="spot-details-route-link" href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                     googleLabel
                   )}</a>`
                 : ""
             }
             ${
               appleMapsUrl
                 ? `<a class="spot-details-route-link" href="${appleMapsUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                     appleLabel
                   )}</a>`
                 : ""
             }
           </div>`
        : ""
    }
  `;

  const favButton = container.querySelector('[data-role="favorite-toggle"]');
  if (favButton && typeof onToggleFavorite === "function") {
    favButton.addEventListener("click", (ev) => {
      ev.stopPropagation();
      onToggleFavorite(spot.id);
    });
  }

  const closeButton = container.querySelector('[data-role="close-details"]');
  if (closeButton) {
    closeButton.addEventListener("click", (ev) => {
      ev.stopPropagation();
      hideSpotDetails();
    });
  }

  if (typeof window !== "undefined" && window.innerWidth <= 900) {
    setTimeout(() => {
      container.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 0);
  }
}

/**
 * Detailfenster verstecken.
 */
export function hideSpotDetails() {
  const container = $("#spot-detail");
  if (!container) return;
  container.classList.add("spot-details--hidden");
  container.innerHTML = "";
}

/**
 * Toast-Anzeige.
 */
export function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("toast--visible");

  setTimeout(() => {
    el.classList.remove("toast--visible");
  }, 2600);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}