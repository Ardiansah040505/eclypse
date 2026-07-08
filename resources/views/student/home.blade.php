{{-- HOME PAGE --}}

{{-- ═══════════════════════ HOME ═══════════════════════ --}}
<div id="page-home" class="page">
  <div class="content">
    <div class="hero-banner">
      <div class="hero-tag">🌡️ Climate Learning 2025</div>
      <div class="hero-greeting">👋 Selamat datang di ECLYPSE</div>
      <h2 class="hero-title">Halo, <span id="welcomeName">Siswa</span>!</h2>
      <p>Belajar perubahan iklim melalui berita, investigasi, debat, dan tanya jawab bersama guru.</p>
      <button class="hero-action" onclick="goTo('tahap1')">Mulai Pembelajaran 🚀</button>
      <div class="learning-flow" aria-label="Alur pembelajaran ECLYPSE">
        <button class="flow-step" onclick="goTo('tahap1')"><span class="flow-number">1</span><span class="flow-label">Climate News</span></button>
        <button class="flow-step" onclick="goTo('tahap2')"><span class="flow-number">2</span><span class="flow-label">Video & Kartu</span></button>
        <button class="flow-step" onclick="goTo('tahap3')"><span class="flow-number">3</span><span class="flow-label">Persiapan</span></button>
        <button class="flow-step" onclick="goTo('tahap4')"><span class="flow-number">4</span><span class="flow-label">Argumen</span></button>
        <button class="flow-step" onclick="goTo('tahap5')"><span class="flow-number">5</span><span class="flow-label">Tanya Jawab</span></button>
      </div>
      <div class="progress-wrap" id="progressWrap">
        <div class="progress-label-row">
          <span>📈 Progres Belajarmu</span>
          <span id="progressPercentText">0%</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="progressBarFill" style="width:0%"></div>
        </div>
      </div>
    </div>

    <div id="adminOnlinePanel" style="display:none;background:white;border-radius:var(--radius);padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 2px 16px rgba(0,0,0,0.07);border-left:4px solid #4DA6FF">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:0.75rem">
        <div style="font-weight:800;font-size:1.05rem;color:var(--dark)">🟢 Siswa Sedang Online</div>
        <div style="background:#e6f9ef;color:#1a6b3a;font-weight:800;font-size:0.85rem;padding:4px 14px;border-radius:99px" id="onlineCountBadge">0 online</div>
      </div>
      <div id="onlineListContainer" style="display:flex;flex-wrap:wrap;gap:8px"></div>
    </div>

    <div class="section-title">🗺️ Jelajahi Tahap Pembelajaran</div>
    <div class="stages-grid">
      <div class="stage-card green" onclick="goTo('tahap1')">
        <span class="stage-icon">📰</span>
        <div class="stage-label">Tahap 1</div>
        <div class="stage-title">Climate News</div>
        <div class="stage-desc">Baca berita terkini tentang perubahan iklim dan jawab pertanyaan pemahaman.</div>
        <div class="stage-status">✅ Mulai Sekarang</div>
      </div>
      <div class="stage-card yellow" onclick="goTo('tahap2')">
        <span class="stage-icon">🎬</span>
        <div class="stage-label">Tahap 2</div>
        <div class="stage-title">Video & Eco Cards</div>
        <div class="stage-desc">Tonton video edukatif dan buka 3 paket Eco Cards — sobek bungkusnya untuk mengungkap 6 kartu per paket!</div>
        <div class="stage-status">✅ Mulai Sekarang</div>
      </div>
      <div class="stage-card green" onclick="goTo('tahap3')">
        <span class="stage-icon">🛡️</span>
        <div class="stage-label">Tahap 3</div>
        <div class="stage-title">Preparation Room</div>
        <div class="stage-desc">Diskusikan pertanyaan pemantik bersama kelompokmu untuk mempersiapkan argumen debat.</div>
        <div class="stage-status">✅ Mulai Sekarang</div>
      </div>
      <div class="stage-card earth" onclick="goTo('tahap4')">
        <span class="stage-icon">⚔️</span>
        <div class="stage-label">Tahap 4</div>
        <div class="stage-title">Sesi Argumen</div>
        <div class="stage-desc">Saatnya berdebat! Setiap kelompok berargumen dengan sistem kancing biru.</div>
        <div class="stage-status">✅ Mulai Sekarang</div>
      </div>
      <div class="stage-card green" onclick="goTo('tahap5')">
        <span class="stage-icon">💬</span>
        <div class="stage-label">Tahap 5</div>
        <div class="stage-title">Tanya Jawab Guru</div>
        <div class="stage-desc">Sampaikan pertanyaanmu tentang pembelajaran dan dapatkan jawaban dari guru.</div>
        <div class="stage-status">✅ Mulai Sekarang</div>
      </div>
      <div class="stage-card yellow" onclick="goTo('thankyou')">
        <span class="stage-icon">🎉</span>
        <div class="stage-label">Selesai</div>
        <div class="stage-title">Terima Kasih</div>
        <div class="stage-desc">Kamu telah menyelesaikan semua tahapan pembelajaran ECLYPSE!</div>
        <div class="stage-status">🎉 Selesai!</div>
      </div>
    </div>
  </div>
</div>
