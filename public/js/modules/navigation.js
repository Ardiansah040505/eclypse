// ══════════════════════════════════════════════════════════════════════════
// NAVIGATION - Page Routing
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════ MAIN NAVIGATION ══════════════════
function goTo(page) {
  const currentPage = state.currentPage;

  // Stop video if leaving tahap2
  if (currentPage === 'tahap2' || currentPage === 'home') {
    stopVideo();
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  state.currentPage = page;

  // Simpan halaman aktif ke sessionStorage agar bisa dipulihkan setelah refresh
  if (page !== 'login') {
    try { sessionStorage.setItem('eclypse_page', page); } catch(e) {}
  }

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');

  // Stop video on any page change (safety net)
  stopVideo();

  // Render per page
  if (page === 'tahap1') renderTahap1();
  if (page === 'news-detail') renderNewsDetail();
  if (page === 'tahap2') renderTahap2();
  if (page === 'tahap3') {
    renderTahap3();
    if (state.isAdmin) {
      loadGroupsAndStudents();
    } else {
      loadStudentGroupInfo();
    }
    // Load database questions for both admin and students (with delay to ensure page is rendered)
    setTimeout(() => loadPrepQuestions(), 100);
  }
  if (page === 'tahap4') {
    renderTahap4();
    if (!state.isAdmin) state._visitedTahap4 = true;
  }
  if (page === 'tahap5') {
    renderTahap5();
    renderAdminRecapPanel();
  }
  if (page === 'home' && state.isAdmin) startAdminOnlineRefresh();

  updateProgressBar();
  window.scrollTo(0, 0);
}

// Export goTo function globally
window.goTo = goTo;
