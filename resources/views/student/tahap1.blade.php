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
