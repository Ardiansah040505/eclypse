{{-- TAHAP 1: CLIMATE NEWS --}}

{{-- Navbar --}}
@include('components.navbar')

{{-- ═══════════════════════ TAHAP 1 ═══════════════════════ --}}
<div id="page-tahap1" class="page">
  <div class="content">
    <div class="page-header">
      <div>
        <h2>📰 Tahap 1 — Climate News</h2>
        <p>Pilih berita untuk membaca lengkap dan menjawab pertanyaan terkait</p>
      </div>
      <div id="adminBar1" style="display:none">
        <button class="btn-sm yellow" onclick="openSpinWheel()">🎡 Acak Kelompok</button>
        <button class="btn-sm green" onclick="openModal('modal-addnews')">+ Tambah Berita</button>
      </div>
    </div>
    <div id="newsContainer">
      {{-- berita diisi via JS --}}
    </div>
  </div>
</div>

{{-- ═══════════════════════ DETAIL BERITA ═══════════════════════ --}}
<div id="page-news-detail" class="page">
  <div class="content">
    <div id="newsDetailContainer"></div>
  </div>
</div>

{{-- ═══════════════════════ MODAL: PILIH ROLE ═══════════════════════ --}}
<div class="modal-overlay" id="modal-pilih-role">
  <div class="modal-box" style="max-width:600px">
    <div class="modal-header" style="background:linear-gradient(135deg,#1B4332,#2D6A4F);color:white">
      <div class="modal-title" style="color:white">🎭 Pilih Peran Kamu</div>
    </div>
    <div style="padding:1.5rem;text-align:center">
      <p style="margin-bottom:1.5rem;color:#4B5563;font-size:0.95rem">
        Selamat! Kamu sudah menyelesaikan Tahap 1.<br>
        Sekarang pilih <strong>peran</strong> yang akan kamu ambil untuk debat nanti:
      </p>

      <div style="display:flex;flex-direction:column;gap:1rem">
        {{-- Peneliti --}}
        <div onclick="selectRole('peneliti')" style="padding:1.25rem;border:3px solid #1a3a7a;border-radius:12px;cursor:pointer;transition:all 0.3s;background:white" class="role-card" id="role-card-peneliti">
          <div style="font-size:2.5rem;margin-bottom:0.5rem">🔬</div>
          <div style="font-weight:800;font-size:1.1rem;color:#1a3a7a;margin-bottom:0.25rem">Peneliti</div>
          <div style="font-size:0.82rem;color:#6B7280">Data ilmiah & riset tentang krisis iklim</div>
        </div>

        {{-- Aktivis --}}
        <div onclick="selectRole('aktivis')" style="padding:1.25rem;border:3px solid #2e7d32;border-radius:12px;cursor:pointer;transition:all 0.3s;background:white" class="role-card" id="role-card-aktivis">
          <div style="font-size:2.5rem;margin-bottom:0.5rem">🌿</div>
          <div style="font-weight:800;font-size:1.1rem;color:#2e7d32;margin-bottom:0.25rem">Aktivis Lingkungan</div>
          <div style="font-size:0.82rem;color:#6B7280">Fakta dampak plastik & perubahan iklim</div>
        </div>

        {{-- Pedagang --}}
        <div onclick="selectRole('pedagang')" style="padding:1.25rem;border:3px solid #b45309;border-radius:12px;cursor:pointer;transition:all 0.3s;background:white" class="role-card" id="role-card-pedagang">
          <div style="font-size:2.5rem;margin-bottom:0.5rem">🛒</div>
          <div style="font-weight:800;font-size:1.1rem;color:#b45309;margin-bottom:0.25rem">Pedagang</div>
          <div style="font-size:0.82rem;color:#6B7280">Tantangan ekonomi & kebijakan UMKM</div>
        </div>
      </div>

      <p style="margin-top:1rem;font-size:0.78rem;color:#9CA3AF">
        *Pilihanmu tidak bisa diubah setelah disimpan
      </p>
    </div>
  </div>
</div>

<style>
.role-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
.role-card:active {
  transform: translateY(0);
}
.role-selected-peneliti {
  background: #EFF6FF !important;
  box-shadow: 0 0 0 3px #1a3a7a;
}
.role-selected-aktivis {
  background: #F0FDF4 !important;
  box-shadow: 0 0 0 3px #2e7d32;
}
.role-selected-pedagang {
  background: #FFFBEB !important;
  box-shadow: 0 0 0 3px #b45309;
}
</style>
