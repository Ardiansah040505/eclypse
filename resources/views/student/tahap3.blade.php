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
    <div class="prep-rules" style="margin-bottom:1.5rem">
      <h3>✏️ Ayo merancang argumenmu melalui pertanyaan-pertanyaan ini</h3>
      <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1.25rem">Gunakan fakta dari berita dan eco cards yang sudah kamu pelajari!</p>

      <div class="rule-item">
        <div class="rule-num" style="background:var(--yellow);color:var(--dark)">1</div>
        <div class="rule-text" style="width:100%">
          <div style="margin-bottom:0.6rem"><strong>Menurut kamu</strong>, apa dampak terbesar perubahan iklim yang paling dirasakan masyarakat Indonesia saat ini?</div>
          <textarea class="pemantik-answer" placeholder="Tuliskan jawabanmu di sini..." rows="3" oninput="savePemantikAnswer(0, this.value)" style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.6rem 0.8rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--green-pale)'"></textarea>
        </div>
      </div>

      <div class="rule-item">
        <div class="rule-num" style="background:var(--yellow);color:var(--dark)">2</div>
        <div class="rule-text" style="width:100%">
          <div style="margin-bottom:0.6rem"><strong>Siapa yang paling bertanggung jawab</strong> atas perubahan iklim — individu, industri, atau pemerintah? Jelaskan alasanmu!</div>
          <textarea class="pemantik-answer" placeholder="Jelaskan alasanmu..." rows="3" oninput="savePemantikAnswer(1, this.value)" style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.6rem 0.8rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--green-pale)'"></textarea>
        </div>
      </div>

      <div class="rule-item">
        <div class="rule-num" style="background:var(--yellow);color:var(--dark)">3</div>
        <div class="rule-text" style="width:100%">
          <div style="margin-bottom:0.6rem"><strong>Jika kamu jadi pembuat kebijakan</strong>, langkah apa yang pertama kali kamu ambil untuk mengatasi krisis iklim di Indonesia?</div>
          <textarea class="pemantik-answer" placeholder="Tuliskan langkah-langkahmu..." rows="3" oninput="savePemantikAnswer(2, this.value)" style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.6rem 0.8rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--green-pale)'"></textarea>
        </div>
      </div>

      <div class="rule-item">
        <div class="rule-num" style="background:var(--yellow);color:var(--dark)">4</div>
        <div class="rule-text" style="width:100%">
          <div style="margin-bottom:0.6rem"><strong>Apakah pembatasan industri</strong> adalah solusi yang adil untuk negara berkembang seperti Indonesia? Setuju atau tidak setuju?</div>
          <textarea class="pemantik-answer" placeholder="Tulis pendapatmu, setuju atau tidak setuju beserta alasannya..." rows="3" oninput="savePemantikAnswer(3, this.value)" style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.6rem 0.8rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--green-pale)'"></textarea>
        </div>
      </div>

      <div class="rule-item" style="border-bottom:none">
        <div class="rule-num" style="background:var(--yellow);color:var(--dark)">5</div>
        <div class="rule-text" style="width:100%">
          <div style="margin-bottom:0.6rem"><strong>Dari eco cards yang sudah kamu buka</strong>, fakta mana yang paling mengejutkan? Bagaimana fakta itu mendukung posisi kelompokmu dalam debat?</div>
          <textarea class="pemantik-answer" placeholder="Tuliskan fakta yang paling mengejutkan dan hubungannya dengan argumenmu..." rows="3" oninput="savePemantikAnswer(4, this.value)" style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.6rem 0.8rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--green-pale)'"></textarea>
        </div>
      </div>

      <div style="margin-top:1.25rem;display:flex;justify-content:flex-end;align-items:center;gap:0.75rem">
        <span id="pemantikSubmitStatus" style="font-size:0.8rem;color:var(--gray);font-weight:600"></span>
        <button class="btn-sm green" id="pemantikSubmitBtn" onclick="submitPemantikAnswers()">Submit Jawaban ✅</button>
      </div>
    </div>

    <div class="groups-section">
      <div class="section-title" style="margin-bottom:0.75rem">👥 Kelompok Debat</div>
      <div id="adminBar3" style="display:none">
        <button class="btn-sm green" style="margin-bottom:1rem" onclick="openModal('modal-addgroup')">+ Tambah Kelompok</button>
      </div>
      <div id="onlineStudentsPanel"></div>
      <div id="groupsContainer"></div>
    </div>
  </div>
</div>
