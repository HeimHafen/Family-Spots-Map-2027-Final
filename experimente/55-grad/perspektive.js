// Family Spots Map · isolate 55° pitch experiment · NO changes to the existing Leaflet map.
// Uses actual source data from ../../data/spots.json; no writes to storage, favorites or daylog.
// MapLibre is fetched online, like its public CDN example; an internet connection is required.
import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.mjs';

const $ = selector => document.querySelector(selector);
const status = $('#map-message');
const count = $('#spot-count');
const label = $('#perspective-label');
const search = $('#spot-search');
const suggestions = $('#suggestions');
const THEME_KEY = 'fsm-prototype-theme'; // No persistent writes: declared only for future development.
void THEME_KEY;

const LOCATIONS = Object.freeze({
  hannover: { center: [9.78, 52.27], zoom: 10.5 },
  deister: { center: [9.48, 52.255], zoom: 11.5 },
  harz: { center: [10.67, 51.77], zoom: 10.8 }
});

const FREE_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const DEM_URL = 'https://tiles.mapterhorn.com/tilejson.json';
let pitch = 55;
let map;
let spotFeatures = [];
let styleReady = false;

function message(text, hideAfterMs = 0) {
  status.textContent = text;
  status.hidden = !text;
  // Do not use timers: retain error messages until the user acts.
  void hideAfterMs;
}
function updatePitchButtons() {
  document.querySelectorAll('[data-pitch]').forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.pitch) === pitch));
  });
  label.replaceChildren(document.createTextNode(`${pitch === 0 ? '2D' : `${pitch}°`} · ${pitch > 0 ? 'Gelände' : 'Draufsicht'}`));
}
function updateTerrain() {
  if (!styleReady || !map) return;
  try {
    if (pitch > 0 && map.getSource('fsm-dem')) {
      map.setTerrain({ source: 'fsm-dem', exaggeration: 1 });
    } else {
      map.setTerrain(null);
    }
  } catch (error) {
    console.warn('Terrain-Ansicht konnte nicht aktiviert werden:', error);
    message('Die Neigung funktioniert; die Geländehöhen konnten nicht aktiviert werden.');
  }
}
function setPitch(next) {
  if (![0, 35, 55].includes(next) || !map) return;
  pitch = next;
  updatePitchButtons();
  updateTerrain();
  map.easeTo({ pitch, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700, essential: false });
}

function titleFor(spot) {
  return String(spot.title_de || spot.title || spot.title_en || spot.id || 'Familien-Spot');
}
function buildSpotFeatures(spots) {
  const ids = new Set();
  return spots.flatMap((spot, index) => {
    const lat = Number(spot.lat);
    const lng = Number(spot.lng ?? spot.lon);
    const id = String(spot.id || `spot-${index}`);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || ids.has(id)) return [];
    ids.add(id);
    return [{
      type: 'Feature',
      id: index,
      geometry: {type: 'Point', coordinates: [lng, lat]},
      properties: {
        id,
        title: titleFor(spot),
        city: String(spot.city || ''),
        country: String(spot.country || ''),
        summary: String(spot.summary_de || ''),
        verified: Boolean(spot.verified)
      }
    }];
  });
}
function dataGeoJSON() {
  return { type: 'FeatureCollection', features: spotFeatures };
}
function addSpotLayers() {
  if (!styleReady || !map) return;
  if (map.getSource('fsm-spots')) return;
  map.addSource('fsm-spots', {
    type: 'geojson', data: dataGeoJSON(), cluster: true, clusterMaxZoom: 14, clusterRadius: 60
  });
  map.addLayer({
    id:'fsm-clusters', type:'circle', source:'fsm-spots', filter:['has','point_count'],
    paint:{'circle-color':'#98c65c','circle-stroke-color':'#fff8ed','circle-stroke-width':2.5,
      'circle-radius':['step',['get','point_count'],17,20,22,65,27]}
  });
  map.addLayer({
    id:'fsm-cluster-count', type:'symbol', source:'fsm-spots', filter:['has','point_count'],
    layout:{'text-field':['get','point_count_abbreviated'],'text-font':['Noto Sans Regular'], 'text-size':13},
    paint:{'text-color':'#23321e'}
  });
  map.addLayer({
    id:'fsm-points', type:'circle', source:'fsm-spots', filter:['!', ['has','point_count']],
    paint:{'circle-color':'#81b74e','circle-stroke-color':'#fff8ed','circle-stroke-width':2.5,'circle-radius':10}
  });
}
function attachStyleLayers() {
  styleReady = true;
  try {
    map.addSource('fsm-dem', {type:'raster-dem',url:DEM_URL});
    map.addSource('fsm-shade', {type:'raster-dem',url:DEM_URL});
    const firstLabels = map.getStyle()?.layers?.find(layer => layer.type === 'symbol')?.id;
    map.addLayer({id:'fsm-hillshade',type:'hillshade',source:'fsm-shade',paint:{'hillshade-exaggeration':0.20,'hillshade-shadow-color':'#545a39'}}, firstLabels);
  } catch(error) {
    console.warn('Terrain source unavailable:',error);
    message('Die Kartenneigung funktioniert. Höhenmodell derzeit nicht verfügbar.');
  }
  updateTerrain();
  addSpotLayers();
}
function showSpot(feature, coordinates) {
  const p = feature.properties;
  const root = document.createElement('div');
  root.className = 'fsm-popup';
  const title = document.createElement('h2');
  title.textContent = p.title;
  const city = document.createElement('p');
  city.textContent = [p.city, p.country].filter(Boolean).join(' · ');
  const summary = document.createElement('p');
  summary.textContent = String(p.summary || 'Spot aus der Family Spots Map.').slice(0,240) + (p.summary?.length > 240 ? '…' : '');
  const note = document.createElement('small');
  note.textContent = 'Testansicht · Originaldaten deiner App';
  root.append(title,city,summary,note);
  new maplibregl.Popup({ offset: 14, maxWidth: '280px', className:'fsm-spot-popup' })
    .setLngLat(coordinates).setDOMContent(root).addTo(map);
}
function bindInteractions() {
  map.on('click','fsm-clusters', async event => {
    const feature = map.queryRenderedFeatures(event.point, { layers:['fsm-clusters'] })[0];
    if (!feature) return;
    try {
      const zoom = await map.getSource('fsm-spots').getClusterExpansionZoom(feature.properties.cluster_id);
      map.easeTo({center:feature.geometry.coordinates,zoom:Math.min(zoom,17),duration:450});
    } catch(error) {console.warn(error);}
  });
  map.on('click','fsm-points', event => {
    const feature = event.features?.[0];
    if (feature) showSpot(feature, feature.geometry.coordinates.slice());
  });
  for (const layer of ['fsm-clusters','fsm-points']) {
    map.on('mouseenter',layer,()=>{map.getCanvas().style.cursor = 'pointer';});
    map.on('mouseleave',layer,()=>{map.getCanvas().style.cursor = '';});
  }
}
function renderSuggestions() {
  suggestions.replaceChildren();
  const term = search.value.trim().toLocaleLowerCase('de');
  if (term.length < 2) {suggestions.hidden=true;return;}
  const found = spotFeatures.filter(feature => {
    const p=feature.properties;
    return `${p.title} ${p.city}`.toLocaleLowerCase('de').includes(term);
  }).slice(0,7);
  if (!found.length) {suggestions.hidden=true;return;}
  for (const feature of found) {
    const button=document.createElement('button');
    button.type='button';button.setAttribute('role','option');
    button.textContent=feature.properties.title;
    const subtitle=document.createElement('small');subtitle.textContent=feature.properties.city;
    button.appendChild(subtitle);
    button.addEventListener('click', () => {
      const coords=feature.geometry.coordinates;
      search.value=feature.properties.title;
      suggestions.hidden=true;
      map.flyTo({center:coords, zoom:Math.max(12,map.getZoom()),pitch,essential:false});
      showSpot(feature,coords);
    });
    suggestions.appendChild(button);
  }
  suggestions.hidden=false;
}
async function loadSpots() {
  try {
    // Same source of truth as the real app. No favorites, filters or diary data touched.
    const response = await fetch('../../data/spots.json', {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const spots = await response.json();
    if (!Array.isArray(spots)) throw new Error('Spot-Daten haben unerwartetes Format');
    spotFeatures=buildSpotFeatures(spots);
    count.textContent=`${spotFeatures.length} Original-Spots`;
    if (map?.getSource('fsm-spots')) map.getSource('fsm-spots').setData(dataGeoJSON());
  } catch (error) {
    console.warn('Spots not loaded:', error);
    count.textContent='Spot-Daten nicht geladen';
    message('Kartentest verfügbar. Original-Spots konnten nicht geladen werden (Internet/Dateipfad prüfen).');
  }
}
async function start() {
  updatePitchButtons();
  if (typeof maplibregl.Map !== 'function' || (typeof maplibregl.supported === 'function' && !maplibregl.supported())) {
    message('Dieses Gerät bietet hier kein unterstütztes WebGL. Deine normale 2D-Karte bleibt davon unberührt.');
    return;
  }
  try {
    map=new maplibregl.Map({
      container:'map', style:FREE_STYLE, center:LOCATIONS.hannover.center,
      zoom:LOCATIONS.hannover.zoom, pitch, bearing:0,
      maxZoom:18, minZoom:5, maxPitch:75,
      attributionControl:true, antialias:true, cooperativeGestures:false,
      localIdeographFontFamily:'sans-serif'
    });
  } catch(error) {
    console.error(error);
    message('Die Perspektivkarte konnte nicht gestartet werden. Prüfe die Verbindung oder probiere Safari.');
    return;
  }
  map.addControl(new maplibregl.NavigationControl({showCompass:false,showZoom:true}), 'top-left');
  map.on('style.load', attachStyleLayers);
  map.on('load', () => {message('');});
  map.on('error', event => {
    console.warn('MapLibre map error:',event.error);
    if (event.error?.message?.toLowerCase()?.includes('style')) {
      message('Die Kartenkacheln sind gerade nicht verfügbar. Versuche es bei bestehender Internetverbindung erneut.');
    }
  });
  bindInteractions();
  await loadSpots();
}
document.querySelectorAll('[data-pitch]').forEach(button => button.addEventListener('click',()=>setPitch(Number(button.dataset.pitch))));
$('#location-select').addEventListener('change',event => {
  const location=LOCATIONS[event.target.value];
  if (map && location) map.flyTo({...location,pitch,bearing:0,essential:false,duration:900});
});
$('#north').addEventListener('click',()=>map?.easeTo({bearing:0,duration:450}));
search.addEventListener('input',renderSuggestions);
search.addEventListener('keydown',event => {if(event.key==='Escape'){suggestions.hidden=true;search.blur();}});
document.addEventListener('pointerdown',event=>{if(!$('#search-box').contains(event.target)) suggestions.hidden=true;});
start();
