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
    </div>

    {{-- Video Section (Multiple Videos) --}}
    <div class="video-section">
      <div class="section-title">🎥 Video Pembelajaran</div>
      <p style="font-size:0.85rem;color:var(--gray)">Saksikan video berikut untuk memahami lebih dalam tentang perubahan iklim global.</p>

      {{-- Videos Container --}}
      <div id="videosContainer" class="videos-container">
        {{-- Videos will be rendered by JS --}}
        <div class="video-empty-message">
          <p>Loading videos...</p>
        </div>
      </div>

      {{-- Admin: Add Video Button --}}
      <div id="adminBar2" style="display:none; margin-top: 1rem;">
        <div id="addVideoBtnContainer"></div>
      </div>
    </div>

    {{-- Materi Section --}}
    <div style="margin-top:2rem;padding:1.5rem;background:white;border-radius:16px;box-shadow:0 2px 12px rgba(29,67,50,0.1)">
      <div class="section-title">📖 Materi Literasi Iklim</div>
      <p style="font-size:0.85rem;color:#4B5563;margin:0.75rem 0 1.25rem 0">
        Pelajari 7 kotak materi tentang perubahan iklim — dari <strong>definisi &amp; penyebab</strong>, <strong>dampak</strong>, <strong>plastik &amp; iklim</strong>, hingga <strong>aksi nyata</strong> yang bisa kamu lakukan untuk bumi!
      </p>
      <div style="text-align:center;display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
        <button class="btn-sm green" style="padding:12px 28px;font-weight:700;font-size:0.95rem;border-radius:10px" onclick="openMateriModal()">
          📖 Baca Materi
        </button>
        <button class="btn-sm" id="btn-kelola-materi" style="display:none;padding:12px 20px;font-weight:600;font-size:0.85rem;background:var(--green-pale);color:var(--green-deep);border-radius:10px" onclick="openManageMateriModal()">
          ⚙️ Kelola
        </button>
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

{{-- Modal: Add/Edit Video (Admin) --}}
<x-modal id="modal-addvideo" title="Kelola Video Pembelajaran">
  <div class="admin-video-modal">
    <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Tambahkan video YouTube untuk ditampilkan di Tahap 2.</p>

    {{-- Form Type Toggle --}}
    <div class="form-toggle mb-4" id="formTypeToggle" style="display:none">
      <button type="button" class="btn-sm" onclick="showSingleVideoForm()">📹 Satu Video</button>
      <button type="button" class="btn-sm" onclick="showMultipleVideoForm()">📚 Banyak Video</button>
    </div>

    {{-- Single Video Form --}}
    <div id="singleVideoForm">
      <input type="hidden" id="editingVideoId" value="">
      <div class="form-group">
        <label>Judul Video</label>
        <input type="text" id="videoTitleInput" placeholder="Contoh: Pengenalan Perubahan Iklim" style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px">
      </div>
      <div class="form-group mt-2">
        <label>Link YouTube</label>
        <input type="text" id="videoUrlInput" placeholder="https://www.youtube.com/watch?v=..." style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px">
      </div>
      <div class="form-group mt-2">
        <label>Deskripsi</label>
        <textarea id="videoDescInput" placeholder="Deskripsi singkat video..." rows="3" style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px;resize:vertical"></textarea>
      </div>
      <div class="form-group mt-2">
        <label>Urutan</label>
        <input type="number" id="videoOrderInput" value="0" min="0" style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px">
      </div>
    </div>

    {{-- Multiple Videos Form --}}
    <div id="multipleVideoForm" style="display:none">
      <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Tambahkan beberapa video sekaligus. Biarkan kolom kosong untuk video yang tidak diperlukan.</p>
      <div id="multipleVideoInputs">
        {{-- Generated by JS --}}
      </div>
    </div>

    {{-- Existing Videos List --}}
    <div class="mt-4">
      <h4 style="font-size:0.9rem;font-weight:600;margin-bottom:0.5rem">📋 Video yang Sudah Ada</h4>
      <div id="adminVideoList">
        <p class="text-gray-500 text-sm">Memuat...</p>
      </div>
    </div>
  </div>

  <div slot="footer">
    <button type="button" class="btn-sm" onclick="closeModal('modal-addvideo')">Batal</button>
    <button type="button" class="btn-sm danger" onclick="clearAllVideos()">🗑️ Hapus Semua</button>
    <button type="button" class="btn-sm green" onclick="saveMultipleVideos()">💾 Simpan</button>
  </div>
</x-modal>


<div class="modal-overlay" id="modal-materi">
  <div class="modal-box" style="max-width:820px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden">
    <div class="modal-header" style="background:linear-gradient(135deg,#1B4332,#2D6A4F);color:white;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.4rem">🌿</span>
        <div>
          <div class="modal-title" style="color:white">Menu Literasi — ECO-CLIMATE</div>
        </div>
      </div>
      <button class="modal-close" style="color:white;opacity:0.9" onclick="closeModal('modal-materi')">✕</button>
    </div>
    <div style="max-height:calc(90vh - 140px);overflow-y:auto;padding:1.25rem 1.5rem">

      <!-- Tab Navigation -->
      <div style="display:flex;gap:8px;margin-bottom:1rem">
        <button class="btn-sm green" id="tab-materi-btn" onclick="showMateriTab('materi')" style="flex:1">📖 Materi</button>
        <button class="btn-sm" id="tab-questions-btn" onclick="showMateriTab('questions')" style="flex:1;background:var(--gray-200);color:var(--dark)">✏️ Pertanyaan</button>
      </div>

      <!-- Materi Tab -->
      <div id="tab-materi">
        <div id="materi-loading" style="text-align:center;padding:3rem;color:#888">Memuat materi...</div>
        <div id="materi-content"></div>
      </div>

      <!-- Questions Tab -->
      <div id="tab-questions" style="display:none">
        <div id="questions-loading" style="text-align:center;padding:3rem;color:#888">Memuat pertanyaan...</div>
        <div id="questions-content"></div>
        <div id="questions-submit-area" style="display:none;margin-top:1.5rem;text-align:center">
          <button class="btn-sm green" onclick="submitMateriAnswers()" id="btn-submit-materi" style="padding:10px 32px;font-size:0.9rem">💾 Simpan Jawaban</button>
        </div>
      </div>

      <!-- SUMBER -->
      <div style="background:#f3f4f6;border-radius:12px;padding:1rem;margin-top:1rem">
        <div style="font-weight:800;font-size:0.85rem;color:#1B4332;margin-bottom:6px">Sumber dan Referensi</div>
        <div style="font-size:0.72rem;line-height:1.7;color:#4B5563">
          IPCC. (2023). Climate Change 2023: Synthesis Report.<br>
          KLHK. (2023). Laporan Inventarisasi GRK danMPV Tahun 2023.<br>
          Ford, H. V., et al. (2022). The fundamental links between climate change and marine plastic pollution.<br>
          Tang, K. (2024). Climate change education in Indonesia formal education: A policy analysis.
        </div>
      </div>

    </div>
    <div style="flex-shrink:0;padding:0.75rem 1.5rem;border-top:1px solid #e0e0e0;display:flex;justify-content:flex-end;gap:0.5rem">
      <button class="btn-sm" style="background:var(--gray-200);color:var(--dark);padding:8px 20px" onclick="closeModal('modal-materi')">Tutup</button>
    </div>
  </div>
</div>
{{-- Custom Styles for Videos --}}
<style>
.videos-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.video-item {
  background: var(--white);
  border: 1px solid var(--border-color, #e3e3e0);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.video-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.video-item-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-color, #1b1b18);
}

.video-item-number {
  font-size: 0.75rem;
  color: var(--gray);
  background: var(--bg-gray, #f5f5f5);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.video-item-desc {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--gray);
  padding: 0.5rem;
  background: var(--bg-gray, #f9f9f9);
  border-radius: 6px;
}

.video-embed-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-embed-wrap iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-placeholder-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-placeholder-btn:hover {
  background: linear-gradient(135deg, #2d2d2d 0%, #404040 100%);
}

.video-placeholder-btn:hover .play-circle {
  transform: scale(1.1);
}

.play-circle {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 0.5rem;
  transition: transform 0.2s ease;
}

.video-iframe-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  z-index: 10;
  transition: background 0.2s ease;
}

.video-close-btn:hover {
  background: rgba(0,0,0,0.9);
}

.video-empty-message {
  text-align: center;
  padding: 2rem;
  background: var(--bg-gray, #f5f5f5);
  border-radius: 12px;
  color: var(--gray);
}

.admin-video-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.admin-video-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.admin-video-info {
  flex: 1;
}

.admin-video-actions {
  display: flex;
  gap: 0.5rem;
}

.video-input-group {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.video-input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.video-input-group input,
.video-input-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e3e3e0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.video-input-group input:focus,
.video-input-group textarea:focus {
  outline: none;
  border-color: var(--green);
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: #e3e3e0;
  transition: background 0.2s ease;
}

.btn-xs:hover {
  background: #d0d0d0;
}

.btn-xs.danger {
  background: #fee2e2;
  color: #dc2626;
}

.btn-xs.danger:hover {
  background: #fecaca;
}
</style>
