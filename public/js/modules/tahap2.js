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

// ══════════════════ LOAD VIDEO FROM DATABASE ══════════════════
let _videoLoaded = false;
async function loadVideoData() {
    // Prevent multiple calls
    if (_videoLoaded) return;
    _videoLoaded = true;

    try {
        const response = await fetch('/api/video');
        const data = await response.json();
        if (data.success && data.data) {
            state.videoUrl = data.data.youtube_url || '';
            state.videoTitle = data.data.title || 'Video Pembelajaran';
            state.videoDesc = data.data.description
                ? '🌿 <strong>' + data.data.title + ':</strong> ' + data.data.description
                : '🌿 <strong>Judul video:</strong> ' + (data.data.title || 'Video Pembelajaran');
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

  // Reset video player saat render ulang
  resetVideoPlayer();

  // Render video description
  const videoDescEl = document.getElementById('videoDesc');
  if (videoDescEl) {
    videoDescEl.innerHTML = state.videoDesc || '⚠️ Admin belum menambahkan video.';
  }

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

// ══════════════════ VIDEO FUNCTIONS ══════════════════
function stopVideo() {
  const wrap = document.getElementById('videoWrap');
  if (wrap) {
    wrap.innerHTML = `
      <button class="video-placeholder-btn" onclick="loadVideo()">
        <div class="play-circle">▶</div>
        <span>Klik untuk memutar video</span>
      </button>`;
  }
}

function loadVideo() {
  const wrap = document.getElementById('videoWrap');
  const videoDescEl = document.getElementById('videoDesc');

  if (!state.videoUrl) {
    stopVideo();
    if (videoDescEl) videoDescEl.innerHTML = '⚠️ Admin belum menambahkan video.';
    return;
  }

  const videoId = extractYoutubeId(state.videoUrl);
  if (!videoId) {
    stopVideo();
    showToast('⚠️ Link video tidak valid');
    return;
  }

  if (wrap) {
    wrap.innerHTML = `<iframe id="videoFrame" src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="autoplay; encrypted-media; fullscreen"></iframe>`;
  }
}

function resetVideoPlayer() {
  // Reset video ke placeholder saat page dimuat ulang
  const wrap = document.getElementById('videoWrap');
  if (wrap) {
    wrap.innerHTML = `
      <button class="video-placeholder-btn" onclick="loadVideo()">
        <div class="play-circle">▶</div>
        <span>Klik untuk memutar video</span>
      </button>`;
  }
}

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function updateVideo() {
  const url = document.getElementById('videoUrl').value.trim();
  const title = document.getElementById('videoTitleInput').value.trim();
  const desc = document.getElementById('videoDescInput').value.trim();

  if (!url) { showToast('⚠️ Masukkan link YouTube!'); return; }

  try {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    const response = await fetch('/api/admin/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        
      },
      body: JSON.stringify({
        youtube_url: url,
        title: title || 'Video Pembelajaran',
        description: desc || ''
      })
    });

    const data = await response.json();
    if (data.success) {
      state.videoUrl = url;
      state.videoTitle = title || 'Video Pembelajaran';
      state.videoDesc = desc
        ? '🌿 <strong>' + title + ':</strong> ' + desc
        : '🌿 <strong>Judul video:</strong> ' + (title || 'Video Pembelajaran');

      // Reset video wrap
      const videoWrap = document.getElementById('videoWrap');
      const videoDescEl = document.getElementById('videoDesc');
      if (videoWrap) {
        videoWrap.innerHTML = `
          <button class="video-placeholder-btn" onclick="loadVideo()">
            <div class="play-circle">▶</div>
            <span>Klik untuk memutar video</span>
          </button>`;
      }
      if (videoDescEl) videoDescEl.innerHTML = state.videoDesc;

      closeModal('modal-addvideo');
      showToast('✅ Video berhasil disimpan!');
    }
  } catch(e) {
    console.error(e);
    showToast('❌ Gagal menyimpan video');
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
window.resetVideoPlayer = resetVideoPlayer;
window.clearVideo = clearVideo;
window.extractYoutubeId = extractYoutubeId;
window.updateVideo = updateVideo;
window.savePemantikAnswer = savePemantikAnswer;
window.PEMANTIK_QUESTIONS = PEMANTIK_QUESTIONS;
window.submitPemantikAnswers = submitPemantikAnswers;


// CLEAR VIDEO
async function clearVideo() {
  if (!confirm('Yakin ingin hapus video?')) return;
  try {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    await fetch('/api/admin/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ youtube_url: '', title: '', description: '' })
    });
    state.videoUrl = '';
    state.videoTitle = '';
    state.videoDesc = '';
    resetVideoPlayer();
    const vd = document.getElementById('videoDesc');
    if (vd) vd.innerHTML = '⚠️ Video dihapus.';
    document.getElementById('videoTitleInput').value = '';
    document.getElementById('videoUrl').value = '';
    document.getElementById('videoDescInput').value = '';
    closeModal('modal-addvideo');
    showToast('🗑 Video berhasil dihapus!');
  } catch(e) {
    showToast('❌ Gagal menghapus video');
  }
}

window.clearVideo = clearVideo;
