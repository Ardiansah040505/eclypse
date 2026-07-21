{{-- TAHAP 5: TANYA JAWAB GURU (REFLEKSI) --}}

{{-- Navbar --}}
@include('components.navbar')

{{-- ═══════════════════════ TAHAP 5 ═══════════════════════ --}}
<div id="page-tahap5" class="page">
  <div class="content">
    <div class="page-header">
      <div>
        <h2>💬 Tanya Jawab Guru</h2>
        <p>Tanyakan hal yang masih ingin kamu pahami; guru akan menjawabnya</p>
      </div>
    </div>

    {{-- Student View: Input pertanyaan --}}
    <div id="studentRefleksiView">

      {{-- Student: Pertanyaan Pemantik berdasarkan Role --}}
      <div id="studentPrepQuestionsPanel" style="margin-bottom:1.5rem;background:white;border-radius:var(--radius);padding:1.5rem;box-shadow:0 2px 16px rgba(0,0,0,0.07);border-left:4px solid var(--green);display:none">
        <div style="margin-bottom:1rem">
          <div style="font-weight:800;font-size:1.05rem;color:var(--dark)">📝 Pertanyaan Refleksi</div>
          <div id="studentPrepRoleLabel" style="font-size:0.82rem;color:var(--gray);margin-top:2px"></div>
        </div>
        <div id="studentPrepQuestionsList"></div>
        <div id="noStudentPrepQuestionsMessage" style="text-align:center;padding:1.5rem;color:var(--gray);display:none">
          <div style="font-size:1.8rem;margin-bottom:0.5rem">📝</div>
          <p>Belum ada pertanyaan pemantik dari guru.</p>
        </div>
      </div>

      <div class="refleksi-card">
        <h3>✍️ Tulis Pertanyaanmu</h3>
        <textarea class="refleksi-textarea" id="refleksiInput" placeholder="Hal apa tentang materi, berita, atau debat yang masih ingin kamu tanyakan kepada guru?"></textarea>
        <div style="margin-top:0.75rem;display:flex;justify-content:flex-end;align-items:center;gap:0.75rem">
          <span id="refleksiStatus" style="font-size:0.8rem;color:var(--gray);font-weight:600"></span>
          <button class="btn-sm green" id="refleksiSubmitBtn" onclick="submitRefleksi()">Kirim Pertanyaan ✉️</button>
        </div>
      </div>
    </div>

    {{-- Admin View: Dashboard pertanyaan --}}
    <div id="adminRefleksiView" style="display:none">
      <div class="admin-refleksi-dashboard">
        <div class="refleksi-stats">
          <div class="stat-card total">
            <div class="stat-number" id="totalQuestionsCount">0</div>
            <div class="stat-label">Total Pertanyaan</div>
          </div>
          <div class="stat-card unanswered">
            <div class="stat-number" id="unansweredCount">0</div>
            <div class="stat-label">Belum Dijawab</div>
          </div>
          <div class="stat-card answered">
            <div class="stat-number" id="answeredCount">0</div>
            <div class="stat-label">Sudah Dijawab</div>
          </div>
        </div>

        <div class="filter-tabs">
          <button class="filter-tab active" onclick="filterRefleksi('all')" data-filter="all">
            📋 Semua (<span id="filterAllCount">0</span>)
          </button>
          <button class="filter-tab" onclick="filterRefleksi('unanswered')" data-filter="unanswered">
            ⏳ Belum Dijawab (<span id="filterUnansweredCount">0</span>)
          </button>
          <button class="filter-tab" onclick="filterRefleksi('answered')" data-filter="answered">
            ✅ Sudah Dijawab (<span id="filterAnsweredCount">0</span>)
          </button>
        </div>
      </div>

      {{-- Admin: Kelola Pertanyaan Pemantik --}}
      <div id="adminPrepQuestionsPanel" style="margin-top:1.5rem;background:white;border-radius:var(--radius);padding:1.5rem;box-shadow:0 2px 16px rgba(0,0,0,0.07);border-left:4px solid var(--green)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1rem">
          <div>
            <div style="font-weight:800;font-size:1.05rem;color:var(--dark)">📝 Kelola Pertanyaan Pemantik</div>
            <div style="font-size:0.82rem;color:var(--gray)">Buat pertanyaan berdasarkan role (Peneliti, Aktivis, Pedagang)</div>
          </div>
          <button class="btn-sm green" onclick="openAddRefleksiQuestion()">+ Tambah Pertanyaan</button>
        </div>

        <div class="filter-tabs" style="margin-bottom:1rem">
          <button class="filter-tab active" onclick="filterRefleksiQuestions('all')" data-role="all">📋 Semua</button>
          <button class="filter-tab" onclick="filterRefleksiQuestions('peneliti')" data-role="peneliti">🔬 Peneliti</button>
          <button class="filter-tab" onclick="filterRefleksiQuestions('aktivis')" data-role="aktivis">🌿 Aktivis</button>
          <button class="filter-tab" onclick="filterRefleksiQuestions('pedagang')" data-role="pedagang">🛒 Pedagang</button>
          <button class="filter-tab" onclick="filterRefleksiQuestions('all_role')" data-role="all_role">🌐 Universal (Semua)</button>
        </div>

        <div id="prepQuestionsList"></div>
        <div id="noPrepQuestionsMessage" style="text-align:center;padding:2rem;color:var(--gray)">
          <div style="font-size:2rem;margin-bottom:0.5rem">📝</div>
          <p>Belum ada pertanyaan. Klik "+ Tambah Pertanyaan" untuk membuat.</p>
        </div>
      </div>
    </div>

    {{-- Pertanyaan Siswa & Jawaban Guru --}}
    <div class="section-title" style="margin-top:1.5rem">💭 Pertanyaan & Jawaban</div>
    <div class="comment-list" id="commentList"></div>
    <div id="noRefleksiMessage" style="text-align:center;padding:2rem;background:var(--card-bg);border-radius:var(--radius);display:none">
      <div style="font-size:2.5rem;margin-bottom:0.75rem">💭</div>
      <p style="color:var(--gray)">Belum ada pertanyaan. Jadilah yang pertama bertanya!</p>
    </div>

    <div id="adminRecapPanel" style="display:none;background:white;border-radius:var(--radius);padding:1.5rem;margin-top:1.5rem;box-shadow:0 2px 16px rgba(0,0,0,0.07);border-left:4px solid var(--yellow)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <div>
          <div style="font-weight:800;font-size:1.05rem;color:var(--dark);margin-bottom:4px">📊 Rekap Hasil Belajar Siswa</div>
          <div id="adminRecapSummary" style="font-size:0.85rem;color:var(--gray)">Memuat data...</div>
        </div>
        <button class="btn-sm yellow" onclick="downloadRecapCSV()">⬇️ Download Rekap CSV</button>
      </div>
    </div>

    <div style="margin-top:1.5rem;text-align:center">
      <button class="btn-primary" style="max-width:240px" onclick="goTo('thankyou')">Selesai & Lanjut 🎉</button>
    </div>
  </div>
</div>

{{-- Modal: Jawab Pertanyaan (Admin) --}}
<div class="modal-overlay" id="modal-answer-refleksi">
  <div class="modal-box">
    <div class="modal-header">
      <div class="modal-title">💬 Jawab Pertanyaan</div>
      <button class="modal-close" onclick="closeModal('modal-answer-refleksi')">✕</button>
    </div>
    <div class="modal-form">
      <div id="questionToAnswer" style="margin-bottom:1rem;padding:0.75rem;background:var(--green-pale);border-radius:8px;border-left:4px solid var(--green)">
        <div style="font-size:0.75rem;color:var(--gray);margin-bottom:4px">Pertanyaan dari:</div>
        <div style="font-weight:700;margin-bottom:4px" id="answerQuestionAuthor"></div>
        <div id="answerQuestionText" style="font-size:0.9rem"></div>
      </div>
      <div>
        <label>Jawaban Kamu:</label>
        <textarea id="answerText" placeholder="Tulis jawaban kamu di sini..." style="width:100%;min-height:120px;border:2px solid var(--green-pale);border-radius:8px;padding:0.75rem;font-family:'Nunito',sans-serif;font-size:0.9rem;resize:vertical"></textarea>
      </div>
      <div style="display:flex;gap:0.5rem;margin-top:1rem">
        <button class="btn-sm green" onclick="sendAnswer()">💾 Kirim Jawaban</button>
        <button class="btn-sm" style="background:var(--gray-200);color:var(--dark)" onclick="closeModal('modal-answer-refleksi')">Batal</button>
      </div>
    </div>
  </div>
</div>

{{-- Modal: Tambah/Edit Pertanyaan Pemantik (Admin) --}}
<div class="modal-overlay" id="modal-prep-question">
  <div class="modal-box" style="max-width:600px">
    <div class="modal-header">
      <div class="modal-title">📝 Pertanyaan Pemantik</div>
      <button class="modal-close" onclick="closeModal('modal-prep-question')">✕</button>
    </div>
    <div class="modal-form">
      <div>
        <label>Role / Tipe Pertanyaan</label>
        <select id="prepQuestionRole" style="width:100%;padding:10px;border:2px solid var(--green-pale);border-radius:8px;font-size:0.9rem">
          <option value="peneliti">🔬 Peneliti</option>
          <option value="aktivis">🌿 Aktivis</option>
          <option value="pedagang">🛒 Pedagang</option>
          <option value="all">🌐 Universal (Semua role)</option>
        </select>
        <div style="font-size:0.75rem;color:var(--gray);margin-top:4px">
          🔬 Peneliti = pertanyaan untuk siswa yang memilih Paket Peneliti<br>
          🌿 Aktivis = pertanyaan untuk siswa yang memilih Paket Aktivis<br>
          🛒 Pedagang = pertanyaan untuk siswa yang memilih Paket Pedagang<br>
          🌐 Universal = pertanyaan untuk semua siswa
        </div>
      </div>
      <div style="margin-top:1rem">
        <label>Pertanyaan</label>
        <textarea id="prepQuestionText" placeholder="Tulis pertanyaan di sini..." style="width:100%;min-height:120px;border:2px solid var(--green-pale);border-radius:8px;padding:0.75rem;font-family:'Nunito',sans-serif;font-size:0.9rem;resize:vertical"></textarea>
      </div>
      <div style="display:flex;gap:0.5rem;margin-top:1rem">
        <button class="btn-sm green" id="prepQuestionSaveBtn" onclick="saveRefleksiQuestion()">💾 Simpan</button>
        <button class="btn-sm" style="background:var(--gray-200);color:var(--dark)" onclick="closeModal('modal-prep-question')">Batal</button>
      </div>
    </div>
  </div>
</div>

{{-- ═══════════════════════ THANK YOU ═══════════════════════ --}}
<div id="page-thankyou" class="page">
  <div class="thankyou-content">
    <span class="thankyou-icon">🌍</span>
    <h1>Terima Kasih!</h1>
    <p>Kamu telah menyelesaikan semua tahapan pembelajaran ECLYPSE. Semoga ilmu yang kamu dapat hari ini menjadi bekal untuk menjaga bumi kita bersama.</p>
    <div class="achievement-chips">
      <div class="chip">📰 Climate News ✓</div>
      <div class="chip">🎬 Eco Cards ✓</div>
      <div class="chip">🛡️ Debat Siap ✓</div>
      <div class="chip">⚔️ Berargumen ✓</div>
      <div class="chip">💬 Tanya Jawab ✓</div>
    </div>
    <p style="font-size:0.82rem;opacity:0.6;margin-bottom:1.5rem">🌿 "Bumi tidak mewarisi dari nenek moyang kita, kita meminjamnya dari anak cucu kita."</p>
    <button class="btn-home" onclick="goTo('home')">🏠 Kembali ke Beranda</button>
  </div>
</div>
