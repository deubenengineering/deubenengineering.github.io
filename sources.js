/* Shared reference collection: new essays in references.json are included automatically. */
(() => {
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const normalizeTitle = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
 function canonicalURL(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported reference URL');
  const host = url.hostname.toLowerCase().replace(/^www\./,'');
  if (host === 'doi.org' || host === 'dx.doi.org') return 'doi:' + decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g,'').toLowerCase();
  return host + url.pathname.replace(/\/+$/,'');
 }
 function rows(value) {
  if (Array.isArray(value)) {
   if (value.length >= 3 && value.slice(0,3).every(v=>typeof v === 'string')) return [{author:value[0],title:value[1],url:value[2]}];
   return value.flatMap(rows);
  }
  if (value && typeof value === 'object') {
   if (value.author && value.title && value.url) return [value];
   return Object.values(value).flatMap(rows);
  }
  return [];
 }
 function category(row) {
  if (['books','articles','scriptures','other'].includes(row.type)) return row.type;
  const host = new URL(row.url).hostname;
  if (host === 'suttacentral.net') return 'scriptures';
  if (/^(?:dx\.)?doi\.org$/.test(host) || host === 'pmc.ncbi.nlm.nih.gov') return 'articles';
  if (/^(?:www\.)?(?:shambhala\.com|simonandschuster\.com|eckharttolle\.com|readaurelius\.org)$/.test(host)) return 'books';
  return 'other';
 }
 const categories = [['books','Books & collections'],['articles','Journal articles'],['scriptures','Early Buddhist texts'],['other','Other reading']];
 function collect(data) {
  const unique = [], byURL = new Map(), byTitle = new Map();
  for (const row of rows(data)) {
   const url = canonicalURL(row.url), title = normalizeTitle(row.title);
   const existing = byURL.get(url) || byTitle.get(title);
   if (existing) { byURL.set(url,existing); byTitle.set(title,existing); continue; }
   const item = {...row, category:category(row)};
   unique.push(item); byURL.set(url,item); byTitle.set(title,item);
  }
  return unique.sort((a,b)=>a.author.localeCompare(b.author,'en') || a.title.localeCompare(b.title,'en'));
 }
 function render(data) {
  const items = collect(data);
  return categories.map(([id,label])=> {
   const group = items.filter(item=>item.category===id);
   return `<section class="library-section" id="${id}" aria-labelledby="title-${id}"${group.length?'':' hidden'}><h2 id="title-${id}">${label}</h2><ul class="library-list">${group.map(item=>`<li><span class="reference-author">${escape(item.author)}</span><a href="${escape(item.url)}">${escape(item.title)}</a></li>`).join('')}</ul></section>`;
  }).join('');
 }
 globalThis.SourceLibrary = {collect,render,categories};
 if (typeof document !== 'undefined' && location.protocol !== 'file:') {
  fetch('references.json', {cache:'no-cache'}).then(response=> {
   if (!response.ok) throw new Error('References unavailable');
   return response.json();
  }).then(data=> {
   const html = render(data); // Keep the embedded complete list if loading fails.
   if (!html) return;
   document.getElementById('source-list').innerHTML=html;
   const available = new Set(collect(data).map(item=>item.category));
   document.querySelectorAll('.library-categories a').forEach(a=>{a.hidden=!available.has(a.hash.slice(1));});
  }).catch(()=>{});
 }
})();
