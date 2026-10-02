// Fam7 Naturals — products page: search + product finder.
(function () {
  var DATA = window.FAM7_PRODUCTS || [];
  var WA = window.FAM7_WA;
  var byId = {};
  DATA.forEach(function (p) { byId[p.id] = p; });

  /* ---------- Search ---------- */
  var q = document.getElementById('q');
  var cards = [].slice.call(document.querySelectorAll('.p-card'));
  var sections = [].slice.call(document.querySelectorAll('.p-section'));
  var none = document.getElementById('noResults');
  function runSearch() {
    var term = q.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var hit = !term || c.getAttribute('data-name').indexOf(term) !== -1;
      c.hidden = !hit;
      if (hit) shown++;
    });
    sections.forEach(function (s) {
      s.hidden = !s.querySelector('.p-card:not([hidden])');
    });
    none.hidden = shown !== 0;
  }
  if (q) q.addEventListener('input', runSearch);

  /* ---------- Finder ---------- */
  var form = document.getElementById('finderForm');
  var result = document.getElementById('finderResult');
  if (!form) return;
  var mode = 'hair';

  form.querySelectorAll('.seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.getAttribute('data-mode');
      form.querySelectorAll('.seg-btn').forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      form.querySelectorAll('.f-group').forEach(function (g) { g.hidden = g.getAttribute('data-for') !== mode; });
      result.hidden = true;
    });
  });

  form.querySelectorAll('.opts').forEach(function (grp) {
    var single = grp.getAttribute('data-name') === 'type';
    grp.addEventListener('click', function (e) {
      var o = e.target.closest('.opt');
      if (!o) return;
      var on = !o.classList.contains('is-on');
      if (single) grp.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('is-on'); });
      o.classList.toggle('is-on', on);
      o.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });

  function picked(name) {
    return [].slice.call(form.querySelectorAll('.opts[data-name="' + name + '"] .opt.is-on')).map(function (o) { return o.getAttribute('data-v'); });
  }

  var LABEL = { dryness: 'dryness', breakage: 'breakage', growth: 'growth', scalp: 'scalp care', tangles: 'tangles', definition: 'definition', heat: 'heat protection', shine: 'shine', cleanse: 'wash day', damage: 'damaged hair', dryskin: 'dry skin', dullskin: 'tone & glow', skincleanse: 'cleansing' };
  var TYPE = { coily: 'kinky / coily hair', curly: 'curly hair', locs: 'locs, twists & braids', relaxed: 'relaxed or processed hair' };

  function score(p, wanted, type) {
    var hits = p.concerns.filter(function (c) { return wanted.indexOf(c) !== -1; });
    if (!hits.length) return null;
    var s = hits.length * 3;
    var typeHit = type && p.types.indexOf(type) !== -1;
    if (typeHit) s += 2;
    // "damage" supports breakage / heat searches
    if (p.concerns.indexOf('damage') !== -1 && (wanted.indexOf('breakage') !== -1 || wanted.indexOf('heat') !== -1)) s += 1;
    return { p: p, s: s, hits: hits, typeHit: typeHit };
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return n ? 'UGX ' + n.toLocaleString('en-US') : 'Ask for price'; }

  function item(r) {
    var p = r.p;
    var img = p.img ? '<img src="assets/products/' + p.img + '.webp" alt="" width="76" height="76">' : '<div class="ph-s"></div>';
    var why = r.hits.map(function (h) { return LABEL[h] || h; }).join(', ');
    var msg = 'Hello Fam7 Naturals, I would like to order: ' + p.name + (p.size ? ' (' + p.size + ')' : '') + (p.price ? ' at UGX ' + p.price.toLocaleString('en-US') : '') + '. Is it available?';
    return '<div class="fr-item">' + img + '<div><strong>' + esc(p.name) + '</strong><span>Helps with ' + esc(why) + '</span><span>' + money(p.price) + '</span>' +
      '<a href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">' + (p.price ? 'Order on WhatsApp' : 'Ask for price on WhatsApp') + '</a></div></div>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var type = mode === 'hair' ? (picked('type')[0] || '') : '';
    var wanted = mode === 'hair' ? picked('concern') : picked('skin');
    if (!wanted.length) {
      result.hidden = false;
      result.innerHTML = '<h3>Pick at least one concern</h3><p>Choose what you would like to fix and we will match products to it.</p>';
      return;
    }
    var scored = DATA.filter(function (p) {
      return mode === 'skin' ? p.cat === 'body-skin' || p.concerns.indexOf('dryskin') !== -1 : true;
    }).map(function (p) { return score(p, wanted, type); }).filter(Boolean);
    if (mode === 'hair') scored = scored.filter(function (r) { return r.p.cat !== 'body-skin'; });
    scored.sort(function (a, b) { return b.s - a.s || (a.p.price === null) - (b.p.price === null); });
    var top = scored.slice(0, 6);
    var intro = mode === 'hair'
      ? 'Matched to ' + (type ? TYPE[type] + ' and ' : '') + wanted.map(function (w) { return LABEL[w]; }).join(', ') + '.'
      : 'Matched to ' + wanted.map(function (w) { return LABEL[w]; }).join(', ') + '.';
    result.hidden = false;
    if (!top.length) {
      result.innerHTML = '<h3>We will help you personally</h3><p>No exact match in the list yet. Message us on WhatsApp and we will recommend the right product.</p>';
      return;
    }
    result.innerHTML = '<h3>Your recommended products</h3><p>' + esc(intro) + '</p><div class="fr-grid">' + top.map(item).join('') + '</div>' +
      '<p class="fr-note">Suggestions are based on each product\'s description. For a personal recommendation, message us on WhatsApp.</p>';
    result.scrollIntoView({ block: 'nearest' });
  });

  document.getElementById('finderReset').addEventListener('click', function () {
    form.querySelectorAll('.opt.is-on').forEach(function (o) { o.classList.remove('is-on'); o.setAttribute('aria-pressed', 'false'); });
    result.hidden = true;
  });
})();
