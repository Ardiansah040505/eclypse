{{-- TAHAP 2: VIDEO & ECO CARDS --}}

{{-- Navbar --}}
@include('components.navbar')

{{-- ═══════════════════════ TAHAP 2 ═══════════════════════ --}}
<div id="page-tahap2" class="page">
  <div class="content">
    <div class="page-header">
      <div>
        <h2>🎬 Tahap 2 — Video & Eco Cards</h2>
        <p>Tonton video dan pelajari kartu ekologi iklim</p>
      </div>
      <div id="adminBar2" style="display:none">
        <button class="btn-sm green" onclick="openModal('modal-addvideo')">+ Ubah Video</button>
      </div>
    </div>
    <div class="video-section">
      <div class="section-title">🎥 Video Pembelajaran</div>
      <p style="font-size:0.85rem;color:var(--gray)">Saksikan video berikut untuk memahami lebih dalam tentang perubahan iklim global.</p>
      <div class="video-embed-wrap" id="videoWrap">
        <button class="video-placeholder-btn" onclick="loadVideo()">
          <div class="play-circle">▶</div>
          <span>Klik untuk memutar video</span>
        </button>
      </div>
      <div style="margin-top:1rem;padding:0.75rem 1rem;background:var(--green-pale);border-radius:var(--radius-sm);font-size:0.83rem;color:var(--green-deep)" id="videoDesc">
        🌿 <strong>Judul video:</strong> Krisis Iklim — Mengapa Kita Harus Peduli?
      </div>
    </div>
    <div class="eco-section">
      <div class="section-title">🃏 Eco Climate Cards <span style="font-size:0.78rem;font-weight:600;color:var(--gray);margin-left:8px">3 paket · 6–7 kartu per paket</span></div>
      <div id="roleAssignedMessage" style="display:none;margin-bottom:1rem;padding:0.75rem 1rem;background:#fef3c7;border-radius:8px;font-size:0.85rem;color:#92400e"></div>
      <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Buka paket sesuai role yang kamu dapat dan pelajari data faktual yang akan memperkuat argumenmu di debat! 🎴</p>
      <div id="ecoPacksView">
        <div class="eco-packs" id="ecoPacksGrid"><!-- diisi JS --></div>
      </div>
      <div id="ecoCardsView" style="display:none">
        <div class="eco-pack-view-head">
          <div>
            <div id="ecoPackViewTitle" class="section-title" style="margin:0"></div>
            <div id="ecoPackViewSub" style="font-size:0.78rem;color:var(--gray);margin-top:2px"></div>
          </div>
          <button class="btn-sm" style="background:var(--green-pale);color:var(--green-deep)" onclick="closePackView()">← Kembali ke Paket</button>
        </div>
        <div class="eco-cards-grid" id="ecoCardsGrid"><!-- diisi JS --></div>
      </div>
    </div>
  </div>
</div>
