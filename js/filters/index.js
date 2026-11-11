// js/filters/index.js
export {
  normalizeSpot,
  normalizeArrayField,
  getSpotAgeGroups,
  getSpotMoods,
  getSpotTravelModes
} from "./normalize.js?v=20261010-unified-4";

export {
  getSpotName,
  getSpotSubtitle,
  getSpotId,
  getSpotTags,
  getSpotCategorySlugs,
  buildSpotSearchText
} from "./tags.js?v=20261010-unified-4";

export { doesSpotMatchBaseFilters, isSpotVerified } from "./logic.js?v=20261010-unified-4";
export { filterSpots } from "./apply.js?v=20261010-unified-4";