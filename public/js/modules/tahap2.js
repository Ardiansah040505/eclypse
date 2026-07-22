// ══════════════════════════════════════════════════════════════════════════
// TAHAP 2 - Eco Cards & Video (Kartu Informasi & Video)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════ ECO PACKS CONFIG ══════════════════
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

// ══════════════════ LOAD VIDEOS FROM DATABASE ══════════════════
let _videosLoaded = false;
let _currentPlayingVideoId = null;

async function loadVideoData() {
    // Prevent multiple calls
    if (_videosLoaded) return;
    _videosLoaded = true;

    try {
        const response = await fetch('/api/video?stage=tahap2');
        const data = await response.json();
        if (data.success && data.data) {
            state.videos = data.data; // Array of videos
            state.videoTitle = data.data.length > 0 ? data.data[0].title || 'Video Pembelajaran' : 'Video Pembelajaran';
            state.videoDesc = data.data.length > 0
                ? '🌿 <strong>' + data.data[0].title + ':</strong> ' + (data.data[0].description || '')
                : '🌿 <strong>Video Pembelajaran:</strong> Belum ada video ditambahkan.';
        }
    } catch(e) {
        console.log('Video belum ada, gunakan default');
    }
}

// ══════════════════ RENDER TAHAP 2 ══════════════════
function renderTahap2() {
  const adminBar = document.getElementById('adminBar2');
  if (adminBar) adminBar.style.display = state.isAdmin ? 'block' : 'none';

  const packsView = document.getElementById('ecoPacksView');
  const cardsView = document.getElementById('ecoCardsView');
  if (packsView) packsView.style.display = 'block';
  if (cardsView) cardsView.style.display = 'none';

  // Reset all video players when re-render
  resetAllVideoPlayers();

  // Render videos
  renderVideos();

  // Render pack grid - TAMPILKAN SEMUA PAKET UNTUK SEMUA SISWA
  const grid = document.getElementById('ecoPacksGrid');
  if (!grid) return;

  // Hide the role assigned message since students don't need role anymore
  const roleMessage = document.getElementById('roleAssignedMessage');
  if (roleMessage) {
    roleMessage.style.display = 'none';
  }

  // Tampilkan semua paket eco cards
  grid.innerHTML = ecoPacks.map(pack => {
    const isOpened = !!state.openedPacks[pack.id];
    const cardCount = state.ecoCards.filter(c => c.type === pack.id).length;
    return `
    <button class="eco-pack ${pack.colorClass}" onclick="openEcoPack('${pack.id}')">
      <div class="pack-stack">
        <div class="pack-sheet"></div>
        <div class="pack-sheet"></div>
        <div class="pack-sheet">${isOpened ? '✅' : pack.emoji}</div>
      </div>
      <div class="pack-name">${pack.name}</div>
      <div class="pack-info">${cardCount} kartu · Data & Fakta</div>
      <div class="pack-open">${isOpened ? '✅ Sudah dibuka — lihat lagi →' : '🎴 Sobek & Buka Paket →'}</div>
    </button>`;
  }).join('');
}

// ══════════════════ RENDER MULTIPLE VIDEOS ══════════════════
function renderVideos() {
  const container = document.getElementById('videosContainer');
  if (!container) return;

  const videos = state.videos || [];

  if (videos.length === 0) {
    container.innerHTML = `
      <div class="video-empty-message">
        <p>⚠️ Belum ada video ditambahkan oleh admin.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = videos.map((video, index) => `
    <div class="video-item" id="video-item-${video.id || index}">
      <div class="video-item-header">
        <span class="video-item-title">${video.title || 'Video ' + (index + 1)}</span>
        <span class="video-item-number">Video ${index + 1}</span>
      </div>
      <div class="video-embed-wrap" id="videoWrap-${video.id || index}">
        <button class="video-placeholder-btn" onclick="loadVideo('${video.id || index}', '${video.youtube_url}')">
          <div class="play-circle">▶</div>
          <span>Klik untuk memutar video</span>
        </button>
      </div>
      ${video.description ? `
        <div class="video-item-desc">${video.description}</div>
      ` : ''}
    </div>
  `).join('');

  // Render add video button for admin
  if (state.isAdmin) {
    const addBtnContainer = document.getElementById('addVideoBtnContainer');
    if (addBtnContainer) {
      addBtnContainer.innerHTML = `
        <button class="btn-sm green" onclick="openModal('modal-addvideo')">+ Tambah Video</button>
      `;
    }
  }
}

// ══════════════════ OPEN ECO PACK ══════════════════
function openEcoPack(packId) {
  // HAPUS PEMBATASAN ROLE - siswa bisa buka semua paket
  // Cek apakah sudah pernah buka paket sebelumnya
  const alreadyOpened = Object.keys(state.openedPacks || {}).some(id => state.openedPacks[id]);
  const isFirstOpen = !alreadyOpened;

  // HAPUS PEMBATASAN - siswa bisa buka semua paket
  //if (alreadyOpened && !state.openedPacks[packId]) {
  //  showToast('⚠️ Kamu hanya boleh memilih 1 paket. Selesaikan paket yang sudah dipilih dulu!');
  //  return;
  //}

  const pack = ecoPacks.find(p => p.id === packId);
  if (!pack) return;
  const cards = state.ecoCards.filter(c => c.type === packId);
  const isNew = !state.openedPacks[packId];
  state.openedPacks[packId] = true;

  // Simpan ke localStorage
  if (typeof savePersistedState === 'function') {
    savePersistedState();
  }

  // simpan state gacha
  state._gacha = { cards, packId, idx: 0, isNew, isFirstOpen };

  const packsView = document.getElementById('ecoPacksView');
  const cardsView = document.getElementById('ecoCardsView');
  const packViewTitle = document.getElementById('ecoPackViewTitle');
  const packViewSub = document.getElementById('ecoPackViewSub');

  if (packsView) packsView.style.display = 'none';
  if (cardsView) cardsView.style.display = 'block';
  if (packViewTitle) packViewTitle.textContent = `${pack.emoji} ${pack.name}`;
  if (packViewSub) packViewSub.textContent = pack.desc;

  renderGachaCard();
  if (isNew) {
    showToast('🎴 Paket berhasil dipilih! Baca kartu satu per satu ya!');
  }
}

// ══════════════════ RENDER GACHA CARD ══════════════════
function renderGachaCard() {
  const { cards, idx, flipped } = state._gacha;
  const c = cards[idx];
  const total = cards.length;
  const isLast = idx === total - 1;
  const isFlipped = flipped && flipped[idx];

  const grid = document.getElementById('ecoCardsGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="gacha-stage">
      <div class="gacha-dots-row">
        ${cards.map((_, i) => `<span class="gacha-dot-pill ${i < idx ? 'done' : i === idx ? 'active' : ''}"></span>`).join('')}
      </div>
      <div class="gacha-counter-label">KARTU ${idx + 1} dari ${total}</div>
      <div class="gacha-card-wrap">
        <div class="gacha-flip-scene" onclick="handleGachaClick()">
          <div class="gacha-flip-card ${isFlipped ? 'is-flipped' : ''}">
            <div class="gacha-face gacha-face-front eco-card gacha-card-full">
              <div class="eco-card-badge">${c.badge}</div>
              <span class="eco-card-icon gacha-icon">${c.icon}</span>
              <div class="eco-card-type ${c.type}">${c.badge.toUpperCase()}</div>
              <div class="eco-card-title gacha-title">${c.title}</div>
              <div class="gacha-flip-hint">👆 Klik kartu untuk membaca</div>
            </div>
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
        <div class="gacha-flip-status">${isFlipped ? '✅ Sudah dibaca' : '👆 Klik kartu untuk membaca isinya'}</div>
        <div class="gacha-nav-row">
          ${isLast && isFlipped
            ? `<button class="btn-sm" style="background:var(--green);color:white" onclick="event.stopPropagation();finishPackAndGoNext()">✅ Selesai & Lanjut Tahap 3 →</button>`
            : `
              <button class="btn-sm" onclick="event.stopPropagation();gachaPrev()" ${idx === 0 ? 'disabled style="opacity:0.4"' : ''}>← Sebelumnya</button>
              ${isFlipped
                ? isLast
                  ? `<button class="btn-sm" style="background:var(--green);color:white" onclick="event.stopPropagation();closePackView()">✅ Selesai</button>`
                  : `<button class="btn-sm" style="background:var(--green);color:white" onclick="event.stopPropagation();gachaNext()">Kartu Berikutnya →</button>`
                : `<button class="btn-sm" style="opacity:0.4;cursor:default" disabled>Baca kartu dulu ↑</button>`
              }`
          }
        </div>
      </div>
    </div>
  `;
  // Set height eksplisit pada gacha-flip-scene setelah render
  requestAnimationFrame(() => {
    const scene = document.querySelector('.gacha-flip-scene');
    const card = document.querySelector('.gacha-face-front');
    if (scene && card) {
      scene.style.height = card.offsetHeight + 'px';
    }
  });
}

// ══════════════════ GACHA INTERACTIONS ══════════════════
function handleGachaClick() {
  const isFlipped = state._gacha.flipped && state._gacha.flipped[state._gacha.idx];
  if (isFlipped) {
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
  const flipCard = document.querySelector('.gacha-flip-card');
  if (flipCard) {
    flipCard.classList.add('is-flipped');
    const flipStatus = document.querySelector('.gacha-flip-status');
    if (flipStatus) flipStatus.textContent = '✅ Sudah dibaca';
    const navRow = document.querySelector('.gacha-nav-row');
    const isLast = state._gacha.idx === state._gacha.cards.length - 1;
    if (navRow) {
      navRow.querySelector('button:last-child').outerHTML = isLast
        ? `<button class="btn-sm" style="background:var(--green);color:white" onclick="closePackView()">✅ Selesai</button>`
        : `<button class="btn-sm" style="background:var(--green);color:white" onclick="gachaNext()">Kartu Berikutnya →</button>`;
    }
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

// ══════════════════ FINISH PACK AND GO TO NEXT STAGE ══════════════════
function finishPackAndGoNext() {
  // Tandai semua kartu sebagai dibaca
  if (!state._gacha.flipped) state._gacha.flipped = {};
  state._gacha.cards.forEach((_, i) => { state._gacha.flipped[i] = true; });

  // Tandai paket selesai
  state.tahap2Completed = true;

  const cardsView = document.getElementById('ecoCardsView');
  const packsView = document.getElementById('ecoPacksView');
  if (cardsView) cardsView.style.display = 'none';
  if (packsView) packsView.style.display = 'block';

  // Simpan progress
  saveStudentRecap('ecoPacks', Object.keys(state.openedPacks || {}));

  // Simpan state ke localStorage
  if (typeof savePersistedState === 'function') {
    savePersistedState();
  }

  updateProgressBar();

  showToast('🎉 Kamu sudah menyelesaikan Tahap 2! Lanjut ke Tahap 3...', 4000);

  // Langsung ke Tahap 3
  setTimeout(() => {
    goTo('tahap3');
  }, 1500);
}

function closePackView() {
  const cardsView = document.getElementById('ecoCardsView');
  const packsView = document.getElementById('ecoPacksView');

  if (cardsView) cardsView.style.display = 'none';
  if (packsView) packsView.style.display = 'block';

  // Cek apakah semua kartu sudah dibaca
  const allFlipped = state._gacha && state._gacha.flipped &&
    state._gacha.cards && Object.keys(state._gacha.flipped).length === state._gacha.cards.length &&
    Object.values(state._gacha.flipped).every(v => v === true);

  if (allFlipped) {
    // Semua kartu sudah dibaca - tahap 2 selesai
    state.tahap2Completed = true;
    saveStudentRecap('ecoPacks', Object.keys(state.openedPacks || {}));
    updateProgressBar();
    showToast('🎉 Kamu sudah menyelesaikan Tahap 2!', 3000);
  } else {
    // Belum selesai semua kartu
    saveStudentRecap('ecoPacks', Object.keys(state.openedPacks || {}));
    updateProgressBar();
  }

  // Simpan state ke localStorage
  if (typeof savePersistedState === 'function') {
    savePersistedState();
  }

  renderTahap2();
}

// ══════════════════ VIDEO FUNCTIONS (Multiple Videos) ══════════════════

function loadVideo(videoId, youtubeUrl) {
  const wrap = document.getElementById(`videoWrap-${videoId}`);

  if (!youtubeUrl) {
    stopVideo(videoId);
    showToast('⚠️ Link video tidak valid');
    return;
  }

  const videoIdExtracted = extractYoutubeId(youtubeUrl);
  if (!videoIdExtracted) {
    stopVideo(videoId);
    showToast('⚠️ Link video tidak valid');
    return;
  }

  if (wrap) {
    wrap.innerHTML = `
      <div class="video-iframe-container">
        <iframe id="videoFrame-${videoId}" src="https://www.youtube.com/embed/${videoIdExtracted}?autoplay=1" allow="autoplay; encrypted-media; fullscreen"></iframe>
        <button class="video-close-btn" onclick="stopVideo('${videoId}')">✕ Tutup Video</button>
      </div>
    `;
    _currentPlayingVideoId = videoId;
  }
}

function stopVideo(videoId) {
  const wrap = document.getElementById(`videoWrap-${videoId}`);
  if (wrap) {
    wrap.innerHTML = `
      <button class="video-placeholder-btn" onclick="loadVideo('${videoId}', '${getVideoUrlById(videoId)}')">
        <div class="play-circle">▶</div>
        <span>Klik untuk memutar video</span>
      </button>`;
  }
  if (_currentPlayingVideoId === videoId) {
    _currentPlayingVideoId = null;
  }
}

function resetAllVideoPlayers() {
  const videos = state.videos || [];
  videos.forEach((video, index) => {
    const videoId = video.id || index;
    const wrap = document.getElementById(`videoWrap-${videoId}`);
    if (wrap) {
      wrap.innerHTML = `
        <button class="video-placeholder-btn" onclick="loadVideo('${videoId}', '${video.youtube_url}')">
          <div class="play-circle">▶</div>
          <span>Klik untuk memutar video</span>
        </button>`;
    }
  });
  _currentPlayingVideoId = null;
}

function getVideoUrlById(videoId) {
  const videos = state.videos || [];
  const video = videos.find((v, idx) => (v.id || idx) == videoId);
  return video ? video.youtube_url : '';
}

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ══════════════════ ADMIN VIDEO MANAGEMENT ══════════════════

// Load videos for admin modal
async function loadVideosForAdmin() {
  try {
    const response = await fetch('/api/video?stage=tahap2');
    const data = await response.json();
    if (data.success) {
      renderAdminVideoList(data.data);
    }
  } catch(e) {
    console.error('Error loading videos:', e);
  }
}

function renderAdminVideoList(videos) {
  const listContainer = document.getElementById('adminVideoList');
  if (!listContainer) return;

  if (!videos || videos.length === 0) {
    listContainer.innerHTML = '<p class="text-gray-500 text-sm">Belum ada video. Tambahkan video baru di bawah.</p>';
    return;
  }

  listContainer.innerHTML = videos.map((video, index) => `
    <div class="admin-video-item">
      <div class="admin-video-info">
        <strong>${index + 1}. ${video.title || 'Video ' + (index + 1)}</strong>
        <small class="text-gray-500">${video.youtube_url}</small>
        ${video.description ? `<p class="text-sm mt-1">${video.description}</p>` : ''}
      </div>
      <div class="admin-video-actions">
        <button class="btn-xs" onclick="editVideo(${video.id})">✏️ Edit</button>
        <button class="btn-xs danger" onclick="deleteVideo(${video.id})">🗑️ Hapus</button>
      </div>
    </div>
  `).join('');
}

async function saveVideo() {
  const url = document.getElementById('videoUrlInput').value.trim();
  const title = document.getElementById('videoTitleInput').value.trim();
  const desc = document.getElementById('videoDescInput').value.trim();
  const order = parseInt(document.getElementById('videoOrderInput').value) || 0;

  if (!url) {
    showToast('⚠️ Masukkan link YouTube!'); return;
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    const response = await fetch('/api/admin/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token
      },
      body: JSON.stringify({
        youtube_url: url,
        title: title || 'Video Pembelajaran',
        description: desc,
        stage: 'tahap2',
        order: order
      })
    });

    const data = await response.json();
    if (data.success) {
      // Refresh videos list
      await refreshVideos();
      closeModal('modal-addvideo');
      showToast('✅ Video berhasil disimpan!');
    } else {
      showToast('❌ Gagal menyimpan video');
    }
  } catch(e) {
    console.error(e);
    showToast('❌ Gagal menyimpan video');
  }
}

async function saveMultipleVideos() {
  const urls = document.querySelectorAll('.video-url-input');
  const titles = document.querySelectorAll('.video-title-input');
  const descs = document.querySelectorAll('.video-desc-input');
  const orders = document.querySelectorAll('.video-order-input');

  const videos = [];
  urls.forEach((input, index) => {
    const url = input.value.trim();
    if (url) {
      videos.push({
        youtube_url: url,
        title: titles[index]?.value.trim() || ('Video ' + (index + 1)),
        description: descs[index]?.value.trim() || '',
        order: parseInt(orders[index]?.value) || index
      });
    }
  });

  if (videos.length === 0) {
    showToast('⚠️ Tambahkan minimal 1 video!'); return;
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    const response = await fetch('/api/admin/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token
      },
      body: JSON.stringify({
        videos: videos,
        stage: 'tahap2'
      })
    });

    const data = await response.json();
    if (data.success) {
      await refreshVideos();
      closeModal('modal-addvideo');
      showToast('✅ ' + videos.length + ' video berhasil disimpan!');
    } else {
      showToast('❌ Gagal menyimpan video');
    }
  } catch(e) {
    console.error(e);
    showToast('❌ Gagal menyimpan video');
  }
}

async function deleteVideo(videoId) {
  if (!confirm('Yakin ingin hapus video ini?')) return;

  try {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    const response = await fetch('/api/admin/video/' + videoId, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token
      }
    });

    const data = await response.json();
    if (data.success) {
      await refreshVideos();
      showToast('🗑️ Video berhasil dihapus!');
    } else {
      showToast('❌ Gagal menghapus video');
    }
  } catch(e) {
    console.error(e);
    showToast('❌ Gagal menghapus video');
  }
}

function editVideo(videoId) {
  const videos = state.videos || [];
  const video = videos.find(v => v.id === videoId);
  if (!video) return;

  document.getElementById('videoTitleInput').value = video.title || '';
  document.getElementById('videoUrlInput').value = video.youtube_url || '';
  document.getElementById('videoDescInput').value = video.description || '';
  document.getElementById('videoOrderInput').value = video.order || 0;
  document.getElementById('editingVideoId').value = videoId;

  // Show single edit form
  showSingleVideoForm();
}

async function refreshVideos() {
  _videosLoaded = false;
  await loadVideoData();
  renderVideos();
  if (state.isAdmin) {
    await loadVideosForAdmin();
  }
}

function showSingleVideoForm() {
  document.getElementById('singleVideoForm').style.display = 'block';
  document.getElementById('multipleVideoForm').style.display = 'none';
}

function showMultipleVideoForm() {
  document.getElementById('singleVideoForm').style.display = 'none';
  document.getElementById('multipleVideoForm').style.display = 'block';
  renderVideoInputs();
}

function renderVideoInputs(count = 3) {
  const container = document.getElementById('multipleVideoInputs');
  if (!container) return;

  const currentUrls = Array.from(document.querySelectorAll('.video-url-input')).map(i => i.value);

  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="video-input-group">
        <label>Video ${i + 1}</label>
        <input type="text" class="video-title-input" placeholder="Judul video ${i + 1}" value="">
        <input type="text" class="video-url-input" placeholder="Link YouTube video ${i + 1}" value="${currentUrls[i] || ''}">
        <textarea class="video-desc-input" placeholder="Deskripsi video ${i + 1}" rows="2"></textarea>
        <input type="number" class="video-order-input" placeholder="Urutan" value="${i}" min="0">
      </div>
    `;
  }

  container.innerHTML += `
    <button type="button" class="btn-sm mt-2" onclick="addVideoInput()">+ Tambah Video</button>
  `;
}

function addVideoInput() {
  const container = document.getElementById('multipleVideoInputs');
  const inputs = container.querySelectorAll('.video-input-group');
  const nextIndex = inputs.length + 1;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `
    <div class="video-input-group">
      <label>Video ${nextIndex}</label>
      <input type="text" class="video-title-input" placeholder="Judul video ${nextIndex}" value="">
      <input type="text" class="video-url-input" placeholder="Link YouTube video ${nextIndex}" value="">
      <textarea class="video-desc-input" placeholder="Deskripsi video ${nextIndex}" rows="2"></textarea>
      <input type="number" class="video-order-input" placeholder="Urutan" value="${nextIndex - 1}" min="0">
    </div>
  `;

  const addBtn = container.querySelector('button');
  container.insertBefore(tempDiv.firstElementChild, addBtn);
}

// Legacy functions for backward compatibility
function updateVideo() { saveVideo(); }

function clearAllVideos() {
  if (!confirm('Yakin ingin hapus semua video?')) return;
  try {
    fetch('/api/admin/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ stage: 'tahap2', videos: [] })
    }).then(() => {
      refreshVideos();
      showToast('🗑️ Semua video berhasil dihapus!');
    });
  } catch(e) {
    showToast('❌ Gagal menghapus video');
  }
}

// ══════════════════ PEMANTIK QUESTIONS ══════════════════
const PEMANTIK_QUESTIONS = [
  'Menurut kamu, apa dampak terbesar perubahan iklim yang paling dirasakan masyarakat Indonesia saat ini?',
  'Siapa yang paling bertanggung jawab atas perubahan iklim — individu, industri, atau pemerintah? Jelaskan alasanmu!',
  'Jika kamu jadi pembuat kebijakan, langkah apa yang pertama kali kamu ambil untuk mengatasi krisis iklim di Indonesia?',
  'Apakah pembatasan industri adalah solusi yang adil untuk negara berkembang seperti Indonesia? Setuju atau tidak setuju?',
  'Dari eco cards yang sudah kamu buka, fakta mana yang paling mengejutkan? Bagaimana fakta itu mendukung posisi kelompokmu dalam debat?'
];

function savePemantikAnswer(idx, val) {
  if (!state.pemantikAnswers) state.pemantikAnswers = {};
  state.pemantikAnswers[idx] = val;
}

function submitPemantikAnswers() {
  const answers = state.pemantikAnswers || {};
  const total = PEMANTIK_QUESTIONS.length;
  const filled = Object.keys(answers).filter(k => (answers[k] || '').trim() !== '').length;
  if (filled < total) {
    showToast(`⚠️ Masih ada ${total - filled} pertanyaan yang belum dijawab!`);
    return;
  }
  saveStudentRecap('pemantik', { jawaban: answers, questions: PEMANTIK_QUESTIONS });
  state.pemantikSubmitted = true;
  const submitStatus = document.getElementById('pemantikSubmitStatus');
  const submitBtn = document.getElementById('pemantikSubmitBtn');
  if (submitStatus) submitStatus.textContent = '✅ Jawaban sudah disubmit';
  if (submitBtn) submitBtn.textContent = '✅ Tersimpan — Submit Ulang';
  updateProgressBar();
  showToast('🎉 Jawaban pertanyaan pemantik berhasil dikirim!');
}

// Export functions globally
window.ecoPacks = ecoPacks;
window.loadVideoData = loadVideoData;
window.renderTahap2 = renderTahap2;
window.openEcoPack = openEcoPack;
window.renderGachaCard = renderGachaCard;
window.handleGachaClick = handleGachaClick;
window.flipGachaCard = flipGachaCard;
window.gachaNext = gachaNext;
window.gachaPrev = gachaPrev;
window.closePackView = closePackView;
window.finishPackAndGoNext = finishPackAndGoNext;
window.loadVideo = loadVideo;
window.stopVideo = stopVideo;
window.resetAllVideoPlayers = resetAllVideoPlayers;
window.getVideoUrlById = getVideoUrlById;
window.extractYoutubeId = extractYoutubeId;
window.saveVideo = saveVideo;
window.saveMultipleVideos = saveMultipleVideos;
window.deleteVideo = deleteVideo;
window.editVideo = editVideo;
window.refreshVideos = refreshVideos;
window.showSingleVideoForm = showSingleVideoForm;
window.showMultipleVideoForm = showMultipleVideoForm;
window.addVideoInput = addVideoInput;
window.loadVideosForAdmin = loadVideosForAdmin;
window.clearAllVideos = clearAllVideos;
window.savePemantikAnswer = savePemantikAnswer;
window.PEMANTIK_QUESTIONS = PEMANTIK_QUESTIONS;
window.submitPemantikAnswers = submitPemantikAnswers;

// Legacy exports
window.updateVideo = saveVideo;
window.loadVideoData = loadVideoData;
window.resetVideoPlayer = resetAllVideoPlayers;
