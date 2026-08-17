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

  // Render pack grid
  const grid = document.getElementById('ecoPacksGrid');
  if (!grid) return;

  // Check if student has selected a role (students only, not admin)
  const hasRole = state.studentRole && !state.isAdmin;

  // Role assigned message
  const roleMessage = document.getElementById('roleAssignedMessage');
  if (roleMessage) {
    if (hasRole) {
      const roleNames = {
        'peneliti': '🔬 Peneliti',
        'aktivis': '🌿 Aktivis',
        'pedagang': '🛒 Pedagang'
      };
      roleMessage.innerHTML = `🎭 Peranmu: <strong>${roleNames[state.studentRole] || state.studentRole}</strong> — Kamu hanya bisa mengakses kartu sesuai peranmu.`;
      roleMessage.style.display = 'block';
    } else if (!state.isAdmin) {
      roleMessage.innerHTML = `⚠️ Kamu belum memilih peran. Selesaikan Tahap 1 dulu untuk memilih peranmu.`;
      roleMessage.style.display = 'block';
    } else {
      roleMessage.style.display = 'none';
    }
  }

  // Filter packs based on role (admin sees all)
  let visiblePacks = ecoPacks;
  if (!state.isAdmin) {
    if (state.studentRole) {
      // Show only the pack matching student's role
      visiblePacks = ecoPacks.filter(pack => pack.id === state.studentRole);
    } else {
      // No role selected - show message, no packs available
      grid.innerHTML = `
        <div style="text-align:center;padding:3rem;background:white;border-radius:16px;box-shadow:0 2px 12px rgba(29,67,50,0.1)">
          <div style="font-size:3rem;margin-bottom:1rem">🔒</div>
          <div style="font-weight:800;font-size:1.1rem;color:#1B4332;margin-bottom:0.5rem">Kartu Terkunci</div>
          <div style="font-size:0.9rem;color:#6B7280">Selesaikan <strong>Tahap 1</strong> dan pilih peranmu terlebih dahulu untuk membuka kartu eco card.</div>
        </div>
      `;
      return;
    }
  }

  // Render visible packs
  grid.innerHTML = visiblePacks.map(pack => {
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

  // Show/hide materi admin button
  const kelolaBtn = document.getElementById('btn-kelola-materi');
  if (kelolaBtn) {
    kelolaBtn.style.display = state.isAdmin ? 'inline-flex' : 'none';
  }
}

// ══════════════════ OPEN ECO PACK ══════════════════
function openEcoPack(packId) {
  // Admin can open any pack
  // Students can only open packs matching their role
  if (!state.isAdmin && state.studentRole && packId !== state.studentRole) {
    showToast('⚠️ Kamu hanya bisa membuka kartu sesuai peranmu!');
    return;
  }

  // Students without role cannot open any pack
  if (!state.isAdmin && !state.studentRole) {
    showToast('⚠️ Selesaikan Tahap 1 dulu untuk memilih peranmu!');
    return;
  }

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
  // Scroll ke atas saat membuka kartu baru
  window.scrollTo({ top: 0, behavior: 'smooth' });

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
  // Only allow admin to save videos
  if (!state.isAdmin) {
    showToast('⚠️ Akses ditolak. Fitur ini hanya untuk guru/admin.');
    return;
  }

  const url = document.getElementById('videoUrlInput').value.trim();
  const title = document.getElementById('videoTitleInput').value.trim();
  const desc = document.getElementById('videoDescInput').value.trim();
  const order = parseInt(document.getElementById('videoOrderInput').value) || 0;

  if (!url) {
    showToast('⚠️ Masukkan link YouTube!'); return;
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    const adminId = localStorage.getItem('admin_id') || '';
    const response = await fetch('/api/admin/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': adminId
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
      showToast('❌ ' + (data.message || 'Gagal menyimpan video'));
    }
  } catch(e) {
    console.error(e);
    showToast('❌ Gagal menyimpan video');
  }
}

async function saveMultipleVideos() {
  // Only allow admin to save videos
  if (!state.isAdmin) {
    showToast('⚠️ Akses ditolak. Fitur ini hanya untuk guru/admin.');
    return;
  }

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
    const adminId = localStorage.getItem('admin_id') || '';
    const response = await fetch('/api/admin/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': adminId
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
      showToast('❌ ' + (data.message || 'Gagal menyimpan video'));
    }
  } catch(e) {
    console.error(e);
    showToast('❌ Gagal menyimpan video');
  }
}

async function deleteVideo(videoId) {
  // Only allow admin to delete videos
  if (!state.isAdmin) {
    showToast('⚠️ Akses ditolak. Fitur ini hanya untuk guru/admin.');
    return;
  }

  if (!confirm('Yakin ingin hapus video ini?')) return;

  try {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    const adminId = localStorage.getItem('admin_id') || '';
    const response = await fetch('/api/admin/video/' + videoId, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': adminId
      }
    });

    const data = await response.json();
    if (data.success) {
      await refreshVideos();
      showToast('🗑️ Video berhasil dihapus!');
    } else {
      showToast('❌ ' + (data.message || 'Gagal menghapus video'));
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
  // Only allow admin to clear videos
  if (!state.isAdmin) {
    showToast('⚠️ Akses ditolak. Fitur ini hanya untuk guru/admin.');
    return;
  }

  if (!confirm('Yakin ingin hapus semua video?')) return;
  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const adminId = localStorage.getItem('admin_id') || '';
    fetch('/api/admin/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': adminId
      },
      body: JSON.stringify({ stage: 'tahap2', videos: [] })
    }).then((response) => {
      if (response.ok) {
        refreshVideos();
        showToast('🗑️ Semua video berhasil dihapus!');
      } else {
        showToast('❌ Gagal menghapus video');
      }
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
window.openMateriModal = openMateriModal;

// ══════════════════ MODAL MATERI LITERASI ══════════════════
function openMateriModal() {
  openModal('modal-materi');
}
window.openMateriModal = openMateriModal;

// ══════════════════ MATERI LITERASI - TAB SWITCHING ══════════════════
let currentMateriTab = 'materi';
let materiCache = [];
let questionsCache = [];
let studentAnswers = {};

function showMateriTab(tab) {
  currentMateriTab = tab;
  
  const tabMateri = document.getElementById('tab-materi');
  const tabQuestions = document.getElementById('tab-questions');
  const tabMateriBtn = document.getElementById('tab-materi-btn');
  const tabQuestionsBtn = document.getElementById('tab-questions-btn');
  
  if (tab === 'materi') {
    tabMateri.style.display = 'block';
    tabQuestions.style.display = 'none';
    tabMateriBtn.className = 'btn-sm green';
    tabMateriBtn.style.flex = '1';
    tabQuestionsBtn.className = 'btn-sm';
    tabQuestionsBtn.style.background = 'var(--gray-200)';
    tabQuestionsBtn.style.color = 'var(--dark)';
    tabQuestionsBtn.style.flex = '1';
    
    // Load materials if not cached
    if (materiCache.length === 0) {
      loadMateriMaterials();
    }
  } else {
    tabMateri.style.display = 'none';
    tabQuestions.style.display = 'block';
    tabQuestionsBtn.className = 'btn-sm green';
    tabQuestionsBtn.style.flex = '1';
    tabMateriBtn.className = 'btn-sm';
    tabMateriBtn.style.background = 'var(--gray-200)';
    tabMateriBtn.style.color = 'var(--dark)';
    tabMateriBtn.style.flex = '1';
    
    // Load questions if not cached
    if (questionsCache.length === 0) {
      loadMateriQuestions();
    }
  }
}
window.showMateriTab = showMateriTab;

// ══════════════════ MATERI LITERASI - LOAD & RENDER ══════════════════
async function loadMateriMaterials() {
  const loading = document.getElementById('materi-loading');
  const container = document.getElementById('materi-content');
  const token = localStorage.getItem('eclypse_token') || window.currentToken;
  
  try {
    const url = token ? '/api/student/materi?token=' + encodeURIComponent(token) : '/api/student/materi';
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Gagal memuat materi');
    
    const data = await response.json();
    materiCache = data.data || data;
    
    renderMateriMaterials();
    
    loading.style.display = 'none';
  } catch (error) {
    loading.innerHTML = '<span style="color:#dc2626">⚠️ Gagal memuat materi. <a href="#" onclick="loadMateriMaterials();return false">Coba lagi</a></span>';
    console.error('Error loading materials:', error);
  }
}

function renderMateriMaterials() {
  const container = document.getElementById('materi-content');
  
  if (!materiCache || materiCache.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:2rem">Belum ada materi tersedia.</p>';
    return;
  }
  
  let html = '';
  materiCache.forEach((material, index) => {
    const borderColor = material.border_color || '#1B4332';
    const icon = material.icon || '📦';
    
    html += `
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid ${borderColor}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">${icon}</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">${material.title}</span>
        </div>
        <div class="materi-content-body">${material.content || ''}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ══════════════════ MATERI LITERASI - QUESTIONS ══════════════════
async function loadMateriQuestions() {
  const loading = document.getElementById('questions-loading');
  const container = document.getElementById('questions-content');
  const submitArea = document.getElementById('questions-submit-area');
  
  try {
    // Load questions
    const token2 = localStorage.getItem('eclypse_token') || window.currentToken;
    const matUrl = token2 ? '/api/student/materi?token=' + encodeURIComponent(token2) : '/api/student/materi';
    const questionsResponse = await fetch(matUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!questionsResponse.ok) throw new Error('Gagal memuat pertanyaan');
    
    const questionsData = await questionsResponse.json();
    questionsCache = questionsData.data || questionsData;
    
    // Load existing answers
    const ansUrl = token2 ? '/api/student/materi/answers?token=' + encodeURIComponent(token2) : '/api/student/materi/answers';
    const answersResponse = await fetch(ansUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (answersResponse.ok) {
      const answersData = await answersResponse.json();
      const answers = answersData.data || answersData;
      
      // Build answer map
      studentAnswers = {};
      if (Array.isArray(answers)) {
        answers.forEach(a => {
          studentAnswers[a.question_id] = a.answer;
        });
      }
    }
    
    renderMateriQuestions();
    
    loading.style.display = 'none';
    if (questionsCache.length > 0) {
      submitArea.style.display = 'block';
    }
  } catch (error) {
    loading.innerHTML = '<span style="color:#dc2626">⚠️ Gagal memuat pertanyaan. <a href="#" onclick="loadMateriQuestions();return false">Coba lagi</a></span>';
    console.error('Error loading questions:', error);
  }
}

function renderMateriQuestions() {
  const container = document.getElementById('questions-content');
  
  if (!questionsCache || questionsCache.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:2rem;background:white;border-radius:12px">
        <p style="color:#888;margin-bottom:0.75rem">Belum ada pertanyaan dari guru.</p>
        <p style="font-size:0.8rem;color:#aaa">Silakan baca materi terlebih dahulu, kemudian periksa kembali nanti.</p>
      </div>
    `;
    document.getElementById('questions-submit-area').style.display = 'none';
    return;
  }
  
  let html = '';
  let questionIndex = 0;
  
  questionsCache.forEach((material, mIndex) => {
    const questions = material.questions || [];
    if (questions.length === 0) return;
    
    const borderColor = material.border_color || '#1B4332';
    const icon = material.icon || '📦';
    
    html += `
      <div style="background:white;border-radius:12px;padding:1rem;margin-bottom:1rem;box-shadow:0 2px 8px rgba(29,67,50,0.08);border-left:4px solid ${borderColor}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:0.75rem">
          <span style="font-size:1rem">${icon}</span>
          <span style="font-weight:700;color:#1B4332;font-size:0.9rem">${material.title}</span>
        </div>
    `;
    
    questions.forEach((q, qIndex) => {
      questionIndex++;
      const qId = q.id;
      const savedAnswer = studentAnswers[qId] || '';
      
      html += `
        <div style="margin-bottom:1rem">
          <label style="display:block;font-size:0.85rem;font-weight:600;color:#333;margin-bottom:6px">
            ${questionIndex}. ${q.question_text}
          </label>
          <textarea 
            id="materi-answer-${qId}"
            placeholder="Tulis jawaban kamu di sini..."
            style="width:100%;min-height:80px;padding:0.65rem;border:1px solid #d1d5db;border-radius:8px;font-size:0.85rem;resize:vertical;box-sizing:border-box;font-family:inherit"
          >${savedAnswer}</textarea>
        </div>
      `;
    });
    
    html += '</div>';
  });
  
  if (questionIndex === 0) {
    html = `
      <div style="text-align:center;padding:2rem;background:white;border-radius:12px">
        <p style="color:#888">Belum ada pertanyaan dari guru.</p>
      </div>
    `;
    document.getElementById('questions-submit-area').style.display = 'none';
  }
  
  container.innerHTML = html;
}

// ══════════════════ MATERI LITERASI - SUBMIT ANSWERS ══════════════════
async function submitMateriAnswers() {
  const btn = document.getElementById('btn-submit-materi');
  const originalText = btn.innerHTML;
  
  // Collect all answers
  const answers = [];
  questionsCache.forEach(material => {
    const questions = material.questions || [];
    questions.forEach(q => {
      const textarea = document.getElementById(`materi-answer-${q.id}`);
      if (textarea) {
        const answer = textarea.value.trim();
        if (answer) {
          answers.push({
            question_id: q.id,
            answer: answer
          });
        }
      }
    });
  });
  
  if (answers.length === 0) {
    showToast('Tidak ada jawaban untuk disimpan', 'warning');
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '⏳ Menyimpan...';
  
  try {
    const submitToken = localStorage.getItem('eclypse_token') || window.currentToken;
    const submitUrl = submitToken ? '/api/student/materi/answers?token=' + encodeURIComponent(submitToken) : '/api/student/materi/answers';
    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers: answers })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menyimpan jawaban');
    }
    
    showToast('Jawaban berhasil disimpan! ✓', 'success');
    
    // Update cache
    answers.forEach(a => {
      studentAnswers[a.question_id] = a.answer;
    });
    
  } catch (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    console.error('Error submitting answers:', error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}
window.submitMateriAnswers = submitMateriAnswers;

// ══════════════════ MATERI LITERASI - OPEN MODAL WITH AUTO-LOAD ══════════════════
function openMateriModal() {
  openModal('modal-materi');
  
  // Reset state
  materiCache = [];
  questionsCache = [];
  studentAnswers = {};
  currentMateriTab = 'materi';
  
  // Reset tabs
  const tabMateri = document.getElementById('tab-materi');
  const tabQuestions = document.getElementById('tab-questions');
  const tabMateriBtn = document.getElementById('tab-materi-btn');
  const tabQuestionsBtn = document.getElementById('tab-questions-btn');
  
  if (tabMateri) {
    tabMateri.style.display = 'block';
    tabMateriBtn.className = 'btn-sm green';
    tabMateriBtn.style.flex = '1';
  }
  if (tabQuestions) {
    tabQuestions.style.display = 'none';
    tabQuestionsBtn.className = 'btn-sm';
    tabQuestionsBtn.style.background = 'var(--gray-200)';
    tabQuestionsBtn.style.color = 'var(--dark)';
    tabQuestionsBtn.style.flex = '1';
  }
  
  // Load materials immediately
  loadMateriMaterials();
}
window.openMateriModal = openMateriModal;

// ══════════════════ RICH TEXT EDITOR FUNCTIONS ══════════════════

// Format selected text in the contenteditable editor
function formatText(command, value = null) {
  document.execCommand(command, false, value);
  // Focus back to editor
  const editor = document.getElementById('materiContentEditor');
  if (editor) {
    editor.focus();
  }
}

// Clear formatting
function clearFormat() {
  document.execCommand('removeFormat', false, null);
  const editor = document.getElementById('materiContentEditor');
  if (editor) {
    editor.focus();
  }
}

// Export to global scope
window.formatText = formatText;
window.clearFormat = clearFormat;

// ══════════════════ ADMIN MATERI MANAGEMENT ══════════════════
let adminMateriTab = 'materials';
let adminMaterials = [];
let adminQuestions = [];
let currentEditMateriId = null;
let currentEditQuestionId = null;

function showAdminMateriTab(tab) {
  adminMateriTab = tab;
  
  const materialsTab = document.getElementById('admin-materials-tab');
  const questionsTab = document.getElementById('admin-questions-tab');
  const materialsBtn = document.getElementById('admin-materi-tab-btn');
  const questionsBtn = document.getElementById('admin-questions-tab-btn');
  
  if (tab === 'materials') {
    materialsTab.style.display = 'block';
    questionsTab.style.display = 'none';
    materialsBtn.className = 'btn-sm green';
    materialsBtn.style.flex = '1';
    questionsBtn.className = 'btn-sm';
    questionsBtn.style.background = 'var(--gray-200)';
    questionsBtn.style.color = 'var(--dark)';
    questionsBtn.style.flex = '1';
    
    if (adminMaterials.length === 0) loadAdminMaterials();
  } else {
    materialsTab.style.display = 'none';
    questionsTab.style.display = 'block';
    questionsBtn.className = 'btn-sm green';
    questionsBtn.style.flex = '1';
    materialsBtn.className = 'btn-sm';
    materialsBtn.style.background = 'var(--gray-200)';
    materialsBtn.style.color = 'var(--dark)';
    materialsBtn.style.flex = '1';
    
    if (adminMaterials.length === 0) loadAdminMaterials();
    populateMateriSelect();
  }
}
window.showAdminMateriTab = showAdminMateriTab;

function getAdminHeaders() {
  const adminId = localStorage.getItem('admin_id');
  return {
    'Content-Type': 'application/json',
    'X-Admin-Id': adminId || '',
    'Accept': 'application/json'
  };
}

async function loadAdminMaterials() {
  const container = document.getElementById('adminMaterialsList');
  container.innerHTML = '<p style="text-align:center;color:#888;padding:1rem">Memuat...</p>';
  
  try {
    const response = await fetch('/api/admin/literasi/materials', {
      headers: getAdminHeaders()
    });
    
    if (!response.ok) throw new Error('Gagal memuat');
    
    const data = await response.json();
    adminMaterials = data.data || data;
    
    renderAdminMaterials();
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#dc2626;padding:1rem">Gagal memuat data</p>';
    console.error('Error:', error);
  }
}
window.loadAdminMaterials = loadAdminMaterials;

function renderAdminMaterials() {
  const container = document.getElementById('adminMaterialsList');
  
  if (!adminMaterials || adminMaterials.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:1rem">Belum ada materi</p>';
    return;
  }
  
  let html = '<div style="display:flex;flex-direction:column;gap:8px">';
  
  adminMaterials.forEach((mat, idx) => {
    const borderColor = mat.border_color || '#1B4332';
    html += `
      <div style="background:white;border-radius:10px;padding:12px;border-left:4px solid ${borderColor};box-shadow:0 1px 4px rgba(0,0,0,0.08)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:1.1rem">${mat.icon || '📦'}</span>
          <strong style="font-size:0.9rem;color:#1B4332">${mat.title}</strong>
        </div>
        ${mat.subtitle ? `<p style="font-size:0.78rem;color:#666;margin:0 0 6px 0">${mat.subtitle}</p>` : ''}
        <div style="display:flex;gap:6px">
          <button class="btn-sm" style="padding:4px 10px;font-size:0.75rem;background:var(--green-pale);color:var(--green-deep)" onclick="editMateri(${mat.id})">✏️ Edit</button>
          <button class="btn-sm" style="padding:4px 10px;font-size:0.75rem;background:#fee2e2;color:#dc2626" onclick="confirmDeleteMateri(${mat.id}, '${mat.title.replace(/'/g, "\\'")}')">🗑️ Hapus</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function editMateri(id) {
  const mat = adminMaterials.find(m => m.id === id);
  if (!mat) return;

  currentEditMateriId = id;
  document.getElementById('materiId').value = id;
  document.getElementById('materiTitle').value = mat.title || '';
  document.getElementById('materiSubtitle').value = mat.subtitle || '';
  document.getElementById('materiIcon').value = mat.icon || '📦';
  document.getElementById('materiBorderColor').value = mat.border_color || '#1B4332';

  // Set content in the contenteditable editor
  const editor = document.getElementById('materiContentEditor');
  const hiddenContent = document.getElementById('materiContent');
  if (editor) {
    editor.innerHTML = mat.content || '';
  }
  if (hiddenContent) {
    hiddenContent.value = mat.content || '';
  }

  showToast('Mode edit aktif', 'info');
}

function resetMateriForm() {
  currentEditMateriId = null;
  document.getElementById('materiId').value = '';
  document.getElementById('materiTitle').value = '';
  document.getElementById('materiSubtitle').value = '';
  document.getElementById('materiIcon').value = '📦';
  document.getElementById('materiBorderColor').value = '#1B4332';

  // Clear contenteditable editor
  const editor = document.getElementById('materiContentEditor');
  const hiddenContent = document.getElementById('materiContent');
  if (editor) {
    editor.innerHTML = '';
  }
  if (hiddenContent) {
    hiddenContent.value = '';
  }
}

async function saveMateri() {
  const id = document.getElementById('materiId').value;
  const title = document.getElementById('materiTitle').value.trim();
  const subtitle = document.getElementById('materiSubtitle').value.trim();
  const icon = document.getElementById('materiIcon').value.trim();
  const borderColor = document.getElementById('materiBorderColor').value.trim();

  // Get content from contenteditable editor
  const editor = document.getElementById('materiContentEditor');
  const content = editor ? editor.innerHTML : '';

  if (!title) {
    showToast('Judul harus diisi', 'warning');
    return;
  }

  if (!content || content.trim() === '') {
    showToast('Konten materi harus diisi', 'warning');
    return;
  }

  const payload = { title, subtitle, icon, border_color: borderColor, content };
  const isEdit = !!id;

  try {
    const url = isEdit ? `/api/admin/literasi/materials/${id}` : '/api/admin/literasi/materials';
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Gagal menyimpan');

    showToast(isEdit ? 'Materi berhasil diupdate!' : 'Materi berhasil ditambahkan!', 'success');

    resetMateriForm();
    loadAdminMaterials();

  } catch (error) {
    showToast('Gagal menyimpan materi', 'error');
    console.error('Error:', error);
  }
}
window.saveMateri = saveMateri;
window.resetMateriForm = resetMateriForm;
window.editMateri = editMateri;

function confirmDeleteMateri(id, title) {
  document.getElementById('deleteConfirmId').value = id;
  document.getElementById('deleteConfirmType').value = 'materi';
  document.getElementById('deleteConfirmMessage').textContent = `Hapus materi "${title}"? Tindakan ini juga akan menghapus semua pertanyaan terkait.`;
  openModal('modal-confirm-delete');
}

function populateMateriSelect() {
  const select = document.getElementById('questionMaterialSelect');
  select.innerHTML = '<option value="">-- Pilih Materi --</option>';
  
  adminMaterials.forEach(mat => {
    const opt = document.createElement('option');
    opt.value = mat.id;
    opt.textContent = `${mat.icon || '📦'} ${mat.title}`;
    select.appendChild(opt);
  });
}

// Questions
async function loadAdminQuestions() {
  const container = document.getElementById('adminQuestionsList');
  const materialId = document.getElementById('questionMaterialSelect').value;
  
  if (!materialId) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:1rem">Pilih materi terlebih dahulu...</p>';
    return;
  }
  
  container.innerHTML = '<p style="text-align:center;color:#888;padding:1rem">Memuat...</p>';
  
  try {
    const response = await fetch(`/api/admin/literasi/questions/${materialId}`, {
      headers: getAdminHeaders()
    });
    
    if (!response.ok) throw new Error('Gagal memuat');
    
    const data = await response.json();
    adminQuestions = data.data || data;
    
    renderAdminQuestions();
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#dc2626;padding:1rem">Gagal memuat pertanyaan</p>';
  }
}
window.loadAdminQuestions = loadAdminQuestions;

function renderAdminQuestions() {
  const container = document.getElementById('adminQuestionsList');
  
  if (!adminQuestions || adminQuestions.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;padding:1rem">Belum ada pertanyaan untuk materi ini</p>';
    return;
  }
  
  let html = '<div style="display:flex;flex-direction:column;gap:8px">';
  
  adminQuestions.forEach((q, idx) => {
    html += `
      <div style="background:white;border-radius:10px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
        <div style="margin-bottom:6px">
          <span style="background:var(--green-pale);color:var(--green-deep);font-size:0.75rem;font-weight:700;padding:2px 8px;border-radius:99px;margin-right:6px">#${idx + 1}</span>
          <span style="font-size:0.88rem;color:#333">${q.question_text}</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn-sm" style="padding:4px 10px;font-size:0.75rem;background:var(--green-pale);color:var(--green-deep)" onclick="editMateriQuestion(${q.id})">✏️ Edit</button>
          <button class="btn-sm" style="padding:4px 10px;font-size:0.75rem;background:#fee2e2;color:#dc2626" onclick="confirmDeleteQuestion(${q.id})">🗑️ Hapus</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function editMateriQuestion(id) {
  const q = adminQuestions.find(x => x.id === id);
  if (!q) return;
  
  currentEditQuestionId = id;
  document.getElementById('materiQuestionId').value = id;
  document.getElementById('materiQuestionText').value = q.question_text || '';
  
  showToast('Mode edit aktif', 'info');
}

function resetMateriQuestionForm() {
  currentEditQuestionId = null;
  document.getElementById('materiQuestionId').value = '';
  document.getElementById('materiQuestionText').value = '';
}

async function saveMateriQuestion() {
  const id = document.getElementById('materiQuestionId').value;
  const materialId = document.getElementById('questionMaterialSelect').value;
  const questionText = document.getElementById('materiQuestionText').value.trim();
  
  if (!materialId) {
    showToast('Pilih materi terlebih dahulu', 'warning');
    return;
  }
  
  if (!questionText) {
    showToast('Pertanyaan harus diisi', 'warning');
    return;
  }
  
  const isEdit = !!id;
  const payload = { material_id: materialId, question_text: questionText };
  
  try {
    const url = isEdit ? `/api/admin/literasi/questions/${id}` : '/api/admin/literasi/questions';
    const method = isEdit ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error('Gagal menyimpan');
    
    showToast(isEdit ? 'Pertanyaan berhasil diupdate!' : 'Pertanyaan berhasil ditambahkan!', 'success');
    
    resetMateriQuestionForm();
    loadAdminQuestions();
    
  } catch (error) {
    showToast('Gagal menyimpan pertanyaan', 'error');
  }
}
window.saveMateriQuestion = saveMateriQuestion;
window.resetMateriQuestionForm = resetMateriQuestionForm;
window.editMateriQuestion = editMateriQuestion;

function confirmDeleteQuestion(id) {
  document.getElementById('deleteConfirmId').value = id;
  document.getElementById('deleteConfirmType').value = 'question';
  document.getElementById('deleteConfirmMessage').textContent = 'Hapus pertanyaan ini?';
  openModal('modal-confirm-delete');
}

async function confirmDelete() {
  const id = document.getElementById('deleteConfirmId').value;
  const type = document.getElementById('deleteConfirmType').value;
  
  if (!id) return;
  
  try {
    let url;
    if (type === 'materi') {
      url = `/api/admin/literasi/materials/${id}`;
    } else {
      url = `/api/admin/literasi/questions/${id}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    
    if (!response.ok) throw new Error('Gagal menghapus');
    
    showToast('Berhasil dihapus!', 'success');
    closeModal('modal-confirm-delete');
    
    if (type === 'materi') {
      loadAdminMaterials();
    } else {
      loadAdminQuestions();
    }
    
  } catch (error) {
    showToast('Gagal menghapus', 'error');
  }
}
window.confirmDelete = confirmDelete;

function openManageMateriModal() {
  // Only allow admin/validator to access manage modal
  if (!state.isAdmin) {
    showToast('⚠️ Akses ditolak. Fitur ini hanya untuk guru/admin.');
    return;
  }
  openModal('modal-manage-materi');
  adminMaterials = [];
  adminQuestions = [];
  showAdminMateriTab('materials');
  loadAdminMaterials();
}
window.openManageMateriModal = openManageMateriModal;
