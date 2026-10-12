/* =========================================================
   CONFIGURATION — à remplir par Malek
   ========================================================= */
var CONFIG = {
  // Clé Web3Forms (gratuite) : https://web3forms.com → saisir maleksfeihi@gmail.com → clé reçue par email
  web3formsKey: "",
  // Code GoatCounter (gratuit) : https://www.goatcounter.com/signup → ex. "malek-sfeihi"
  goatcounterCode: ""
};

(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- langue ---------- */
  var langBtn = document.getElementById('langBtn');
  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    langBtn.textContent = l === 'en' ? 'FR' : 'EN';
    store('lang', l);
  }
  setLang(load('lang') || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'));
  langBtn.addEventListener('click', function () {
    setLang(root.getAttribute('data-lang') === 'en' ? 'fr' : 'en');
  });

  /* ---------- thème ---------- */
  var themeBtn = document.getElementById('themeBtn');
  var saved = load('theme');
  if (saved) root.setAttribute('data-theme', saved);
  themeBtn.addEventListener('click', function () {
    var cur = root.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
  });

  /* ---------- nav : bordure au scroll + section active ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) spy.observe(s);
    });

    /* ---------- apparition au scroll ---------- */
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); rev.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- images manquantes : on garde le placeholder pastel ---------- */
  document.querySelectorAll('img[data-ph]').forEach(function (img) {
    function drop() { img.remove(); }
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop);
  });

  /* ---------- compteur de visites anonyme (GoatCounter) ---------- */
  if (CONFIG.goatcounterCode) {
    var gc = document.createElement('script');
    gc.async = true;
    gc.src = 'https://gc.zgo.at/count.js';
    gc.setAttribute('data-goatcounter', 'https://' + CONFIG.goatcounterCode + '.goatcounter.com/count');
    document.head.appendChild(gc);
  }
  function track(name) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, event: true }); } catch (e) {}
  }

  /* ---------- formulaire de contact (👋) ---------- */
  var dialog = document.getElementById('contactDialog');
  var form = document.getElementById('contactForm');
  var status = document.getElementById('contactStatus');
  var fr = function () { return root.getAttribute('data-lang') === 'fr'; };

  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-contact]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        status.textContent = '';
        status.className = 'contact__status';
        dialog.showModal();
        track('contact-open');
      });
    });
    dialog.querySelector('[data-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (ev) { if (ev.target === dialog) dialog.close(); });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = fr() ? 'Merci d\'indiquer votre nom et un email valide.' : 'Please enter your name and a valid email.';
        status.className = 'contact__status is-err';
        return;
      }
      var data = new FormData(form);

      // Pas encore de clé Web3Forms : on ouvre un email pré-rempli à la place
      if (!CONFIG.web3formsKey) {
        var body = (data.get('message') || '') + '\n\n— ' + data.get('name') + ' (' + data.get('email') + ')';
        window.location.href = 'mailto:maleksfeihi@gmail.com?subject=' +
          encodeURIComponent('Portfolio — ' + data.get('name')) + '&body=' + encodeURIComponent(body);
        return;
      }

      data.append('access_key', CONFIG.web3formsKey);
      data.append('subject', 'Portfolio : ' + data.get('name') + ' vous a laissé ses coordonnées');
      data.append('from_name', 'Portfolio Malek Sfeihi');
      var btn = form.querySelector('.contact__send');
      btn.disabled = true;
      status.textContent = fr() ? 'Envoi…' : 'Sending…';
      status.className = 'contact__status';

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.success) throw new Error(res.message);
          form.reset();
          status.textContent = fr() ? 'Merci ! Je vous réponds très vite. 💜' : 'Thank you! I\'ll get back to you soon. 💜';
          status.className = 'contact__status is-ok';
          track('contact-sent');
        })
        .catch(function () {
          status.textContent = fr() ? 'Oups, l\'envoi a échoué. Écrivez-moi directement à maleksfeihi@gmail.com.'
                                    : 'Oops, sending failed. Please email me at maleksfeihi@gmail.com.';
          status.className = 'contact__status is-err';
        })
        .then(function () { btn.disabled = false; });
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
