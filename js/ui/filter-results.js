// UI copy only: counts always come from the same filtered collection as list and map.
export function resultsCopy(count, lang='de', status='ready') {
 const n=Number.isFinite(count)?Math.max(0,Math.floor(count)):0;
 const table={
 de:{action:`${n} ${n===1?'Spot':'Spots'} ansehen`,summary:n===1?'1 passender Spot':`${n} passende Spots`,loading:'Spots werden geladen …',error:'Spots konnten nicht geladen werden'},
 en:{action:`View ${n} ${n===1?'spot':'spots'}`,summary:`${n} matching ${n===1?'spot':'spots'}`,loading:'Loading spots …',error:'Could not load spots'},
 da:{action:`Vis ${n} ${n===1?'spot':'spots'}`,summary:`${n} matchende ${n===1?'spot':'spots'}`,loading:'Indlæser spots …',error:'Spots kunne ikke indlæses'}
 };
 const value=table[lang]||table.de;
 return {action:status==='loading'||status==='idle'?value.loading:value.action,summary:status==='error'?value.error:status==='loading'||status==='idle'?value.loading:value.summary,disabled:status==='loading'||status==='idle'};
}
