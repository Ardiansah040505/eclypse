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
        <button class="btn-sm" style="background:#ff6b6b;color:white" onclick="finishDebateSession()">⏹️ Akhiri Debat</button>
      </div>
    </div>

    {{-- Debate Status Banner --}}
    <div id="debateStatusBanner" class="debate-status-banner" style="margin-bottom:1.5rem;display:none">
      <div id="debateStatusContent"></div>
    </div>

    <div class="prep-rules" style="margin-bottom:1.5rem;padding:1.25rem 1.5rem">
      <h3 style="font-size:0.95rem;margin-bottom:0.75rem">📋 Aturan Debat ECLYPSE</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.5rem 1rem">
        <div class="rule-item" style="padding:8px 0">
          <div class="rule-num">1</div>
          <div class="rule-text"><strong>Kancing Tim:</strong> Setiap tim punya <strong>5 kancing</strong>. Satu argumen = satu kancing berkurang.</div>
        </div>
        <div class="rule-item" style="padding:8px 0">
          <div class="rule-num">2</div>
          <div class="rule-text"><strong>Satu Bicara:</strong> Tidak boleh memotong pembicaraan orang lain.</div>
        </div>
        <div class="rule-item" style="padding:8px 0">
          <div class="rule-num">3</div>
          <div class="rule-text"><strong>Berbasis Fakta:</strong> Argumen wajib berdasarkan data dari Tahap 1 & 2.</div>
        </div>
        <div class="rule-item" style="padding:8px 0;border-bottom:none">
          <div class="rule-num">4</div>
          <div class="rule-text"><strong>Waktu:</strong> Maks <strong>2 menit</strong> per argumen. Moderator beri tanda waktu habis.</div>
        </div>
        <div class="rule-item" style="padding:8px 0;border-bottom:none">
          <div class="rule-num">5</div>
          <div class="rule-text"><strong>Sopan Santun:</strong> Serang ide, bukan orangnya.</div>
        </div>
      </div>
    </div>

    {{-- No Active Session Message --}}
    <div id="noSessionMessage" class="no-session-message" style="text-align:center;padding:3rem;background:var(--card-bg);border-radius:var(--radius);margin-bottom:1.5rem;display:none">
      <div style="font-size:3rem;margin-bottom:1rem">⚔️</div>
      <h3 style="margin-bottom:0.5rem">Belum Ada Sesi Debat</h3>
      <p style="color:var(--gray);margin-bottom:1rem">Guru belum memulai sesi debat. Silakan tunggu instruksi dari guru.</p>
    </div>

    {{-- Debate Board --}}
    <div class="debate-board" id="debateBoard" style="display:none">
      <div class="debate-topic" id="debateTopic">
        💬 "<span id="debateTopicText">Apakah pembatasan industri adalah solusi terbaik untuk mengatasi perubahan iklim?</span>"
      </div>
      <div class="debate-sides">
        <div class="debate-side side-pro">
          <h4>✅ PRO — <span id="proGroupName">Kelompok Hijau</span></h4>
          <div class="kancing-label"><span id="proKancingCount">5</span> kancing tersisa · <span id="proMemberCount">5</span> anggota</div>
          <div class="team-buttons" id="proButtons"></div>
          <div id="proMembersList" class="members-list" style="margin-top:0.75rem;font-size:0.82rem;color:var(--gray)"></div>
        </div>
        <div class="debate-side side-con">
          <h4>❌ KONTRA — <span id="conGroupName">Kelompok Merah</span></h4>
          <div class="kancing-label"><span id="conKancingCount">5</span> kancing tersisa · <span id="conMemberCount">5</span> anggota</div>
          <div class="team-buttons" id="conButtons"></div>
          <div id="conMembersList" class="members-list" style="margin-top:0.75rem;font-size:0.82rem;color:var(--gray)"></div>
        </div>
      </div>
    </div>

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
