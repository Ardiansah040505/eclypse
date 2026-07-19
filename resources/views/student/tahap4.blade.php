{{-- TAHAP 4: SESI ARGUMEN (DEBAT) --}}

{{-- Navbar --}}
@include('components.navbar')

{{-- ═══════════════════════ TAHAP 4 ═══════════════════════ --}}
<div id="page-tahap4" class="page">
  <div class="content">
    <div class="page-header">
      <div>
        <h2>⚔️ Sesi Argumen</h2>
        <p>Debat berlangsung — argumen berdasarkan fakta dan data</p>
      </div>
      <div id="adminBar4" style="display:none">
        <button class="btn-sm yellow" onclick="openModal('modal-setup-debate')">⚙️ Atur Debat</button>
        <button class="btn-sm yellow" onclick="openModal('modal-kancing')">🔵 Kelola Kancing</button>
        <button class="btn-sm yellow" onclick="openModal('modal-add-debate-rule')">📝 Tambah Aturan</button>
        <button class="btn-sm" style="background:#ff6b6b;color:white" onclick="finishDebateSession()">⏹️ Akhiri Debat</button>
      </div>
    </div>

    {{-- Debate Status Banner --}}
    <div id="debateStatusBanner" class="debate-status-banner" style="margin-bottom:1.5rem;display:none">
      <div id="debateStatusContent"></div>
    </div>

    <div class="prep-rules" style="margin-bottom:1.5rem;padding:1.25rem 1.5rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
        <h3 style="font-size:0.95rem;margin:0">📋 Aturan Debat ECLYPSE</h3>
        <button id="btnManageRules" class="btn-sm" style="background:var(--green-pale);color:var(--green-deep);padding:4px 10px;font-size:0.75rem;display:none" onclick="openAddDebateRule()">
          ⚙️ Kelola Aturan
        </button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.5rem 1rem" id="debateRulesDisplay">
        {{-- Rules will be loaded by JS --}}
      </div>
    </div>

    {{-- No Active Session Message --}}
    <div id="noSessionMessage" class="no-session-message" style="text-align:center;padding:3rem;background:var(--card-bg);border-radius:var(--radius);margin-bottom:1.5rem;display:none">
      <div style="font-size:3rem;margin-bottom:1rem">⚔️</div>
      <h3 style="margin-bottom:0.5rem">Belum Ada Sesi Debat</h3>
      <p style="color:var(--gray);margin-bottom:1rem">Bapak/Ibu Guru belum memulai sesi debat. Silakan tunggu instruksi.</p>
    </div>

    {{-- Debate Board --}}
    <div class="debate-board" id="debateBoard" style="display:none">
      <div class="debate-topic" id="debateTopic">
        💬 "<span id="debateTopicText">Apakah pembatasan industri adalah solusi terbaik untuk mengatasi perubahan iklim?</span>"
      </div>
      <div class="debate-sides" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
        <div class="debate-side side-pro">
          <h4>✅ <span id="proGroupName">Kelompok Hijau</span></h4>
          <div class="kancing-label"><span id="proKancingCount">5</span> kancing tersisa · <span id="proMemberCount">5</span> anggota</div>
          <div class="team-buttons" id="proButtons"></div>
          <div id="proMembersList" class="members-list" style="margin-top:0.75rem;font-size:0.82rem;color:var(--gray)"></div>
          {{-- Notulensi untuk Admin --}}
          <div id="proNotulensi" style="margin-top:1rem;padding-top:0.75rem;border-top:1px dashed var(--green-pale)">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem">📝 Notulensi</div>
            <div id="proNotulensiLog" style="max-height:100px;overflow-y:auto;font-size:0.8rem;margin-bottom:0.5rem"></div>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="text" id="proNotulensiInput" placeholder="Ketik notulensi..." style="flex:1;min-width:0;box-sizing:border-box;padding:6px 10px;border:1px solid var(--green-pale);border-radius:6px;font-size:0.8rem">
              <button class="btn-sm green" style="white-space:nowrap;flex-shrink:0" onclick="addNotulensi('pro')">Kirim</button>
            </div>
          </div>
        </div>
        <div class="debate-side side-con">
          <h4>❌ <span id="conGroupName">Kelompok Merah</span></h4>
          <div class="kancing-label"><span id="conKancingCount">5</span> kancing tersisa · <span id="conMemberCount">5</span> anggota</div>
          <div class="team-buttons" id="conButtons"></div>
          <div id="conMembersList" class="members-list" style="margin-top:0.75rem;font-size:0.82rem;color:var(--gray)"></div>
          {{-- Notulensi untuk Admin --}}
          <div id="conNotulensi" style="margin-top:1rem;padding-top:0.75rem;border-top:1px dashed var(--green-pale)">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem">📝 Notulensi</div>
            <div id="conNotulensiLog" style="max-height:100px;overflow-y:auto;font-size:0.8rem;margin-bottom:0.5rem"></div>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="text" id="conNotulensiInput" placeholder="Ketik notulensi..." style="flex:1;min-width:0;box-sizing:border-box;padding:6px 10px;border:1px solid var(--green-pale);border-radius:6px;font-size:0.8rem">
              <button class="btn-sm green" style="white-space:nowrap;flex-shrink:0" onclick="addNotulensi('con')">Kirim</button>
            </div>
          </div>
        </div>
        <div class="debate-side side-netral">
          <h4>⭐ <span id="thirdGroupName">Kelompok Tim 3</span></h4>
          <div class="kancing-label"><span id="thirdKancingCount">5</span> kancing tersisa · <span id="thirdMemberCount">5</span> anggota</div>
          <div class="team-buttons" id="thirdButtons"></div>
          <div id="thirdMembersList" class="members-list" style="margin-top:0.75rem;font-size:0.82rem;color:var(--gray)"></div>
          {{-- Notulensi untuk Admin --}}
          <div id="thirdNotulensi" style="margin-top:1rem;padding-top:0.75rem;border-top:1px dashed var(--green-pale)">
            <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem">📝 Notulensi</div>
            <div id="thirdNotulensiLog" style="max-height:100px;overflow-y:auto;font-size:0.8rem;margin-bottom:0.5rem"></div>
            <div style="display:flex;gap:0.5rem;align-items:center">
              <input type="text" id="thirdNotulensiInput" placeholder="Ketik notulensi..." style="flex:1;min-width:0;box-sizing:border-box;padding:6px 10px;border:1px solid var(--green-pale);border-radius:6px;font-size:0.8rem">
              <button class="btn-sm green" style="white-space:nowrap;flex-shrink:0" onclick="addNotulensi('netral')">Kirim</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {{-- Argument Log untuk Siswa --}}
    <div class="argument-log" id="argumentLogContainer" style="display:none">
      <div class="section-title" style="margin-bottom:1rem">📝 Log Argumen</div>
      <div id="argumentLog"></div>
      <div class="arg-input-row" id="argInputRow">
        <input type="text" id="argInput" placeholder="Ketik argumenmu..." />
        <button class="btn-send" onclick="sendArgument()">Kirim 💬</button>
      </div>
    </div>
  </div>
</div>
