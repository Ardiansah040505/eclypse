// ══════════════════ STATE ══════════════════
// ══════════════════ SISTEM REKAP SISWA (untuk export CSV admin) ══════════════════
// Disimpan terpisah dari state utama (per-session) di localStorage browser
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

// ══════════════════ SISTEM TRACKING ONLINE (localStorage heartbeat) ══════════════════
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
      }
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

function calculateProgress() {
  if (!state.user || state.isAdmin) return 0;
  let stepsDone = 0;
  const totalSteps = 5;

  // Tahap 1: semua berita sudah dijawab
  const totalNews = state.news.length;
  const answeredNews = Object.keys(state.answers || {}).length;
  if (totalNews > 0 && answeredNews >= totalNews) stepsDone++;

  // Tahap 2: semua paket eco cards sudah dibuka (3 paket)
  const openedCount = Object.keys(state.openedPacks || {}).length;
  if (openedCount >= 3) stepsDone++;

  // Tahap 3: pertanyaan pemantik sudah disubmit
  if (state.pemantikSubmitted) stepsDone++;

  // Tahap 4: sudah pernah membuka halaman argumen (dianggap selesai jika sudah dikunjungi)
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

function downloadRecapCSV() {
  const all = loadAllRecap();
  const keys = Object.keys(all);
  if (keys.length === 0) {
    showToast('⚠️ Belum ada data siswa yang tercatat!');
    return;
  }

  // Kumpulkan semua kemungkinan kolom soal climate news & pemantik secara dinamis
  // supaya CSV konsisten walau jumlah soal beda-beda
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
  const csvContent = '\uFEFF' + csvLines.join('\r\n'); // BOM untuk Excel agar baca UTF-8 dgn benar

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

const state = {
  user: null,
  isAdmin: false,
  currentPage: 'login',
  selectedNewsIndex: null,
  answers: {},
  news: [
    {
      title: "Suhu Bumi Meningkat 1,2°C Dibanding Era Pra-Industri",
      body: "Badan Meteorologi Dunia (WMO) melaporkan bahwa suhu rata-rata global tahun 2024 telah meningkat 1,2°C dibandingkan era pra-industri (sebelum 1850). Peningkatan ini membawa dampak serius: gelombang panas ekstrem, naiknya permukaan laut, dan pola cuaca yang semakin tidak terduga. Para ilmuwan memperingatkan bahwa tanpa tindakan segera, kita berisiko melampaui batas 1,5°C yang ditetapkan dalam Perjanjian Paris pada tahun 2030.",
      tag: "Suhu Global",
      questions: [{ text: "Apa kaitan efek rumah kaca dengan kenaikan suhu rata-rata bumi?", options: ["Gas rumah kaca memerangkap panas di atmosfer", "Awan menghilangkan seluruh panas matahari", "Bumi berhenti menerima sinar matahari", "Laut mengubah semua panas menjadi es"], answer: 0 }]
    },
    {
      title: "Indonesia Hadapi Ancaman Tenggelam di 5 Kota Pesisir",
      body: "Penelitian terbaru menunjukkan bahwa Jakarta, Semarang, Surabaya, Medan, dan Makassar menghadapi ancaman banjir rob dan tenggelam akibat kombinasi penurunan tanah dan naiknya permukaan laut. Di Jakarta, tanah di beberapa titik turun hingga 25 cm per tahun, sementara permukaan laut Jawa naik rata-rata 4-7 mm per tahun. Pemerintah telah mulai memindahkan Ibu Kota ke Nusantara sebagai salah satu langkah adaptasi.",
      tag: "Dampak Lokal",
      questions: [{ text: "Apa salah satu penyebab kota pesisir semakin rentan terhadap banjir rob?", options: ["Penurunan tanah dan kenaikan muka laut", "Berkurangnya jumlah gedung", "Suhu malam yang lebih rendah", "Angin darat yang berhenti"], answer: 0 }]
    }
  ],
  videoUrl: '',
  videoDesc: '🌿 <strong>Judul video:</strong> Krisis Iklim — Mengapa Kita Harus Peduli?',
  ecoCards: [
    // ── AKTIVIS LINGKUNGAN (6 kartu) ──
    {
      type:'aktivis', icon:'🗑️', badge:'Aktivis Lingkungan',
      title:'Sampah Plastik di Indonesia & Malang',
      desc:'Data pengelolaan sampah nasional menunjukkan bahwa sampah plastik menyumbang sekitar 19% dari total timbulan sampah di Indonesia. Artinya, dari seluruh sampah yang dihasilkan masyarakat, hampir seperlimanya berupa plastik. Di Kota Malang sendiri, sampah plastik menyumbang sekitar 16% dari 731 ton sampah harian, atau lebih dari 106 ton plastik setiap harinya.<br><br><em>Sumber: SIPSN KLHK (2024); DLH Kota Malang (2025)</em>'
    },
    {
      type:'aktivis', icon:'🌊', badge:'Aktivis Lingkungan',
      title:'Plastik Mengancam Lautan',
      desc:'Menurut laporan UNEP, sekitar 11 juta ton sampah plastik masuk ke ekosistem laut setiap tahun. Jika tidak ada perubahan kebijakan dan perilaku masyarakat, jumlah tersebut diperkirakan hampir tiga kali lipat pada tahun 2040. Sampah plastik yang masuk ke laut dapat membahayakan berbagai organisme laut dan mengganggu keseimbangan ekosistem.<br><br><em>Sumber: UNEP (2023). Turning Off the Tap.</em>'
    },
    {
      type:'aktivis', icon:'⏳', badge:'Aktivis Lingkungan',
      title:'Plastik Butuh Ratusan Tahun untuk Terurai',
      desc:'Berbagai jenis plastik membutuhkan waktu sangat lama untuk terurai di lingkungan. Kantong plastik membutuhkan 10–20 tahun, sedotan plastik sekitar 200 tahun, dan botol plastik hingga 450 tahun. Styrofoam bahkan diperkirakan membutuhkan hingga 500 tahun untuk terurai sepenuhnya.<br><br><em>Sumber: UNEP, Single-Use Plastics: A Roadmap for Sustainability.</em>'
    },
    {
      type:'aktivis', icon:'📈', badge:'Aktivis Lingkungan',
      title:'Produksi Plastik Global Terus Melonjak',
      desc:'Laporan OECD menunjukkan bahwa produksi plastik global meningkat dari sekitar 234 juta ton pada tahun 2000 menjadi 460 juta ton pada tahun 2019 — lebih dari dua kali lipat dalam 19 tahun. OECD memproyeksikan produksi plastik global akan mencapai 1.231 juta ton pada tahun 2060 jika tidak ada intervensi kebijakan yang signifikan.<br><br><em>Sumber: OECD, Global Plastics Outlook.</em>'
    },
    {
      type:'aktivis', icon:'🏭', badge:'Aktivis Lingkungan',
      title:'Plastik & Emisi Gas Rumah Kaca',
      desc:'Menurut laporan OECD, seluruh siklus hidup plastik menghasilkan sekitar 1,8 miliar ton emisi gas rumah kaca pada tahun 2019 dan menyumbang sekitar 3,4% emisi gas rumah kaca global. Sekitar 90% emisi tersebut berasal dari proses produksi dan pengolahan plastik yang menggunakan bahan bakar fosil.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook.</em>'
    },
    {
      type:'aktivis', icon:'🐢', badge:'Aktivis Lingkungan',
      title:'Dampak Plastik pada Satwa Laut',
      desc:'Menurut WWF, hampir 88% spesies laut di dunia sudah terdampak oleh pencemaran plastik yang parah di lautan. Banyak hewan laut seperti penyu, lumba-lumba, dan burung laut menelan plastik karena mengira plastik adalah makanan mereka. Bahkan, 25% spesies ikan laut yang kita konsumsi sehari-hari sudah mengandung partikel mikroplastik di tubuhnya.<br><br><em>Sumber: WWF (2022). Impacts of plastic pollution on biodiversity.</em>'
    },

    // ── PEDAGANG (7 kartu) ──
    {
      type:'pedagang', icon:'💰', badge:'Pedagang',
      title:'Harga Plastik vs Kemasan Ramah Lingkungan',
      desc:'Kantong plastik belanja dapat diperoleh dengan kisaran harga sekitar Rp100–Rp300 per lembar, sedangkan paper bag dengan ukuran yang setara berkisar antara Rp500–Rp2.000 per lembar, tergantung ukuran, ketebalan, dan kualitas bahan. Perbedaan harga ini sangat terasa bagi pedagang kecil yang melayani ratusan pembeli per hari.<br><br><em>Sumber: INAPLAS (2024); Survei harga kemasan marketplace Indonesia 2024–2025.</em>'
    },
    {
      type:'pedagang', icon:'📦', badge:'Pedagang',
      title:'Keunggulan Plastik yang Belum Tergantikan',
      desc:'Kemasan plastik menjadi pilihan utama pelaku usaha karena memiliki kombinasi keunggulan yang belum sepenuhnya tergantikan: harga murah, ringan, tahan air, fleksibel, dan mampu melindungi produk dari kerusakan. Menurut UNEP (2018), karakteristik inilah yang menjadikan plastik sebagai material kemasan paling dominan di dunia, terutama untuk produk makanan dan minuman.<br><br><em>Sumber: UNEP (2018). Single-Use Plastics: A Roadmap for Sustainability.</em>'
    },
    {
      type:'pedagang', icon:'📊', badge:'Pedagang',
      title:'Kemasan sebagai Biaya Produksi UMKM',
      desc:'Dalam kegiatan usaha, kemasan bukan hanya berfungsi untuk membungkus produk tetapi juga menjadi bagian dari biaya produksi yang harus diperhitungkan. Bagi usaha mikro dan kecil, peningkatan biaya kemasan dapat memengaruhi keuntungan yang diperoleh. Oleh karena itu, pelaku usaha cenderung memilih kemasan yang mampu melindungi produk dengan biaya yang terjangkau agar harga jual tetap dapat diterima oleh konsumen.<br><br><em>Sumber: Kementerian Perindustrian RI (2022). Analisis Perkembangan Industri Kemasan Indonesia.</em>'
    },
    {
      type:'pedagang', icon:'🛍️', badge:'Pedagang',
      title:'Konsumen & Sensitivitas Harga',
      desc:'Berbagai penelitian mengenai perilaku konsumen menunjukkan bahwa harga merupakan salah satu faktor utama yang memengaruhi keputusan pembelian. Banyak konsumen mendukung penggunaan kemasan ramah lingkungan, namun sebagian masih mempertimbangkan harga produk yang harus dibayar. Jika biaya kemasan meningkat, harga jual produk juga berpotensi meningkat sehingga dapat memengaruhi minat pembeli.<br><br><em>Sumber: Prakash, G., et al. (2019). Journal of Cleaner Production.</em>'
    },
    {
      type:'pedagang', icon:'🏪', badge:'Pedagang',
      title:'65 Juta UMKM Bergantung pada Plastik',
      desc:'Berdasarkan data Kementerian Koperasi dan UKM (2023), terdapat lebih dari 65 juta UMKM di Indonesia yang sebagian besar masih mengandalkan kemasan plastik dalam operasional harian mereka. Beban biaya kemasan ramah lingkungan yang lebih tinggi berpotensi mengancam keberlangsungan usaha mikro yang marginnya sudah sangat tipis.<br><br><em>Sumber: Kementerian Koperasi dan UKM RI (2023).</em>'
    },
    {
      type:'pedagang', icon:'🚧', badge:'Pedagang',
      title:'Tantangan Ketersediaan Kemasan Alternatif',
      desc:'Meskipun penggunaan kemasan ramah lingkungan terus berkembang, penerapannya masih menghadapi berbagai tantangan. Beberapa alternatif kemasan memiliki harga yang lebih tinggi, ketersediaan yang belum merata, serta memerlukan penyesuaian dalam proses produksi dan distribusi. Di Indonesia, ketersediaan kemasan alternatif yang terjangkau masih sangat terbatas, terutama di luar kota besar, sehingga pedagang kecil di daerah seperti Malang belum memiliki banyak pilihan yang realistis.<br><br><em>Sumber: UNEP (2023). Turning off the Tap.</em>'
    },
    {
      type:'pedagang', icon:'📋', badge:'Pedagang',
      title:'Kebijakan Plastik & Masa Transisi UMKM',
      desc:'Berbagai negara dan daerah mulai menerapkan kebijakan pengurangan plastik sekali pakai. Namun, pelaksanaan kebijakan tersebut sering kali memerlukan masa transisi bagi pelaku usaha, terutama UMKM. Di Kota Malang, rencana Perda pembatasan plastik yang ditargetkan pada 2026 belum disertai program pendampingan resmi bagi pedagang kecil untuk beralih ke kemasan alternatif.<br><br><em>Sumber: UNEP (2023); DPRD Kota Malang dalam JatimTimes, Agustus 2025.</em>'
    },

    // ── PENELITI (7 kartu) ──
    {
      type:'peneliti', icon:'🔮', badge:'Peneliti',
      title:'Proyeksi Produksi Plastik 2060',
      desc:'OECD (2022) memproyeksikan bahwa tanpa perubahan kebijakan yang signifikan, produksi plastik global dapat mencapai 1.231 juta ton pada tahun 2060 — hampir tiga kali lipat dari produksi tahun 2019. Pada skenario yang sama, sampah plastik yang bocor ke lingkungan diperkirakan akan meningkat dua kali lipat.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook. OECD Publishing.</em>'
    },
    {
      type:'peneliti', icon:'🌡️', badge:'Peneliti',
      title:'Plastik & Emisi Karbon: Data Ilmiah',
      desc:'Berdasarkan laporan OECD, seluruh siklus hidup plastik menghasilkan sekitar 1,8 miliar ton emisi gas rumah kaca pada tahun 2019, atau setara dengan 3,4% emisi gas rumah kaca global. Sekitar 90% emisi tersebut berasal dari proses produksi dan konversi plastik berbahan bakar fosil. Temuan ini menunjukkan bahwa permasalahan plastik tidak hanya berkaitan dengan limbah, tetapi juga berkaitan langsung dengan perubahan iklim.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook.</em>'
    },
    {
      type:'peneliti', icon:'♻️', badge:'Peneliti',
      title:'Nasib Plastik: Hanya 9% yang Didaur Ulang',
      desc:'Studi yang diterbitkan dalam jurnal Science (2017) memperkirakan bahwa dari seluruh plastik yang pernah diproduksi sejak 1950 hingga 2015 — totalnya sekitar 8,3 miliar ton — hanya 9% yang berhasil didaur ulang, 12% dibakar, dan sisanya 79% menumpuk di tempat pembuangan akhir atau mencemari lingkungan.<br><br><em>Sumber: Geyer, R., Jambeck, J. R., & Law, K. L. (2017). Science Advances, 3(7), e1700782.</em>'
    },
    {
      type:'peneliti', icon:'🩸', badge:'Peneliti',
      title:'Mikroplastik Ditemukan dalam Darah Manusia',
      desc:'Penelitian yang dipublikasikan dalam jurnal Environment International melaporkan bahwa partikel mikroplastik ditemukan pada 17 dari 22 sampel darah manusia (sekitar 77%) yang dianalisis. Di Kota Malang, penelitian InfoMalang (Juli 2025) juga mengonfirmasi bahwa mikroplastik telah ditemukan di Sungai Brantas dengan konsentrasi 31 partikel per 10 liter air di sekitar Jembatan Muharto.<br><br><em>Sumber: Leslie, H. A., et al. (2022). Environment International, 163, 107199.</em>'
    },
    {
      type:'peneliti', icon:'🌊', badge:'Peneliti',
      title:'Skala Plastik di Perairan Global',
      desc:'OECD memperkirakan bahwa pada tahun 2019 sekitar 6,1 juta ton sampah plastik masuk ke lingkungan perairan, dan sekitar 1,7 juta ton di antaranya mencapai lautan. Total akumulasi plastik di lingkungan perairan diperkirakan telah mencapai 139 juta ton. Untuk membayangkan skalanya: 1,7 juta ton setara dengan membuang satu truk sampah plastik ke laut setiap menitnya.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook.</em>'
    },
    {
      type:'peneliti', icon:'🌱', badge:'Peneliti',
      title:'Mikroplastik Merusak Kemampuan Tanah Menyerap Karbon',
      desc:'Penelitian dalam jurnal Environmental Science & Technology menunjukkan bahwa akumulasi mikroplastik di tanah dapat mengubah struktur tanah, aktivitas mikroorganisme, serta proses dekomposisi bahan organik. Perubahan tersebut berpotensi mengganggu kemampuan tanah dalam menyimpan karbon (carbon sequestration) — salah satu mekanisme penting untuk mengurangi CO₂ di atmosfer.<br><br><em>Sumber: de Souza Machado, A. A., et al. (2019). Environmental Science & Technology, 53(10), 6044–6052.</em>'
    },
    {
      type:'peneliti', icon:'💨', badge:'Peneliti',
      title:'Emisi Plastik Bisa Capai 56 Gigaton CO₂ pada 2050',
      desc:'Penelitian dalam jurnal Nature Climate Change memperkirakan bahwa apabila produksi dan konsumsi plastik terus meningkat tanpa perubahan signifikan, emisi gas rumah kaca dari industri plastik diperkirakan dapat mencapai lebih dari 56 gigaton CO₂ ekuivalen secara kumulatif pada tahun 2050 — setara dengan sekitar 10–13% dari sisa anggaran karbon global untuk membatasi pemanasan bumi pada target 1,5°C.<br><br><em>Sumber: Zheng, J., & Suh, S. (2019). Nature Climate Change, 9(5), 374–378.</em>'
    }
  ],
  arguments: [],
  comments: [],
  onlineStudents: [
    { id:'rafi', name:'Rafi Pratama' }, { id:'dian', name:'Dian Anggraeni' },
    { id:'sari', name:'Sari Dewi' }, { id:'budi', name:'Budi Santoso' },
    { id:'aldi', name:'Aldi Prasetyo' }, { id:'nina', name:'Nina Lestari' },
    { id:'farhan', name:'Farhan Akbar' }, { id:'putri', name:'Putri Maharani' }
  ],
  groups: [
    { id:'hijau', name:'Kelompok Hijau', icon:'🌿', side:'Pro', members:['rafi','dian','sari','budi'] },
    { id:'merah', name:'Kelompok Merah', icon:'⚡', side:'Kontra', members:['aldi','nina','farhan','putri'] }
  ],
  teamButtons: { pro: [true, true, true, true, true], con: [true, true, true, true, true] },
  registeredUsers: {}  // auto-populated saat siswa login
};

const users = {
  'siswa': { password: '1234', name: 'Siswa', role: 'siswa' },
  'admin': { password: 'admin123', name: 'Guru / Admin', role: 'admin' },
  'rafi': { password: '1234', name: 'Rafi Pratama', role: 'siswa' },
  'dian': { password: '1234', name: 'Dian Anggraeni', role: 'siswa' },
};

// ══════════════════ NAVIGATION ══════════════════
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  state.currentPage = page;
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
  // render per page
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
  }
  if (page === 'tahap4') { renderTahap4(); if (!state.isAdmin) state._visitedTahap4 = true; }
  if (page === 'tahap5') { renderTahap5(); renderAdminRecapPanel(); }
  if (page === 'home' && state.isAdmin) startAdminOnlineRefresh();
  updateProgressBar();
  window.scrollTo(0, 0);
}

// ══════════════════ TAHAP 1 ══════════════════
function renderTahap1() {
  // Admin bar
  document.getElementById('adminBar1').style.display = state.isAdmin ? 'block' : 'none';
  // News
  const nc = document.getElementById('newsContainer');
  nc.innerHTML = state.news.map((n, i) => `
    <div class="news-card">
      ${n.image ? `<img src="${n.image}" class="news-card-image" alt="${n.title}" onerror="this.style.display='none'">` : ''}
      <div class="news-tag">📰 ${n.tag}</div>
      <h3>${n.title}</h3>
      <p>${(n.body || '').substring(0,180)}...</p>
      <div class="news-card-actions">
        ${state.isAdmin ? `<button class="btn-sm yellow" onclick="openNewsEditor(${i})">✏️ Edit</button><button class="btn-sm" style="background:#d9534f;color:white" onclick="deleteNews(${i})">🗑 Hapus</button>` : ''}
        <button class="btn-sm green" onclick="openNews(${i})">Baca Berita & Jawab →</button>
      </div>
    </div>
  `).join('');
}

function openNews(index) {
  state.selectedNewsIndex = index;
  goTo('news-detail');
}

function renderNewsDetail() {
  const n = state.news[state.selectedNewsIndex];
  if (!n) { goTo('tahap1'); return; }
  const questions = n.questions || [];
  const saved = state.answers[state.selectedNewsIndex] || {};

  const mcQuestions = questions.filter(q => !q.type || q.type === 'mc');
  const essayQuestions = questions.filter(q => q.type === 'essay');

  const mcHtml = mcQuestions.map((q, qi) => {
    const globalIdx = questions.indexOf(q);
    return `
      <div class="question-text">${qi + 1}. ${q.text}</div>
      <div class="multiple-choice">${q.options.map((option, oi) => `
        <label class="choice-option"><input type="radio" name="news-question-${globalIdx}" value="${oi}" ${saved[globalIdx] === oi ? 'checked' : ''}><span class="choice-letter">${'ABCD'[oi]}</span><span>${option}</span></label>
      `).join('')}</div>`;
  }).join('');

  const essayHtml = essayQuestions.map((q, ei) => {
    const globalIdx = questions.indexOf(q);
    const savedEssay = saved[globalIdx] || '';
    return `
      <div class="question-text">${mcQuestions.length + ei + 1}. ${q.text}</div>
      <textarea
        class="essay-answer-input"
        placeholder="Tuliskan jawabanmu di sini..."
        rows="4"
        data-qidx="${globalIdx}"
        style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.7rem 1rem;font-family:'Nunito',sans-serif;font-size:0.88rem;resize:vertical;box-sizing:border-box;margin-bottom:0.75rem;transition:border 0.18s"
        onfocus="this.style.borderColor='var(--green)'"
        onblur="this.style.borderColor='var(--green-pale)'"
      >${savedEssay}</textarea>`;
  }).join('');

  const hasMC = mcQuestions.length > 0;
  const hasEssay = essayQuestions.length > 0;

  let questionHtml = '';
  if (hasMC) questionHtml += `<div class="question-counter">SOAL PILIHAN GANDA · ${mcQuestions.length} SOAL</div>${mcHtml}`;
  if (hasEssay) questionHtml += `<div class="question-counter" style="margin-top:${hasMC?'1.25rem':'0'}">SOAL ESAI · ${essayQuestions.length} SOAL</div>${essayHtml}`;

  document.getElementById('newsDetailContainer').innerHTML = `
    <button class="back-link" onclick="goTo('tahap1')">← Kembali ke daftar berita</button>
    <article class="news-detail">
      ${n.image ? `<img src="${n.image}" class="news-detail-image" alt="${n.title}" onerror="this.style.display='none'">` : ''}
      <div class="news-tag">📰 ${n.tag}</div><h2>${n.title}</h2>
      <p class="news-body">${n.body}</p>
      <div class="question-block">
        ${questions.length ? questionHtml : '<div class="question-text">Admin belum menambahkan soal untuk berita ini.</div>'}
        ${state.isAdmin ? `<button class="btn-sm yellow" onclick="openNewsEditor(${state.selectedNewsIndex})">✏️ Kelola Berita & Soal</button>` : ''}
        ${questions.length ? `<br><button class="btn-next" onclick="saveNewsAnswer()">Simpan Jawaban ✓</button>` : ''}
      </div>
    </article>`;
}

function saveNewsAnswer() {
  const questions = state.news[state.selectedNewsIndex].questions || [];
  const answers = {};
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.type || q.type === 'mc') {
      const selected = document.querySelector(`input[name="news-question-${i}"]:checked`);
      if (!selected) { showToast(`⚠️ Pilih jawaban soal pilihan ganda nomor ${i + 1} dulu!`); return; }
      answers[i] = Number(selected.value);
    } else if (q.type === 'essay') {
      const ta = document.querySelector(`.essay-answer-input[data-qidx="${i}"]`);
      const val = ta ? ta.value.trim() : '';
      if (!val) { showToast(`⚠️ Isi jawaban esai nomor ${i + 1} dulu!`); return; }
      answers[i] = val;
    }
  }
  state.answers[state.selectedNewsIndex] = answers;
  // simpan ke rekap (kumpulan semua jawaban berita)
  const n = state.news[state.selectedNewsIndex];
  if (!state._newsRecap) state._newsRecap = {};
  state._newsRecap[state.selectedNewsIndex] = { judul: n.title, jawaban: answers, questions };
  saveStudentRecap('climateNews', state._newsRecap);
  updateProgressBar();
  showToast('✅ Jawaban berhasil dikirim!');
}

function questionFormHtml(number, question = null, type = null) {
  // deteksi tipe dari data existing atau parameter
  const qtype = type || question?.type || 'mc';
  if (qtype === 'essay') {
    const val = question || { text: '', type: 'essay' };
    return `<div class="question-editor essay-editor">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <label style="margin:0">Soal Esai ${number} <span style="background:#e8f0fe;color:#1a3a7a;font-size:0.7rem;padding:2px 8px;border-radius:99px;font-weight:700;margin-left:6px">ESAI</span></label>
        <button type="button" class="editor-remove" onclick="removeQuestionForm(this)">Hapus</button>
      </div>
      <textarea class="mc-question essay-question" placeholder="Tulis pertanyaan esai..." style="min-height:80px">${val.text}</textarea>
      <input type="hidden" class="mc-essay-flag" value="essay">
    </div>`;
  }
  // default: pilihan ganda
  const values = question || { text:'', options:['', '', '', ''], answer:0 };
  return `<div class="question-editor">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <label style="margin:0">Soal PG ${number} <span style="background:var(--green-pale);color:var(--green-deep);font-size:0.7rem;padding:2px 8px;border-radius:99px;font-weight:700;margin-left:6px">PILIHAN GANDA</span></label>
      <button type="button" class="editor-remove" onclick="removeQuestionForm(this)">Hapus</button>
    </div>
    <textarea class="mc-question" placeholder="Tulis pertanyaan...">${values.text}</textarea>
    <label>Pilihan jawaban</label>
    <div class="option-grid">
      ${['A', 'B', 'C', 'D'].map((letter, index) => `<input class="mc-option" placeholder="${letter}. Pilihan ${letter}" value="${values.options[index] || ''}">`).join('')}
    </div>
    <label>Jawaban yang benar</label>
    <select class="mc-answer"><option value="0" ${values.answer === 0 ? 'selected' : ''}>A</option><option value="1" ${values.answer === 1 ? 'selected' : ''}>B</option><option value="2" ${values.answer === 2 ? 'selected' : ''}>C</option><option value="3" ${values.answer === 3 ? 'selected' : ''}>D</option></select>
  </div>`;
}


function addQuestionForm(containerId = 'questionBuilder', question = null, type = null) {
  const container = document.getElementById(containerId);
  container.insertAdjacentHTML('beforeend', questionFormHtml(container.children.length + 1, question, type));
}

function initQuestionBuilder(containerId = 'questionBuilder', questions = []) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (questions.length) questions.forEach(question => addQuestionForm(containerId, question));
  else addQuestionForm(containerId);
}

function removeQuestionForm(button) {
  const builder = button.closest('[id$="questionBuilder"], [id$="QuestionBuilder"]');
  button.closest('.question-editor').remove();
  [...builder.querySelectorAll('.question-editor')].forEach((editor, index) => {
    editor.querySelector('label').textContent = `Soal ${index + 1}`;
  });
}

function collectQuestionForms(containerId) {
  return [...document.querySelectorAll(`#${containerId} .question-editor`)].map(editor => {
    const text = editor.querySelector('.mc-question').value.trim();
    if (!text) return null;
    // cek apakah esai
    if (editor.querySelector('.mc-essay-flag')) {
      return { type: 'essay', text };
    }
    const options = [...editor.querySelectorAll('.mc-option')].map(input => input.value.trim());
    const answer = Number(editor.querySelector('.mc-answer').value);
    if (options.some(option => !option)) return null;
    return { type: 'mc', text, options, answer };
  }).filter(Boolean);
}

function saveArticleQuestions() {
  const questions = collectQuestionForms('newQuestionBuilder');
  const total = document.querySelectorAll('#newQuestionBuilder .question-editor').length;
  if (!questions.length || questions.length !== total) { showToast('⚠️ Lengkapi pertanyaan dan pilihan A–D!'); return; }
  state.news[state.selectedNewsIndex].questions.push(...questions);
  closeModal('modal-addquestion');
  renderNewsDetail();
  showToast(`✅ ${questions.length} soal berhasil ditambahkan!`);
}

function openNewsEditor(index) {
  const news = state.news[index];
  state.selectedNewsIndex = index;
  document.getElementById('editNewsTitle').value = news.title;
  document.getElementById('editNewsBody').value = news.body;
  document.getElementById('editNewsTag').value = news.tag;
  document.getElementById('editNewsImage').value = news.image || '';
  document.getElementById('editNewsImagePreview').innerHTML = news.image
    ? `<img src="${news.image}" style="max-width:100%;max-height:140px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'">` : '';
  initQuestionBuilder('editQuestionBuilder', news.questions || []);
  openModal('modal-editnews');
}

async function saveNewsEdits(){

    const index=state.selectedNewsIndex;

    const token=document
        .querySelector('meta[name="csrf-token"]')
        .content;

    const response=await fetch('/admin/news/'+state.news[index].id,{

        method:'PUT',

        headers:{
            'Content-Type':'application/json',
            'Accept':'application/json',
            'X-CSRF-TOKEN':token
        },

        body:JSON.stringify({

            title:document.getElementById('editNewsTitle').value,

            content:document.getElementById('editNewsBody').value,

            tag:document.getElementById('editNewsTag').value,

            thumbnail:document.getElementById('editNewsImage').value

        })

    });

    const data=await response.json();

    if(data.success){

        await loadNews();

        closeModal('modal-editnews');

        showToast("✅ Berhasil diupdate");

    }

}

async function deleteNews(index){

    if(!confirm("Hapus berita ini?")) return;

    const id = state.news[index].id;

    const token=document
        .querySelector('meta[name="csrf-token"]')
        .content;

    const response=await fetch('/admin/news/'+id,{

        method:'DELETE',

        headers:{
            'X-CSRF-TOKEN':token,
            'Accept':'application/json'
        }

    });

    const data=await response.json();

    if(data.success){

        await loadNews();

        showToast("🗑 Berita berhasil dihapus");

    }

}

function previewNewsImage(url, targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  if (!url.trim()) { el.innerHTML = ''; return; }
  el.innerHTML = `<img src="${url}" style="max-width:100%;max-height:140px;border-radius:8px;object-fit:cover" onerror="this.parentElement.innerHTML='<span style=\'color:#d9534f;font-size:0.78rem\'>⚠️ Gambar tidak dapat dimuat, periksa URL</span>'">`;
}

function addNews() {
  const t = document.getElementById('newsTitle').value.trim();
  const b = document.getElementById('newsBody').value.trim();
  const tag = document.getElementById('newsTag').value.trim() || 'Berita';
  const image = document.getElementById('newsImage').value.trim();
  const questions = collectQuestionForms('questionBuilder');
  if (!t || !b) { showToast('⚠️ Isi semua field!'); return; }
  if (!questions.length || questions.length !== document.querySelectorAll('#questionBuilder .question-editor').length) { showToast('⚠️ Lengkapi minimal satu soal dan pilihan A–D!'); return; }
  state.news.push({ title: t, body: b, tag, image, questions });
  closeModal('modal-addnews');
  renderTahap1();
  showToast('✅ Berita ditambahkan!');
  document.getElementById('newsTitle').value = '';
  document.getElementById('newsBody').value = '';
  document.getElementById('newsTag').value = '';
  document.getElementById('newsImage').value = '';
  document.getElementById('newsImagePreview').innerHTML = '';
  initQuestionBuilder();
}

// ══════════════════ TAHAP 2 ══════════════════
const ecoPacks = [
  {
    id: 'aktivis',
    name: 'Paket Aktivis Lingkungan',
    emoji: '🌿',
    colorClass: 'atmo',
    info: '6 kartu · Data & Fakta Lingkungan',
    desc: 'Temukan fakta ilmiah dampak plastik terhadap lingkungan!'
  },
  {
    id: 'pedagang',
    name: 'Paket Pedagang',
    emoji: '🛒',
    colorClass: 'bio',
    info: '7 kartu · Data Ekonomi & UMKM',
    desc: 'Pahami tantangan nyata pelaku usaha dalam menghadapi kebijakan plastik!'
  },
  {
    id: 'peneliti',
    name: 'Paket Peneliti',
    emoji: '🔬',
    colorClass: 'hydro',
    info: '7 kartu · Data Ilmiah & Riset',
    desc: 'Gali data sains terkini tentang dampak plastik pada iklim dan kesehatan!'
  }
];

// track which packs have been opened
if (!state.openedPacks) state.openedPacks = {};

function renderTahap2() {
  document.getElementById('adminBar2').style.display = state.isAdmin ? 'block' : 'none';
  document.getElementById('ecoPacksView').style.display = 'block';
  document.getElementById('ecoCardsView').style.display = 'none';
  const grid = document.getElementById('ecoPacksGrid');
  grid.innerHTML = ecoPacks.map(pack => {
    const isOpened = !!state.openedPacks[pack.id];
    return `
    <button class="eco-pack ${pack.colorClass}" onclick="openEcoPack('${pack.id}')">
      <div class="pack-stack">
        <div class="pack-sheet"></div>
        <div class="pack-sheet"></div>
        <div class="pack-sheet">${isOpened ? '✅' : pack.emoji}</div>
      </div>
      <div class="pack-name">${pack.name}</div>
      <div class="pack-info">${pack.info}</div>
      <div class="pack-open">${isOpened ? '✅ Sudah dibuka — lihat lagi →' : '🎴 Sobek & Buka Paket →'}</div>
    </button>`;
  }).join('');
  document.getElementById('videoDesc').innerHTML = state.videoDesc;
}

function openEcoPack(packId) {
  const pack = ecoPacks.find(p => p.id === packId);
  if (!pack) return;
  const cards = state.ecoCards.filter(c => c.type === packId);
  const isNew = !state.openedPacks[packId];
  state.openedPacks[packId] = true;

  // simpan state gacha
  state._gacha = { cards, packId, idx: 0, isNew };

  document.getElementById('ecoPacksView').style.display = 'none';
  document.getElementById('ecoCardsView').style.display = 'block';
  document.getElementById('ecoPackViewTitle').textContent = `${pack.emoji} ${pack.name}`;
  document.getElementById('ecoPackViewSub').textContent = pack.desc;

  renderGachaCard();
  if (isNew) showToast('🎴 Paket berhasil dibuka! Baca kartu satu per satu ya!');
}

function renderGachaCard() {
  const { cards, idx, flipped } = state._gacha;
  const c = cards[idx];
  const total = cards.length;
  const isLast = idx === total - 1;
  const isFlipped = flipped && flipped[idx];

  // Hitung tinggi kartu dulu, baru render
  // gacha-face pakai position:absolute jadi parent perlu height eksplisit
  document.getElementById('ecoCardsGrid').innerHTML = `
    <div class="gacha-stage">
      <div class="gacha-dots-row">
        ${cards.map((_, i) => `<span class="gacha-dot-pill ${i < idx ? 'done' : i === idx ? 'active' : ''}"></span>`).join('')}
      </div>
      <div class="gacha-counter-label">KARTU ${idx + 1} dari ${total}</div>
      <div class="gacha-card-wrap">
        <div class="gacha-flip-scene" onclick="handleGachaClick()">
          <div class="gacha-flip-card ${isFlipped ? 'is-flipped' : ''}">
            <!-- DEPAN: icon + judul -->
            <div class="gacha-face gacha-face-front eco-card gacha-card-full">
              <div class="eco-card-badge">${c.badge}</div>
              <span class="eco-card-icon gacha-icon">${c.icon}</span>
              <div class="eco-card-type ${c.type}">${c.badge.toUpperCase()}</div>
              <div class="eco-card-title gacha-title">${c.title}</div>
              <div class="gacha-flip-hint">👆 Klik kartu untuk membaca</div>
            </div>
            <!-- BELAKANG: isi lengkap -->
            <div class="gacha-face gacha-face-back eco-card gacha-card-full">
              <div class="eco-card-badge">${c.badge}</div>
              <span class="eco-card-icon gacha-icon">${c.icon}</span>
              <div class="eco-card-type ${c.type}">${c.badge.toUpperCase()}</div>
              <div class="eco-card-title gacha-title">${c.title}</div>
              <div class="eco-card-desc gacha-desc">${c.desc}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="gacha-below">
        <div class="gacha-flip-status">${isFlipped ? '✅ Sudah dibaca — klik kartu untuk lanjut' : '👆 Klik kartu untuk membaca isinya'}</div>
        <div class="gacha-nav-row">
          <button class="btn-sm" onclick="event.stopPropagation();gachaPrev()" ${idx === 0 ? 'disabled style="opacity:0.4"' : ''}>← Sebelumnya</button>
          ${isFlipped
            ? isLast
              ? `<button class="btn-sm" style="background:var(--green);color:white" onclick="event.stopPropagation();closePackView()">✅ Selesai</button>`
              : `<button class="btn-sm" style="background:var(--green);color:white" onclick="event.stopPropagation();gachaNext()">Kartu Berikutnya →</button>`
            : `<button class="btn-sm" style="opacity:0.4;cursor:default" disabled>Baca kartu dulu ↑</button>`
          }
        </div>
      </div>
    </div>
  `;
  // Set height eksplisit pada gacha-flip-scene setelah render
  // agar tidak overlap dengan elemen di bawahnya
  requestAnimationFrame(() => {
    const scene = document.querySelector('.gacha-flip-scene');
    const card = document.querySelector('.gacha-face-front');
    if (scene && card) {
      scene.style.height = card.offsetHeight + 'px';
    }
  });
}

function handleGachaClick() {
  const isFlipped = state._gacha.flipped && state._gacha.flipped[state._gacha.idx];
  if (isFlipped) {
    // sudah dibaca → lanjut ke kartu berikutnya atau selesai
    const isLast = state._gacha.idx === state._gacha.cards.length - 1;
    if (isLast) closePackView();
    else gachaNext();
  } else {
    flipGachaCard();
  }
}

function flipGachaCard() {
  if (!state._gacha.flipped) state._gacha.flipped = {};
  state._gacha.flipped[state._gacha.idx] = true;
  // langsung toggle class tanpa re-render penuh supaya animasi mulus
  const flipCard = document.querySelector('.gacha-flip-card');
  if (flipCard) {
    flipCard.classList.add('is-flipped');
    document.querySelector('.gacha-flip-status').textContent = '✅ Sudah dibaca';
    // tampilkan tombol next
    const navRow = document.querySelector('.gacha-nav-row');
    const isLast = state._gacha.idx === state._gacha.cards.length - 1;
    navRow.querySelector('button:last-child').outerHTML = isLast
      ? `<button class="btn-sm" style="background:var(--green);color:white" onclick="closePackView()">✅ Selesai</button>`
      : `<button class="btn-sm" style="background:var(--green);color:white" onclick="gachaNext()">Kartu Berikutnya →</button>`;
  }
}

function gachaNext() {
  if (state._gacha.idx < state._gacha.cards.length - 1) {
    state._gacha.idx++;
    renderGachaCard();
  }
}

function gachaPrev() {
  if (state._gacha.idx > 0) {
    state._gacha.idx--;
    renderGachaCard();
  }
}
function closePackView() {
  document.getElementById('ecoCardsView').style.display = 'none';
  document.getElementById('ecoPacksView').style.display = 'block';
  // simpan rekap paket yang sudah dibuka
  saveStudentRecap('ecoPacks', Object.keys(state.openedPacks || {}));
  updateProgressBar();
  renderTahap2();
}

function loadVideo() {
  if (!state.videoUrl) {
    showToast('⚠️ Admin belum menambahkan link video!');
    return;
  }
  const videoId = extractYoutubeId(state.videoUrl);
  if (!videoId) { showToast('⚠️ Link video tidak valid'); return; }
  const wrap = document.getElementById('videoWrap');
  wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
}

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function updateVideo() {
  const url = document.getElementById('videoUrl').value.trim();
  const desc = document.getElementById('videoDescInput').value.trim();
  if (!url) { showToast('⚠️ Masukkan link YouTube!'); return; }
  state.videoUrl = url;
  if (desc) state.videoDesc = '🌿 <strong>Deskripsi:</strong> ' + desc;
  // reset video wrap
  document.getElementById('videoWrap').innerHTML = `
    <button class="video-placeholder-btn" onclick="loadVideo()">
      <div class="play-circle">▶</div>
      <span>Klik untuk memutar video</span>
    </button>`;
  document.getElementById('videoDesc').innerHTML = state.videoDesc;
  closeModal('modal-addvideo');
  showToast('✅ Video diperbarui!');
}

// simpan jawaban pemantik
function savePemantikAnswer(idx, val) {
  if (!state.pemantikAnswers) state.pemantikAnswers = {};
  state.pemantikAnswers[idx] = val;
}

const PEMANTIK_QUESTIONS = [
  'Menurut kamu, apa dampak terbesar perubahan iklim yang paling dirasakan masyarakat Indonesia saat ini?',
  'Siapa yang paling bertanggung jawab atas perubahan iklim — individu, industri, atau pemerintah? Jelaskan alasanmu!',
  'Jika kamu jadi pembuat kebijakan, langkah apa yang pertama kali kamu ambil untuk mengatasi krisis iklim di Indonesia?',
  'Apakah pembatasan industri adalah solusi yang adil untuk negara berkembang seperti Indonesia? Setuju atau tidak setuju?',
  'Dari eco cards yang sudah kamu buka, fakta mana yang paling mengejutkan? Bagaimana fakta itu mendukung posisi kelompokmu dalam debat?'
];

function submitPemantikAnswers() {
  const answers = state.pemantikAnswers || {};
  const total = PEMANTIK_QUESTIONS.length;
  const filled = Object.keys(answers).filter(k => (answers[k] || '').trim() !== '').length;
  if (filled < total) {
    showToast(`⚠️ Masih ada ${total - filled} pertanyaan yang belum dijawab!`);
    return;
  }
  // simpan ke rekap global siswa
  saveStudentRecap('pemantik', { jawaban: answers, questions: PEMANTIK_QUESTIONS });
  state.pemantikSubmitted = true;
  document.getElementById('pemantikSubmitStatus').textContent = '✅ Jawaban sudah disubmit';
  document.getElementById('pemantikSubmitBtn').textContent = '✅ Tersimpan — Submit Ulang';
  document.querySelectorAll('.pemantik-answer').forEach(ta => ta.disabled = false); // tetap bisa edit & submit ulang
  updateProgressBar();
  showToast('🎉 Jawaban pertanyaan pemantik berhasil dikirim!');
}

// ══════════════════ TAHAP 3 ══════════════════
async function loadGroupsAndStudents() {
  try {
    const resGroups = await fetch('/api/groups');
    const dataGroups = await resGroups.json();
    if (dataGroups.success) {
      state.groups = dataGroups.data || [];
    }

    const resStudents = await fetch('/api/students');
    const dataStudents = await resStudents.json();
    if (dataStudents.success) {
      state.onlineStudents = (dataStudents.data || []).filter(s => s.is_online);
    }
    
    renderTahap3();
  } catch (e) {
    console.error(e);
  }
}

async function loadStudentGroupInfo() {
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  try {
    const res = await fetch('/api/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
      }
    });
    const data = await res.json();
    if (data.success) {
      state.myGroup = data.group;
    }
    renderTahap3();
  } catch (e) {
    console.error(e);
  }
}

function renderTahap3() {
  document.getElementById('adminBar3').style.display = state.isAdmin ? 'block' : 'none';
  const groupsContainer = document.getElementById('groupsContainer');
  
  if (state.isAdmin) {
    // Admin view
    groupsContainer.innerHTML = (state.groups || []).map(group => {
      const members = (group.members || []).map(member => {
        if (typeof member === 'object' && member !== null) {
          return member.name;
        }
        const student = (state.onlineStudents || []).find(s => s.id == member || s.name == member);
        return student ? student.name : member;
      }).filter(Boolean);
      return `<div class="group-card"><div><div class="group-name">${group.icon || '👥'} ${group.name}</div><div class="group-members">${members.length ? members.join(', ') : 'Belum ada anggota'}</div></div><div class="group-badge">${group.side === 'pro' || group.side === 'Pro' ? '✅ PRO' : '❌ KONTRA'}</div></div>`;
    }).join('');

    const panel = document.getElementById('onlineStudentsPanel');
    if (panel) {
      panel.style.display = 'block';
      panel.innerHTML = `<div class="online-panel">
        <div class="online-panel-title">🟢 Siswa Online (${state.onlineStudents ? state.onlineStudents.length : 0})</div>
        <div class="online-panel-note">Pilih kelompok untuk setiap siswa. Siswa akan otomatis dipindahkan dari kelompok sebelumnya.</div>
        ${(state.onlineStudents || []).map(student => {
          const currentGroup = (state.groups || []).find(group => {
            return (group.members || []).some(m => {
              if (typeof m === 'object' && m !== null) {
                return m.id == student.id;
              }
              return m == student.id;
            });
          });
          return `<div class="online-student">
            <span class="online-dot"></span>
            <span class="online-student-name">${student.name}</span>
            <select class="group-select" onchange="assignStudentToGroup('${student.id}', this.value)">
              <option value="">Belum masuk kelompok</option>
              ${(state.groups || []).map(group => `<option value="${group.id}" ${currentGroup?.id == group.id ? 'selected' : ''}>${group.icon || '👥'} ${group.name} (${group.side === 'pro' || group.side === 'Pro' ? 'Pro' : 'Kontra'})</option>`).join('')}
            </select>
          </div>`;
        }).join('')}
      </div>`;
    }
  } else {
    // Student view
    const panel = document.getElementById('onlineStudentsPanel');
    if (panel) panel.style.display = 'none';
    
    if (state.myGroup) {
      const membersList = (state.myGroup.members || []).map(m => m.name).join(', ') || 'Hanya Anda';
      groupsContainer.innerHTML = `
        <div class="my-group-container" style="background:var(--green-pale); border: 2px solid var(--green); padding: 1.25rem; border-radius: 12px; margin-top: 1rem;">
          <h3 style="margin-top:0;color:var(--green-deep);display:flex;align-items:center;gap:0.5rem">
            ${state.myGroup.icon || '👥'} Kelompok Anda: ${state.myGroup.name}
          </h3>
          <div style="margin-bottom:0.75rem">
            <span style="font-weight:bold">Posisi Debat:</span> 
            <span class="badge" style="background:${state.myGroup.side === 'pro' || state.myGroup.side === 'Pro' ? 'var(--green)' : '#ff6b6b'};color:white;padding:3px 10px;border-radius:20px;font-size:0.8rem">
              ${state.myGroup.side === 'pro' || state.myGroup.side === 'Pro' ? '✅ PRO KEBIJAKAN' : '❌ KONTRA KEBIJAKAN'}
            </span>
          </div>
          <div>
            <span style="font-weight:bold">Anggota Kelompok:</span>
            <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--dark)">${membersList}</p>
          </div>
        </div>
      `;
    } else {
      groupsContainer.innerHTML = `
        <div class="my-group-container" style="background:#fff3cd; border: 2px solid #ffeeba; padding: 1.25rem; border-radius: 12px; margin-top: 1rem; color: #856404;">
          <h3 style="margin-top:0;display:flex;align-items:center;gap:0.5rem">⏳ Belum Masuk Kelompok</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem">Anda belum dimasukkan ke kelompok mana pun oleh Guru/Admin. Silakan tunggu beberapa saat atau hubungi Guru Anda.</p>
        </div>
      `;
    }
  }
}

async function assignStudentToGroup(studentId, groupId) {
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  try {
    if (groupId) {
      await fetch('/api/groups/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
        body: JSON.stringify({ student_id: studentId, debate_group_id: groupId })
      });
    } else {
      await fetch(`/api/groups/student/${studentId}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-TOKEN': token }
      });
    }
    await loadGroupsAndStudents();
    showToast('✅ Kelompok siswa diperbarui');
  } catch (e) {
    console.error(e);
    showToast('⚠️ Gagal menyimpan ke server');
  }
}

async function addGroup() {
  const name = document.getElementById('groupName')?.value?.trim();
  const side = document.getElementById('groupSide')?.value || 'Pro';
  if (!name) { showToast('⚠️ Isi nama kelompok!'); return; }
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  
  const icons = ['🌿','⚡','🌊','🔥','🌪️','🌱'];
  const icon = icons[Math.floor(Math.random() * icons.length)];
  
  try {
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
      body: JSON.stringify({ name, side, icon })
    });
    
    closeModal('modal-addgroup');
    showToast('✅ Kelompok ditambahkan!');
    if (document.getElementById('groupName')) document.getElementById('groupName').value = '';
    if (document.getElementById('groupMembers')) document.getElementById('groupMembers').value = '';
    await loadGroupsAndStudents();
  } catch (e) {
    console.error(e);
    showToast('⚠️ Gagal menyimpan kelompok');
  }
}

// ══════════════════ TAHAP 5 ══════════════════
function renderTahap5() {
  const cl = document.getElementById('commentList');
  // render dynamic comments
  if (state.comments.length > 0) {
    const existing = cl.querySelectorAll('.dynamic-comment');
    existing.forEach(e => e.remove());
    state.comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment-item dynamic-comment';
      div.innerHTML = `
        <div class="comment-avatar">${c.initial}</div>
        <div class="comment-body">
          <div class="comment-name">${c.name}</div>
          <div class="comment-text">${c.text}</div>
          <div class="comment-time">${c.time}</div>
          ${c.reply ? `<div class="teacher-reply"><strong>💬 Bu Guru:</strong> ${c.reply}</div>` : 
            (state.isAdmin ? `<button class="btn-sm green" style="margin-top:8px;padding:5px 12px;font-size:0.78rem" onclick="replyComment(this, '${c.id}')">💬 Jawab</button>` : '')}
        </div>`;
      cl.appendChild(div);
    });
  }
}

function submitRefleksi() {
  const txt = document.getElementById('refleksiInput').value.trim();
  if (!txt) { showToast('⚠️ Tulis pertanyaanmu dulu!'); return; }
  const name = state.user ? state.user.name : 'Siswa';
  const now = new Date();
  const time = `Hari ini · ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
  const id = 'c' + Date.now();
  state.comments.push({
    id, name, text: txt,
    initial: name.charAt(0).toUpperCase(),
    time, reply: state.isAdmin ? null : null
  });
  document.getElementById('refleksiInput').value = '';
  if (!state._refleksiRecap) state._refleksiRecap = [];
  state._refleksiRecap.push(txt);
  saveStudentRecap('refleksi', state._refleksiRecap);
  updateProgressBar();
  renderTahap5();
  showToast('✅ Pertanyaan berhasil dikirim ke guru!');
}

function replyComment(btn, id) {
  const replyText = prompt('Tulis jawaban guru untuk pertanyaan ini:');
  if (!replyText) return;
  const c = state.comments.find(x => x.id === id);
  if (c) {
    c.reply = replyText;
    renderTahap5();
    showToast('✅ Jawaban guru dikirim!');
  }
}

// ══════════════════ MODAL ══════════════════
function openModal(id) {
  document.getElementById(id).classList.add('open');
  if (id === 'modal-kancing') renderKancingControls();
  if (id === 'modal-setup-debate') loadGroupsForSetup();
  if (id === 'modal-addnews') initQuestionBuilder('questionBuilder');
  if (id === 'modal-addquestion') initQuestionBuilder('newQuestionBuilder');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

// ══════════════════ TOAST ══════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ══════════════════ FLOATING LEAVES ══════════════════
function generateLeaves() {
  const container = document.getElementById('floatingLeaves');
  const emojis = ['🍃','🌿','🍀','🌱','🌾'];
  container.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = (8 + Math.random() * 12) + 's';
    leaf.style.animationDelay = (Math.random() * 10) + 's';
    leaf.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    container.appendChild(leaf);
  }
}
generateLeaves();
initQuestionBuilder();

// Enter key for login
document.getElementById('loginNIS').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLoginSiswa();
});
document.getElementById('loginSekolah').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLoginSiswa();
});
// guru login via button only

// ══════════════════════════════════════════
// BACKGROUND ANIMATION ENGINE
// ══════════════════════════════════════════
(function initBackground() {

  // ── 1. CANVAS: sky-to-earth gradient + animated sun/moon + hills + stars ──
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawFrame() {
    t += 0.004;
    ctx.clearRect(0, 0, W, H);

    // Sky gradient — slow color cycle between day blue and golden hour
    const skyTop    = lerpColor('#b8e8f5','#ffe8a3', (Math.sin(t*0.3)+1)/2 * 0.35);
    const skyBottom = lerpColor('#d4f0e0','#f0faf4', (Math.sin(t*0.2)+1)/2 * 0.2);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(0.55, skyBottom);
    skyGrad.addColorStop(1, '#e8f7ee');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Sun
    const sunX = W * 0.78;
    const sunY = H * 0.14 + Math.sin(t * 0.5) * 8;
    const sunR = Math.min(W, H) * 0.055;
    // Glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.3, sunX, sunY, sunR * 3.5);
    sunGlow.addColorStop(0, 'rgba(255,224,80,0.28)');
    sunGlow.addColorStop(1, 'rgba(255,224,80,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 3.5, 0, Math.PI*2); ctx.fill();
    // Sun body
    const sunGrad = ctx.createRadialGradient(sunX-sunR*0.25, sunY-sunR*0.25, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, '#fff5b0');
    sunGrad.addColorStop(0.5, '#F4C430');
    sunGrad.addColorStop(1, '#e8a800');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI*2); ctx.fill();
    // Sun rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(t * 0.4);
    ctx.strokeStyle = 'rgba(244,196,48,0.35)';
    for (let i=0; i<8; i++) {
      const a = (i/8)*Math.PI*2;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*(sunR+6), Math.sin(a)*(sunR+6));
      ctx.lineTo(Math.cos(a)*(sunR+22), Math.sin(a)*(sunR+22));
      ctx.stroke();
    }
    ctx.restore();

    // Layered hills
    // Back hill — pale green
    drawHill(ctx, W, H, 0.62, 0.38, '#c8ead4', 0.6, t * 0.12);
    // Mid hill — medium green
    drawHill(ctx, W, H, 0.72, 0.30, '#a8d5b5', 0.75, t * -0.09);
    // Front hill — deep green  
    drawHill(ctx, W, H, 0.82, 0.22, '#74b88a', 0.9, t * 0.07);
    // Foreground strip
    const fgGrad = ctx.createLinearGradient(0, H*0.88, 0, H);
    fgGrad.addColorStop(0, '#4a9e6e');
    fgGrad.addColorStop(1, '#2d6a4f');
    ctx.fillStyle = fgGrad;
    ctx.fillRect(0, H*0.88, W, H*0.12);

    // Trees on front hill
    for (let i=0; i<12; i++) {
      const tx = (i/11)*W*0.9 + W*0.05 + Math.sin(i*1.7)*30;
      const ty = H*0.80 - Math.abs(Math.sin((tx/W)*Math.PI))*H*0.06;
      const th = 18 + (i%3)*10 + Math.sin(i+t)*3;
      drawTree(ctx, tx, ty, th);
    }

    requestAnimationFrame(drawFrame);
  }
  drawFrame();

  function drawHill(ctx, W, H, yFrac, amp, color, alpha, phase) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x=0; x<=W; x+=4) {
      const nx = x / W;
      const y = H * yFrac - Math.sin(nx * Math.PI + phase) * H * amp * 0.13
                           - Math.sin(nx * Math.PI * 2.3 + phase*1.3) * H * 0.028;
      x===0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawTree(ctx, x, y, h) {
    // trunk
    ctx.fillStyle = '#5a3e28';
    ctx.fillRect(x-2, y, 4, h*0.35);
    // foliage layers
    [1, 0.7, 0.45].forEach((scale, i) => {
      ctx.fillStyle = i===0 ? '#2d6a4f' : i===1 ? '#3d8a5f' : '#52b788';
      ctx.beginPath();
      ctx.moveTo(x, y - h*scale);
      ctx.lineTo(x - h*scale*0.38, y - h*i*0.22);
      ctx.lineTo(x + h*scale*0.38, y - h*i*0.22);
      ctx.closePath();
      ctx.fill();
    });
  }

  function lerpColor(a, b, t) {
    const ah = a.replace('#',''), bh = b.replace('#','');
    const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
    const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
    const rr = Math.round(ar+(br-ar)*t), rg = Math.round(ag+(bg-ag)*t), rb = Math.round(ab+(bb-ab)*t);
    return `rgb(${rr},${rg},${rb})`;
  }

  // ── 2. SVG CLOUDS ──
  const cloudLayer = document.getElementById('cloudLayer');
  const cloudShapes = [
    // big fluffy
    `<svg viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="90" cy="55" rx="85" ry="28" fill="white"/><ellipse cx="65" cy="48" rx="42" ry="32" fill="white"/><ellipse cx="110" cy="46" rx="38" ry="30" fill="white"/><ellipse cx="90" cy="40" rx="30" ry="24" fill="white"/></svg>`,
    // medium
    `<svg viewBox="0 0 130 60" xmlns="http://www.w3.org/2000/svg"><ellipse cx="65" cy="42" rx="60" ry="20" fill="rgba(255,255,255,0.9)"/><ellipse cx="48" cy="36" rx="30" ry="24" fill="rgba(255,255,255,0.9)"/><ellipse cx="82" cy="34" rx="28" ry="22" fill="rgba(255,255,255,0.9)"/></svg>`,
    // small wisp
    `<svg viewBox="0 0 100 45" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="32" rx="46" ry="16" fill="rgba(255,255,255,0.7)"/><ellipse cx="38" cy="26" rx="24" ry="18" fill="rgba(255,255,255,0.7)"/><ellipse cx="62" cy="25" rx="20" ry="16" fill="rgba(255,255,255,0.7)"/></svg>`,
  ];

  const cloudDefs = [
    { w:280, top:'4%',  dur:55, delay:0,    shape:0, op:0.75 },
    { w:200, top:'10%', dur:80, delay:-25,  shape:1, op:0.6  },
    { w:160, top:'7%',  dur:100,delay:-55,  shape:2, op:0.5  },
    { w:320, top:'1%',  dur:70, delay:-40,  shape:0, op:0.55 },
    { w:180, top:'14%', dur:90, delay:-15,  shape:1, op:0.45 },
    { w:240, top:'3%',  dur:65, delay:-60,  shape:2, op:0.65 },
  ];

  cloudDefs.forEach(c => {
    const div = document.createElement('div');
    div.className = 'cloud';
    div.style.cssText = `top:${c.top};width:${c.w}px;opacity:${c.op};animation-duration:${c.dur}s;animation-delay:${c.delay}s;`;
    div.innerHTML = cloudShapes[c.shape];
    cloudLayer.appendChild(div);
  });

  // ── 3. FLOATING CLIMATE EMOJIS ──
  const floaterContainer = document.getElementById('bgFloaters');
  const floaterEmojis = ['🍃','🌿','🌱','🍀','🌾','💧','❄️','🌸','🌻','🍃','🌿','🌱'];

  floaterEmojis.forEach((em, i) => {
    const el = document.createElement('div');
    el.className = 'bg-floater';
    el.textContent = em;
    const size = 1.1 + Math.random() * 1.2;
    el.style.cssText = `
      left: ${5 + (i / floaterEmojis.length) * 90}%;
      font-size: ${size}rem;
      animation-duration: ${14 + Math.random() * 18}s;
      animation-delay: ${-Math.random() * 20}s;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
    `;
    floaterContainer.appendChild(el);
  });

})(); // end initBackground
