// ══════════════════════════════════════════════════════════════════════════
// RECAP & TRACKING - Student recap, online tracking, progress
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════ SISTEM REKAP SISWA ══════════════════
function getRecapKey() {
  if (!state.user) return null;
  return (state.user.nis || state.user.id || 'unknown') + '_' + (state.user.sekolah || '-');
}

function loadAllRecap() {
  try {
    const raw = localStorage.getItem('eclypse_recap');
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function saveAllRecap(data) {
  try { localStorage.setItem('eclypse_recap', JSON.stringify(data)); } catch (e) {}
}

function saveStudentRecap(section, data) {
  if (state.isAdmin) return; // jangan catat aktivitas admin sebagai data siswa
  const key = getRecapKey();
  if (!key) return;
  const all = loadAllRecap();
  if (!all[key]) {
    all[key] = {
      nama: state.user.nama || state.user.name || '-',
      nis: state.user.nis || '-',
      sekolah: state.user.sekolah || '-',
      timestamp: new Date().toISOString()
    };
  }
  all[key][section] = data;
  all[key].lastUpdate = new Date().toISOString();
  saveAllRecap(all);
}

async function renderAdminOnlinePanel() {
  const panel = document.getElementById('adminOnlinePanel');
  if (!panel) return;
  if (!state.isAdmin) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  
  try {
    const res = await fetch('/api/students');
    const data = await res.json();
    if (data.success) {
      const list = (data.data || []).filter(s => s.is_online);
      document.getElementById('onlineCountBadge').textContent = `${list.length} online`;
      const container = document.getElementById('onlineListContainer');
      container.innerHTML = list.length
        ? list.map(s => `<span style="background:var(--green-pale);color:var(--green-deep);font-size:0.78rem;font-weight:700;padding:5px 12px;border-radius:99px">🟢 ${s.name} <span style="opacity:0.6;font-weight:600">· ${s.sekolah || '-'}</span></span>`).join('')
        : '<span style="color:var(--gray);font-size:0.85rem">Belum ada siswa yang online.</span>';
    }
  } catch(e) {
    console.error(e);
  }
}

let _adminOnlineRefreshInterval = null;
function startAdminOnlineRefresh() {
  renderAdminOnlinePanel();
  if (_adminOnlineRefreshInterval) clearInterval(_adminOnlineRefreshInterval);
  _adminOnlineRefreshInterval = setInterval(renderAdminOnlinePanel, 10000); // refresh tiap 10 detik
}

function renderAdminRecapPanel() {
  const panel = document.getElementById('adminRecapPanel');
  if (!panel) return;
  if (!state.isAdmin) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  const all = loadAllRecap();
  const totalSiswa = Object.keys(all).length;
  const sekolahSet = new Set(Object.values(all).map(s => s.sekolah));
  const pemantikDone = Object.values(all).filter(s => s.pemantik).length;
  const newsDone = Object.values(all).filter(s => s.climateNews).length;
  document.getElementById('adminRecapSummary').innerHTML =
    `<strong>${totalSiswa}</strong> siswa tercatat dari <strong>${sekolahSet.size}</strong> sekolah · ${newsDone} sudah jawab Climate News · ${pemantikDone} sudah submit Pertanyaan Pemantik`;
}

// ══════════════════ SISTEM TRACKING ONLINE ══════════════════
const ONLINE_TIMEOUT_MS = 60000; // dianggap offline jika tidak update >60 detik
let _heartbeatInterval = null;

function getOnlineKey() {
  if (!state.user) return null;
  return (state.user.nis || state.user.id || state.user.name || 'unknown') + '_' + (state.user.sekolah || '-');
}

function loadOnlineMap() {
  try {
    const raw = localStorage.getItem('eclypse_online');
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function saveOnlineMap(data) {
  try { localStorage.setItem('eclypse_online', JSON.stringify(data)); } catch (e) {}
}

async function sendHeartbeat() {
  if (!state.user || state.isAdmin) return; // hanya track siswa
  const key = getOnlineKey();
  if (key) {
    const map = loadOnlineMap();
    map[key] = {
      nama: state.user.nama || state.user.name || '-',
      sekolah: state.user.sekolah || state.user.school || '-',
      lastSeen: Date.now()
    };
    saveOnlineMap(map);
  }

  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  try {
    const res = await fetch('/api/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
      },
      body: JSON.stringify({ student_id: state.user?.id })
    });
    const data = await res.json();
    if (data.success) {
      state.myGroup = data.group;
      if (state.currentPage === 'tahap3') {
        renderTahap3();
      }
    }
  } catch(e) {
    console.error(e);
  }
}

function getOnlineCount() {
  const map = loadOnlineMap();
  const now = Date.now();
  return Object.values(map).filter(s => (now - s.lastSeen) < ONLINE_TIMEOUT_MS).length;
}

function getOnlineList() {
  const map = loadOnlineMap();
  const now = Date.now();
  return Object.values(map).filter(s => (now - s.lastSeen) < ONLINE_TIMEOUT_MS);
}

function startHeartbeat() {
  sendHeartbeat();
  if (_heartbeatInterval) clearInterval(_heartbeatInterval);
  _heartbeatInterval = setInterval(sendHeartbeat, 15000); // tiap 15 detik
}

function stopHeartbeat() {
  if (_heartbeatInterval) clearInterval(_heartbeatInterval);
  _heartbeatInterval = null;
  // hapus diri dari online map saat logout
  const key = getOnlineKey();
  if (key) {
    const map = loadOnlineMap();
    delete map[key];
    saveOnlineMap(map);
  }
}

// ══════════════════ PROGRESS CALCULATION ══════════════════
function calculateProgress() {
  if (!state.user || state.isAdmin) return 0;
  let stepsDone = 0;
  const totalSteps = 5;

  // Tahap 1: semua berita sudah dijawab (cek dari database progress)
  if (state.newsProgress && Object.keys(state.newsProgress).length > 0) {
    const totalNews = state.news.length;
    let completedNews = 0;
    for (const newsId of Object.keys(state.newsProgress)) {
      if (state.newsProgress[newsId].is_completed) {
        completedNews++;
      }
    }
    if (totalNews > 0 && completedNews >= totalNews) {
      stepsDone++;
    }
  }

  // Tahap 2: paket eco cards sudah selesai dibaca (1 paket saja)
  if (state.tahap2Completed) stepsDone++;

  // Tahap 3: pertanyaan pemantik sudah disubmit
  if (state.pemantikSubmitted) stepsDone++;

  // Tahap 4: sudah pernah membuka halaman argumen
  if (state._visitedTahap4) stepsDone++;

  // Tahap 5: sudah kirim minimal 1 pertanyaan refleksi
  if (state._refleksiRecap && state._refleksiRecap.length > 0) stepsDone++;

  return Math.round((stepsDone / totalSteps) * 100);
}

function updateProgressBar() {
  // Untuk admin, sembunyikan semua progress bar
  if (state.isAdmin) {
    const fill = document.getElementById('progressBarFill');
    const text = document.getElementById('progressPercentText');
    const wrap = document.getElementById('progressWrap');
    if (fill) fill.style.width = '0%';
    if (text) text.textContent = '0%';
    if (wrap) wrap.style.display = 'none';

    const navWrap = document.getElementById('navbarProgressWrap');
    if (navWrap) navWrap.style.display = 'none';
    return;
  }

  const percent = calculateProgress();
  // hero progress bar (Home)
  const fill = document.getElementById('progressBarFill');
  const text = document.getElementById('progressPercentText');
  const wrap = document.getElementById('progressWrap');
  if (fill) fill.style.width = percent + '%';
  if (text) text.textContent = percent + '%';
  if (wrap) wrap.style.display = 'block';
  // navbar mini progress bar
  const navFill = document.getElementById('navbarProgressFill');
  const navText = document.getElementById('navbarProgressText');
  const navWrap = document.getElementById('navbarProgressWrap');
  if (navFill) navFill.style.width = percent + '%';
  if (navText) navText.textContent = percent + '%';
  if (navWrap) navWrap.style.display = state.user ? 'flex' : 'none';
}

// ══════════════════ CSV EXPORT ══════════════════
function downloadRecapCSV() {
  const all = loadAllRecap();
  const keys = Object.keys(all);
  if (keys.length === 0) {
    showToast('⚠️ Belum ada data siswa yang tercatat!');
    return;
  }

  // Kumpulkan semua kemungkinan kolom soal climate news & pemantik secara dinamis
  let maxNewsQuestions = 0;
  let maxPemantikQuestions = 0;
  keys.forEach(k => {
    const s = all[k];
    if (s.climateNews) {
      Object.values(s.climateNews).forEach(n => {
        const c = Object.keys(n.jawaban || {}).length;
        if (c > maxNewsQuestions) maxNewsQuestions = c;
      });
    }
    if (s.pemantik && s.pemantik.jawaban) {
      const c = Object.keys(s.pemantik.jawaban).length;
      if (c > maxPemantikQuestions) maxPemantikQuestions = c;
    }
  });

  const headers = [
    'Nama', 'NIS', 'Sekolah',
    'Paket Eco Cards Dibuka',
    ...Array.from({length: maxPemantikQuestions}, (_, i) => `Pemantik Soal ${i+1}`),
    'Status Pemantik',
    'Jumlah Berita Dijawab',
    'Ringkasan Jawaban Climate News',
    'Jumlah Pertanyaan ke Guru',
    'Pertanyaan ke Guru (gabungan)',
    'Update Terakhir'
  ];

  const rows = keys.map(k => {
    const s = all[k];
    const ecoPacks = s.ecoPacks ? s.ecoPacks.join(' | ') : '';
    const pemantikAnswers = [];
    for (let i = 0; i < maxPemantikQuestions; i++) {
      pemantikAnswers.push(s.pemantik && s.pemantik.jawaban ? (s.pemantik.jawaban[i] || '') : '');
    }
    const pemantikStatus = s.pemantik ? 'Sudah Submit' : 'Belum Submit';
    const newsCount = s.climateNews ? Object.keys(s.climateNews).length : 0;
    const newsSummary = s.climateNews
      ? Object.values(s.climateNews).map(n => `[${n.judul}] ${Object.entries(n.jawaban).map(([qi, ans]) => {
          const q = n.questions[qi];
          if (q && q.type === 'essay') return `Esai: ${ans}`;
          if (q && q.options) return `${q.options[ans]}`;
          return ans;
        }).join('; ')}`).join(' || ')
      : '';
    const refleksiCount = s.refleksi ? s.refleksi.length : 0;
    const refleksiText = s.refleksi ? s.refleksi.join(' | ') : '';

    return [
      s.nama, s.nis, s.sekolah,
      ecoPacks,
      ...pemantikAnswers,
      pemantikStatus,
      newsCount,
      newsSummary,
      refleksiCount,
      refleksiText,
      s.lastUpdate || s.timestamp || ''
    ];
  });

  // escape CSV value
  const escapeCSV = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const csvLines = [headers.map(escapeCSV).join(',')];
  rows.forEach(row => csvLines.push(row.map(escapeCSV).join(',')));
  const csvContent = '﻿' + csvLines.join('\r\n'); // BOM untuk Excel agar baca UTF-8 dgn benar

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Rekap_ECLYPSE_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ Rekap CSV berhasil diunduh!');
}

// Export functions globally
window.downloadRecapCSV = downloadRecapCSV;
window.updateProgressBar = updateProgressBar;
