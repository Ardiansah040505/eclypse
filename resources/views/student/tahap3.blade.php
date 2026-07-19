{{-- TAHAP 3: PREPARATION ROOM --}}

{{-- Navbar --}}
@include('components.navbar')

{{-- ═══════════════════════ TAHAP 3 ═══════════════════════ --}}
<div id="page-tahap3" class="page">
  <div class="content">
    <div class="prep-intro">
      <h2>🛡️ Preparation Room</h2>
      <p style="opacity:0.8">Pikirkan dan diskusikan pertanyaan berikut bersama kelompokmu sebelum debat dimulai.</p>
    </div>

    {{-- Pertanyaan Persiapan (Diatas) --}}
    <div id="prepFormContainer"></div>
    <div id="prepFormActions" style="display:none;justify-content:flex-end;margin-top:0.5rem">
      <span id="prepStatus" style="font-size:0.85rem;color:var(--gray);margin-right:1rem"></span>
      <button id="prepSubmitBtn" class="btn-sm green" style="padding:10px 24px;font-weight:700;font-size:0.9rem" onclick="submitPrepAnswers()">✅ Kirim Jawaban</button>
    </div>

    {{-- Kelompok Debat (Dibawah) --}}
    <div class="groups-section" style="margin-top:2rem">
      <div class="section-title" style="margin-bottom:0.75rem">👥 Kelompok Debat</div>
      <div id="adminBar3" style="display:none">
        <button class="btn-sm green" style="margin-bottom:1rem" onclick="openModal('modal-addgroup')">+ Tambah Kelompok</button>
      </div>
      <div id="onlineStudentsPanel"></div>
      <div id="groupsContainer"></div>
    </div>
  </div>
</div>
