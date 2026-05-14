/* ChemCosmos — navigation */
(function initNav() {
  const pageLabels = {
    home: 'Home', bigbang: 'The Big Bang', stars: 'Stars as Reactors',
    atomic: 'Atomic Models', decay: 'Radioactive Decay',
    matter: 'Matter at Scale', hub: 'AP Chem Hub', citations: 'Citations'
  };

  function goTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sn-item').forEach(a => a.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    if (page) { page.classList.add('active'); page.scrollTop = 0; }
    const nav = document.querySelector(`.sn-item[data-page="${pageId}"]`);
    if (nav) nav.classList.add('active');
    const ind = document.getElementById('mobPageIndicator');
    if (ind) ind.textContent = pageLabels[pageId] || pageId;
    closeMobileMenu();
  }

  document.querySelectorAll('.sn-item[data-page]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); goTo(a.dataset.page); });
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    if (!el.classList.contains('sn-item')) el.addEventListener('click', () => goTo(el.dataset.page));
  });

  const mobBtn = document.getElementById('mobMenu');
  const overlay = document.getElementById('mobOverlay');
  const sidebar = document.getElementById('sidebar');
  function openMobileMenu() { sidebar.classList.add('open'); overlay.classList.add('show'); }
  function closeMobileMenu() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
  window.closeMobileMenu = closeMobileMenu;
  if (mobBtn) mobBtn.addEventListener('click', openMobileMenu);
  if (overlay) overlay.addEventListener('click', closeMobileMenu);

  goTo('home');
})();
