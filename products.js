// Fam7 Naturals — products page: hair/skin chooser, search, finder, product details.
(function () {
  var DATA = window.FAM7_PRODUCTS || [];
  var WA = window.FAM7_WA;
  var byId = {};
  DATA.forEach(function (p) { byId[p.id] = p; });
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return n ? 'UGX ' + n.toLocaleString('en-US') : 'Ask for price'; }
  function orderUrl(p) {
    var msg = 'Hello Fam7 Naturals, I would like to order: ' + p.name + (p.size ? ' (' + p.size + ')' : '') + (p.price ? ' at UGX ' + p.price.toLocaleString('en-US') : '') + '. Is it available?';
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  var group = 'hair';
  var q = $('#q'), none = $('#noResults');
  var form = $('#finderForm'), result = $('#finderResult');

  /* ---------- Hair / Skin chooser ---------- */
  function setGroup(g, keepSearch) {
    group = g;
    $$('.choice').forEach(function (b) {
      var on = b.getAttribute('data-group') === g;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('#catScroll a').forEach(function (a) { a.hidden = a.getAttribute('data-group') !== g; });
    $$('.f-group').forEach(function (x) { x.hidden = x.getAttribute('data-for') !== g; });
    $('#finderWord').textContent = g === 'hair' ? 'hair.' : 'skin.';
    q.placeholder = g === 'hair' ? 'Search hair products' : 'Search body & skin products';
    result.hidden = true;
    if (!keepSearch) q.value = '';
    runSearch();
  }
  $$('.choice').forEach(function (b) {
    b.addEventListener('click', function () { setGroup(b.getAttribute('data-group')); });
  });

  /* ---------- Search (within the chosen group) ---------- */
  function runSearch() {
    var term = q.value.trim().toLowerCase();
    var shown = 0;
    $$('.p-section').forEach(function (s) {
      var inGroup = s.getAttribute('data-group') === group;
      var any = 0;
      $$('.p-card', s).forEach(function (c) {
        var hit = !term || c.getAttribute('data-name').indexOf(term) !== -1;
        c.hidden = !hit;
        if (hit) any++;
      });
      s.hidden = !inGroup || !any;
      if (inGroup) shown += any;
    });
    if (shown) { none.hidden = true; return; }
    var other = group === 'hair' ? 'skin' : 'hair';
    var otherHits = 0;
    $$('.p-section[data-group="' + other + '"] .p-card').forEach(function (c) { if (c.getAttribute('data-name').indexOf(term) !== -1) otherHits++; });
    none.hidden = false;
    none.innerHTML = 'No ' + (group === 'hair' ? 'hair' : 'body & skin') + ' products match your search.' +
      (otherHits ? ' <button type="button" class="link-btn" id="switchGroup">See ' + otherHits + ' in ' + (other === 'hair' ? 'Hair Products' : 'Body &amp; Skin Products') + '</button>' : ' Try another word, or <a href="https://wa.me/' + WA + '" target="_blank" rel="noopener">ask us on WhatsApp</a>.');
    var sw = $('#switchGroup');
    if (sw) sw.addEventListener('click', function () { setGroup(other, true); });
  }
  q.addEventListener('input', runSearch);

  /* ---------- Open from a link hash (#hair, #skin, #hair-oils ...) ---------- */
  function fromHash() {
    var h = decodeURIComponent(location.hash.replace('#', ''));
    if (!h) return;
    if (h === 'hair' || h === 'skin') { setGroup(h); $('#catalog').scrollIntoView(); return; }
    var el = document.getElementById(h);
    if (el && el.getAttribute('data-group')) { setGroup(el.getAttribute('data-group')); el.scrollIntoView(); }
    else if (h === 'finder') { $('#finder').scrollIntoView(); }
  }
  window.addEventListener('hashchange', fromHash);

  /* ---------- Product details dialog ---------- */
  var dlg = $('#pm');
  var LABEL = { dryness: 'Dryness', breakage: 'Breakage', growth: 'Hair growth', scalp: 'Scalp care', tangles: 'Tangles', definition: 'Curl definition', heat: 'Heat protection', shine: 'Shine', cleanse: 'Wash day', damage: 'Damaged hair', dryskin: 'Dry skin', dullskin: 'Glow & even tone', skincleanse: 'Everyday cleansing' };
  var TYPE = { coily: 'Kinky / coily hair', curly: 'Curly hair', locs: 'Locs, twists & braids', relaxed: 'Relaxed / processed hair' };
  function li(t) { return '<li>' + esc(t) + '</li>'; }
  function openProduct(id) {
    var p = byId[id]; if (!p) return;
    $('#pmMedia').innerHTML = p.img ? '<img src="assets/products/' + p.img + '.webp" alt="' + esc(p.name) + '" width="640" height="640">' : '<div class="ph"><img src="logo.png" alt="" width="110" height="52"><span>Photo coming soon</span></div>';
    $('#pmFor').textContent = p.fr === 'both' ? 'Hair & Skin' : p.fr === 'skin' ? 'Body & Skin' : 'Hair care';
    $('#pmTitle').textContent = p.name;
    $('#pmSize').textContent = p.size || '';
    $('#pmSize').hidden = !p.size;
    $('#pmPrice').textContent = money(p.price);
    $('#pmDesc').textContent = p.desc;
    $('#pmBen').innerHTML = p.benefits.map(li).join('');
    $('#pmIng').innerHTML = p.ingredients.map(li).join('');
    $('#pmIngWrap').hidden = !p.ingredients.length;
    var suit = p.types.map(function (t) { return TYPE[t]; }).concat(p.concerns.map(function (c) { return LABEL[c]; })).filter(Boolean);
    $('#pmSuit').innerHTML = suit.map(li).join('');
    $('#pmHow').textContent = p.how;
    var o = $('#pmOrder');
    o.href = orderUrl(p);
    o.textContent = p.price ? 'Order on WhatsApp' : 'Ask for price on WhatsApp';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    $('.pm-in', dlg).scrollTop = 0;
    document.documentElement.classList.add('lock');
  }
  function closeProduct() {
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    document.documentElement.classList.remove('lock');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open]');
    if (t) { openProduct(t.getAttribute('data-open')); }
  });
  $('#pmClose').addEventListener('click', closeProduct);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeProduct(); });
  dlg.addEventListener('close', function () { document.documentElement.classList.remove('lock'); });

  /* ---------- Finder ---------- */
  function picked(name) {
    return $$('.opts[data-name="' + name + '"] .opt.is-on', form).map(function (o) { return o.getAttribute('data-v'); });
  }
  $$('.opts', form).forEach(function (grp) {
    var single = grp.getAttribute('data-name') === 'type';
    grp.addEventListener('click', function (e) {
      var o = e.target.closest('.opt'); if (!o) return;
      var on = !o.classList.contains('is-on');
      if (single) $$('.opt', grp).forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
      o.classList.toggle('is-on', on);
      o.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });
  var FL = { dryness: 'dryness', breakage: 'breakage', growth: 'growth', scalp: 'scalp care', tangles: 'tangles', definition: 'definition', heat: 'heat protection', shine: 'shine', cleanse: 'wash day', damage: 'damaged hair', dryskin: 'dry skin', dullskin: 'tone & glow', skincleanse: 'cleansing' };
  function score(p, wanted, type) {
    var hits = p.concerns.filter(function (c) { return wanted.indexOf(c) !== -1; });
    if (!hits.length) return null;
    var s = hits.length * 3;
    var typeHit = type && p.types.indexOf(type) !== -1;
    if (typeHit) s += 2;
    if (p.concerns.indexOf('damage') !== -1 && (wanted.indexOf('breakage') !== -1 || wanted.indexOf('heat') !== -1)) s += 1;
    return { p: p, s: s, hits: hits };
  }
  function item(r) {
    var p = r.p;
    var img = p.img ? '<img src="assets/products/' + p.img + '.webp" alt="" width="76" height="76">' : '<div class="ph-s"></div>';
    var why = r.hits.map(function (h) { return FL[h] || h; }).join(', ');
    return '<div class="fr-item">' + img + '<div><strong>' + esc(p.name) + '</strong><span>Helps with ' + esc(why) + '</span><span>' + money(p.price) + '</span>' +
      '<button type="button" class="fr-link" data-open="' + p.id + '">View details</button> <a href="' + orderUrl(p) + '" target="_blank" rel="noopener">' + (p.price ? 'Order' : 'Ask price') + '</a></div></div>';
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var type = group === 'hair' ? (picked('type')[0] || '') : '';
    var wanted = group === 'hair' ? picked('concern') : picked('skin');
    result.hidden = false;
    if (!wanted.length) { result.innerHTML = '<h3>Pick at least one concern</h3><p>Choose what you would like to fix and we will match products to it.</p>'; return; }
    var scored = DATA.filter(function (p) { return p.cats.some(function (c) { return c.indexOf(group) === 0; }); })
      .map(function (p) { return score(p, wanted, type); }).filter(Boolean);
    scored.sort(function (a, b) { return b.s - a.s || (a.p.price === null) - (b.p.price === null); });
    var top = scored.slice(0, 6);
    if (!top.length) { result.innerHTML = '<h3>We will help you personally</h3><p>No exact match in the list yet. Message us on WhatsApp and we will recommend the right product.</p>'; return; }
    var intro = 'Matched to ' + (type ? { coily: 'kinky / coily hair', curly: 'curly hair', locs: 'locs, twists & braids', relaxed: 'relaxed or processed hair' }[type] + ' and ' : '') + wanted.map(function (w) { return FL[w]; }).join(', ') + '.';
    result.innerHTML = '<h3>Your recommended products</h3><p>' + esc(intro) + '</p><div class="fr-grid">' + top.map(item).join('') + '</div>' +
      '<p class="fr-note">Suggestions are based on each product\'s description. For a personal recommendation, message us on WhatsApp.</p>';
    result.scrollIntoView({ block: 'nearest' });
  });
  $('#finderReset').addEventListener('click', function () {
    $$('.opt.is-on', form).forEach(function (o) { o.classList.remove('is-on'); o.setAttribute('aria-pressed', 'false'); });
    result.hidden = true;
  });

  setGroup('hair');
  fromHash();
})();
