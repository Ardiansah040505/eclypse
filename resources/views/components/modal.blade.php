{{-- All Modals Component --}}

{{-- Modal: Login Admin --}}
<div class="modal-overlay" id="modal-admin-login">
  <div class="modal-box" style="max-width:400px">
    <div class="modal-header">
      <div class="modal-title">👤 Login Admin / Guru</div>
      <button class="modal-close" onclick="closeModal('modal-admin-login')">✕</button>
    </div>
    <div class="modal-form">
      <div>
        <label>Username</label>
        <input type="text" id="adminUsername" placeholder="Username admin..." autocomplete="username">
      </div>
      <div>
        <label>Password</label>
        <input type="password" id="adminPassword" placeholder="Password..." autocomplete="current-password"
          onkeydown="if(event.key==='Enter') submitAdminLogin()">
      </div>
      <div id="adminLoginError" style="display:none;color:#e53e3e;font-size:0.85rem;padding:8px 12px;background:#fff5f5;border-radius:8px;border:1px solid #feb2b2"></div>
      <button class="btn-sm green" id="adminLoginBtn" onclick="submitAdminLogin()" style="width:100%;padding:12px;font-size:1rem">
        Masuk sebagai Admin 🔐
      </button>
    </div>
  </div>
</div>

{{-- Modal: Tambah Berita --}}
<div class="modal-overlay" id="modal-addnews">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">📰 Tambah Berita Iklim</div>
      <button class="modal-close" onclick="closeModal('modal-addnews')">✕</button>
    </div>
    <div class="modal-form">
      <div><label>Judul Berita</label><input type="text" id="newsTitle" placeholder="Judul berita..."></div>
      <div>
        <label>Gambar Header (opsional)</label>
        <input type="text" id="newsImage" placeholder="Tempel URL gambar di sini... (https://...)" oninput="previewNewsImage(this.value, 'newsImagePreview')">
        <div id="newsImagePreview" style="margin-top:8px"></div>
      </div>
      <div><label>Isi Berita</label><textarea id="newsBody" placeholder="Isi berita iklim..."></textarea></div>
      <div><label>Tag Kategori</label><input type="text" id="newsTag" placeholder="contoh: Suhu Global"></div>
      <div>
        <label>Soal</label>
        <div id="questionBuilder"></div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button type="button" class="btn-sm yellow" onclick="addQuestionForm('questionBuilder', null, 'mc')">+ Soal Pilihan Ganda</button>
          <button type="button" class="btn-sm" style="background:var(--green-pale);color:var(--green-deep)" onclick="addQuestionForm('questionBuilder', null, 'essay')">+ Soal Esai</button>
        </div>
      </div>
      <button class="btn-sm green" onclick="addNews()">+ Tambahkan</button>
    </div>
  </div>
</div>

{{-- Modal: Edit Berita dan Soal --}}
<div class="modal-overlay" id="modal-editnews">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">✏️ Edit Berita & Soal</div>
      <button class="modal-close" onclick="closeModal('modal-editnews')">✕</button>
    </div>
    <div class="modal-form">
      <div><label>Judul Berita</label><input type="text" id="editNewsTitle"></div>
      <div>
        <label>Gambar Header (opsional)</label>
        <input type="text" id="editNewsImage" placeholder="Tempel URL gambar di sini... (https://...)" oninput="previewNewsImage(this.value, 'editNewsImagePreview')">
        <div id="editNewsImagePreview" style="margin-top:8px"></div>
      </div>
      <div><label>Isi Berita</label><textarea id="editNewsBody"></textarea></div>
      <div><label>Tag Kategori</label><input type="text" id="editNewsTag"></div>
      <div>
        <label>Soal</label>
        <div id="editQuestionBuilder"></div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button type="button" class="btn-sm yellow" onclick="addQuestionForm('editQuestionBuilder', null, 'mc')">+ Soal Pilihan Ganda</button>
          <button type="button" class="btn-sm" style="background:var(--green-pale);color:var(--green-deep)" onclick="addQuestionForm('editQuestionBuilder', null, 'essay')">+ Soal Esai</button>
        </div>
      </div>
      <button class="btn-sm green" onclick="saveNewsEdits()">Simpan Perubahan</button>
    </div>
  </div>
</div>

{{-- Modal: Tambah Soal Berita --}}
<div class="modal-overlay" id="modal-addquestion">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">📝 Tambah Soal Pilihan Ganda</div>
      <button class="modal-close" onclick="closeModal('modal-addquestion')">✕</button>
    </div>
    <div class="modal-form">
      <div id="newQuestionBuilder"></div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button type="button" class="btn-sm yellow" onclick="addQuestionForm('newQuestionBuilder', null, 'mc')">+ Soal Pilihan Ganda</button>
        <button type="button" class="btn-sm" style="background:var(--green-pale);color:var(--green-deep)" onclick="addQuestionForm('newQuestionBuilder', null, 'essay')">+ Soal Esai</button>
      </div>
      <button class="btn-sm green" onclick="saveArticleQuestions()">Simpan Soal</button>
    </div>
  </div>
</div>

{{-- Modal: Atur Video YouTube --}}
<div class="modal-overlay" id="modal-addvideo">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">🎬 Atur Video YouTube</div>
      <button class="modal-close" onclick="closeModal('modal-addvideo')">✕</button>
    </div>
    <div class="modal-form">
      <div><label>Judul Video</label><input type="text" id="videoTitleInput" placeholder="Contoh: Krisis Iklim 2025"></div>
      <div><label>Link YouTube</label><input type="text" id="videoUrl" placeholder="https://youtube.com/watch?v=..."></div>
      <div><label>Deskripsi (opsional)</label><textarea id="videoDescInput" placeholder="Jelaskan isi video ini..." style="min-height:70px"></textarea></div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn-sm green" onclick="updateVideo()">💾 Simpan Video</button>
        <button class="btn-sm" style="background:#ff6b6b;color:white" onclick="clearVideo()">🗑 Hapus Video</button>
      </div>
    </div>
  </div>
</div>

{{-- Modal: Tambah Kelompok --}}
<div class="modal-overlay" id="modal-addgroup">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">👥 Tambah Kelompok</div>
      <button class="modal-close" onclick="closeModal('modal-addgroup')">✕</button>
    </div>
    <div class="modal-form">
      <div><label>Nama Kelompok</label><input type="text" id="groupName" placeholder="nama kelompok..."></div>
      <button class="btn-sm green" onclick="addGroup()">+ Tambahkan</button>
    </div>
  </div>
</div>

{{-- Modal: Atur Kancing (Admin) --}}
<div class="modal-overlay" id="modal-kancing">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">🔵 Pengaturan Kancing Tim</div>
      <button class="modal-close" onclick="closeModal('modal-kancing')">✕</button>
    </div>
    <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Klik satu kancing untuk menguranginya setelah satu anggota tim menyampaikan argumen.</p>
    <div id="kancingControls"></div>
  </div>
</div>

{{-- Modal: Setup Debate (Admin) --}}
<div class="modal-overlay" id="modal-setup-debate">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">⚙️ Atur Sesi Debat</div>
      <button class="modal-close" onclick="closeModal('modal-setup-debate')">✕</button>
    </div>
    <div class="modal-form">
      <div style="margin-bottom:1rem">
        <label>Topik Debat</label>
        <input type="text" id="debateTopicInput" placeholder="Contoh: Apakah pembatasan industri adalah solusi terbaik..." style="width:100%;padding:10px;border:2px solid var(--green-pale);border-radius:8px;font-size:0.9rem">
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1rem">
        <div>
          <label style="color:#74E0A0;font-weight:700">✅ Tim 1</label>
          <select id="proGroupSelect" style="width:100%;padding:10px;border:2px solid #74E0A0;border-radius:8px;font-size:0.9rem">
            <option value="">-- Pilih Kelompok --</option>
          </select>
        </div>
        <div>
          <label style="color:#FF8A80;font-weight:700">❌ Tim 2</label>
          <select id="conGroupSelect" style="width:100%;padding:10px;border:2px solid #FF8A80;border-radius:8px;font-size:0.9rem">
            <option value="">-- Pilih Kelompok --</option>
          </select>
        </div>
        <div>
          <label style="color:#fbbf24;font-weight:700">⭐ Tim 3</label>
          <select id="thirdGroupSelect" style="width:100%;padding:10px;border:2px solid #fbbf24;border-radius:8px;font-size:0.9rem">
            <option value="">-- Pilih Kelompok --</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem">
        <button class="btn-sm green" onclick="startDebateSession()">▶️ Mulai Debat</button>
        <button class="btn-sm yellow" onclick="resetAllKancing()">🔄 Reset Semua Kancing</button>
      </div>

      <div id="sessionStatusInfo" style="margin-top:1rem;padding:0.75rem;background:var(--green-pale);border-radius:8px;font-size:0.85rem;display:none">
        <div id="sessionStatusText"></div>
      </div>
    </div>
  </div>
</div>

{{-- Modal: Confirm Kancing Reduction --}}
<div class="modal-overlay" id="modal-confirm-kancing">
  <div class="modal-box" style="max-width:400px">
    <div class="modal-header">
      <div class="modal-title">⚠️ Kurangi Kancing?</div>
      <button class="modal-close" onclick="closeModal('modal-confirm-kancing')">✕</button>
    </div>
    <div class="modal-form">
      <p style="margin-bottom:1rem">Apakah kamu yakin ingin mengurangi satu kancing dari <strong id="confirmGroupName">Kelompok ini</strong>?</p>
      <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Tindakan ini akan mengurangi kancing tim setelah satu anggota menyampaikan argumen.</p>
      <div style="display:flex;gap:0.5rem">
        <button class="btn-sm yellow" onclick="confirmKancingReduction()">✅ Ya, Kurangi</button>
        <button class="btn-sm" style="background:var(--gray-200);color:var(--dark)" onclick="closeModal('modal-confirm-kancing')">Batal</button>
      </div>
    </div>
  </div>
</div>

{{-- Modal: Add/Edit Debate Rule (Admin) --}}
<div class="modal-overlay" id="modal-add-debate-rule">
  <div class="modal-box" style="max-width:500px">
    <div class="modal-header">
      <div class="modal-title">📝 Aturan Debat</div>
      <button class="modal-close" onclick="closeModal('modal-add-debate-rule')">✕</button>
    </div>
    <div class="modal-form">
      <div style="margin-bottom:1rem">
        <label>Judul Aturan</label>
        <input type="text" id="ruleTitle" placeholder="Contoh: Larangan Interupsi" style="width:100%;padding:10px;border:2px solid var(--green-pale);border-radius:8px;font-size:0.9rem">
      </div>
      <div style="margin-bottom:1rem">
        <label>Deskripsi</label>
        <textarea id="ruleDescription" placeholder="Jelaskan aturan secara detail..." style="width:100%;min-height:100px;padding:10px;border:2px solid var(--green-pale);border-radius:8px;font-size:0.9rem;resize:vertical;font-family:'Nunito',sans-serif"></textarea>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem">
        <button class="btn-sm green" onclick="saveDebateRule()">💾 Simpan</button>
        <button class="btn-sm" style="background:var(--gray-200);color:var(--dark)" onclick="closeModal('modal-add-debate-rule')">Batal</button>
      </div>

      {{-- List of existing rules --}}
      <div style="margin-top:1.5rem;border-top:1px solid var(--green-pale);padding-top:1rem">
        <div style="font-weight:700;margin-bottom:0.75rem;font-size:0.9rem">📋 Aturan yang sudah ada:</div>
        <div id="debateRulesList" style="max-height:250px;overflow-y:auto">
          {{-- Will be loaded by JS --}}
        </div>
      </div>
    </div>
  </div>
</div>
