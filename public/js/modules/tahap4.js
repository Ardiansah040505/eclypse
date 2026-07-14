// ══════════════════════════════════════════════════════════════════════════
// TAHAP 4 - Debat Argumen (API Integration)
// ══════════════════════════════════════════════════════════════════════════

// State for debate (module-level)
let debateState = {
  session: null,
  arguments: [],
  kancingStatus: { pro: 5, con: 5, netral: 5 },
  pollingInterval: null
};

// ══════════════════ RENDER TAHAP 4 ══════════════════
async function renderTahap4() {
  const adminBar = document.getElementById('adminBar4');
  if (adminBar) adminBar.style.display = state.isAdmin ? 'flex' : 'none';

  // Show admin bar only for admin
  const adminBar4 = document.getElementById('adminBar4');
  if (adminBar4) {
    adminBar4.style.display = state.isAdmin ? 'flex' : 'none';
  }

  // Show manage rules button for admin
  const btnManageRules = document.getElementById('btnManageRules');
  if (btnManageRules) {
    btnManageRules.style.display = state.isAdmin ? 'inline-block' : 'none';
  }

  // Load rules from database
  await loadDebateRulesForDisplay();

  // Fetch current debate session
  try {
    const res = await fetch('/api/debate/session');
    const data = await res.json();

    if (data.success && data.data) {
      debateState.session = data.data;
      showDebateBoard(data.data);
      await loadArguments();
      startDebatePolling();
    } else {
      showNoSessionMessage();
    }
  } catch (e) {
    console.error('Error loading debate session:', e);
    showNoSessionMessage();
  }

  // Render kancing controls if admin
  if (state.isAdmin) {
    renderKancingControls();
    loadGroupsForSetup();
  }
}

function showNoSessionMessage() {
  const noSession = document.getElementById('noSessionMessage');
  const debateBoard = document.getElementById('debateBoard');
  const argLogContainer = document.getElementById('argumentLogContainer');
  const statusBanner = document.getElementById('debateStatusBanner');

  if (noSession) noSession.style.display = 'block';
  if (debateBoard) debateBoard.style.display = 'none';
  if (argLogContainer) argLogContainer.style.display = 'none';
  if (statusBanner) statusBanner.style.display = 'none';
}

function showDebateBoard(session) {
  const noSession = document.getElementById('noSessionMessage');
  const debateBoard = document.getElementById('debateBoard');
  const argLogContainer = document.getElementById('argumentLogContainer');
  const statusBanner = document.getElementById('debateStatusBanner');

  if (noSession) noSession.style.display = 'none';
  if (debateBoard) debateBoard.style.display = 'block';
  if (argLogContainer) argLogContainer.style.display = 'block';
  if (statusBanner) statusBanner.style.display = 'block';

  // Update topic
  const topicText = document.getElementById('debateTopicText');
  if (topicText && session.topic) {
    topicText.textContent = session.topic;
  }

  // Update status banner
  updateStatusBanner(session);

  // Update PRO group
  updateGroupDisplay('pro', session.pro_group);

  // Update CON group
  updateGroupDisplay('con', session.con_group);

  // Update THIRD group
  updateGroupDisplay('netral', session.third_group);

  // Update kancing status
  debateState.kancingStatus = session.kancing_status || { pro: 5, con: 5, netral: 5 };
  renderKancingButtons();
}

function updateStatusBanner(session) {
  const banner = document.getElementById('debateStatusBanner');
  const content = document.getElementById('debateStatusContent');
  if (!banner || !content) return;

  banner.className = 'debate-status-banner ' + session.status;

  const statusTexts = {
    'waiting': '⏳ Menunggu... Guru akan segera memulai debat.',
    'active': '⚔️ Debat Sedang Berlangsung!',
    'finished': '🏁 Debat Selesai!'
  };

  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong>${statusTexts[session.status] || 'Status: ' + session.status}</strong>
        ${session.pro_group && session.con_group ? `
          <span style="opacity:0.8;margin-left:1rem">
            ${session.pro_group.name} vs ${session.con_group.name}
          </span>
        ` : ''}
      </div>
      ${session.status === 'active' ? '<span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:99px;font-size:0.8rem">LIVE</span>' : ''}
    </div>
  `;
}

function updateGroupDisplay(side, group) {
  const nameEl = document.getElementById(side + 'GroupName');
  const countEl = document.getElementById(side + 'KancingCount');
  const memberCountEl = document.getElementById(side + 'MemberCount');
  const membersListEl = document.getElementById(side + 'MembersList');

  if (group) {
    if (nameEl) nameEl.textContent = group.name;
    if (countEl) countEl.textContent = group.kancing_count;
    if (memberCountEl) memberCountEl.textContent = group.members?.length || 0;

    if (membersListEl) {
      membersListEl.innerHTML = group.members?.map(m =>
        `<div class="member-item"><div class="member-avatar-sm">${m.name?.charAt(0)?.toUpperCase() || '?'}</div>${m.name}</div>`
      ).join('') || '';
    }
  } else {
    if (nameEl) nameEl.textContent = 'Belum Ditentukan';
    if (countEl) countEl.textContent = '5';
    if (memberCountEl) memberCountEl.textContent = '-';
    if (membersListEl) membersListEl.innerHTML = '<span style="opacity:0.6">Belum ada anggota</span>';
  }
}

function renderKancingButtons() {
  const proTarget = document.getElementById('proButtons');
  const conTarget = document.getElementById('conButtons');
  const thirdTarget = document.getElementById('thirdButtons');

  if (proTarget) {
    proTarget.innerHTML = generateKancingHTML(debateState.kancingStatus.pro, 'pro');
  }
  if (conTarget) {
    conTarget.innerHTML = generateKancingHTML(debateState.kancingStatus.con, 'con');
  }
  if (thirdTarget) {
    thirdTarget.innerHTML = generateKancingHTML(debateState.kancingStatus.netral, 'netral');
  }
}

function generateKancingHTML(count, side) {
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < count) {
      const depletedClass = count <= 2 ? 'depleted' : '';
      html += `<span class="kancing ${depletedClass}" title="Kancing ${i + 1}"></span>`;
    }
  }
  if (count === 0) {
    html = '<span style="font-size:0.82rem;color:#ff6b6b">⚠️ Kancing habis!</span>';
  }
  return html;
}

// ══════════════════ ADMIN KANCING CONTROLS ══════════════════
function renderKancingControls() {
  const kc = document.getElementById('kancingControls');
  if (!kc) return;

  const proCount = debateState.session?.pro_group?.kancing_count ?? 5;
  const conCount = debateState.session?.con_group?.kancing_count ?? 5;
  const thirdCount = debateState.session?.third_group?.kancing_count ?? 5;
  const proName = debateState.session?.pro_group?.name || 'Tim 1';
  const conName = debateState.session?.con_group?.name || 'Tim 2';
  const thirdName = debateState.session?.third_group?.name || 'Tim 3';
  const proId = debateState.session?.pro_group?.id ?? null;
  const conId = debateState.session?.con_group?.id ?? null;
  const thirdId = debateState.session?.third_group?.id ?? null;

  // Jika belum ada group yang di-assign, tampilkan pesan + tombol akhiri
  if (!proId && !conId && !thirdId) {
    kc.innerHTML = `<div style="padding:12px;font-size:0.85rem;color:var(--gray);text-align:center">
      ⚠️ Sesi ini tidak memiliki kelompok.<br>
      <span style="font-size:0.78rem;opacity:0.7">Akhiri sesi ini lalu buat sesi baru dengan memilih kelompok.</span><br>
      <button class="btn-sm" style="margin-top:10px;background:#dc2626;color:#fff" onclick="finishDebateSession()">🏁 Akhiri Sesi Ini</button>
    </div>`;
    return;
  }

  kc.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
      ${proId ? `
        <div style="padding:12px;background:rgba(116,224,160,0.1);border-radius:8px;border:1px solid #74E0A0">
          <div style="font-size:.9rem;font-weight:700;color:#74E0A0;margin-bottom:8px">✅ ${proName}</div>
          <div style="margin-bottom:8px">Kancing: <strong>${proCount}</strong></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${generateAdminKancingButtons(proCount, 'pro', proId)}
          </div>
          <button class="btn-sm yellow" style="margin-top:8px" onclick="resetKancing('${proId}')">🔄 Reset ke 5</button>
        </div>
      ` : ''}
      ${conId ? `
        <div style="padding:12px;background:rgba(255,138,128,0.1);border-radius:8px;border:1px solid #FF8A80">
          <div style="font-size:.9rem;font-weight:700;color:#FF8A80;margin-bottom:8px">❌ ${conName}</div>
          <div style="margin-bottom:8px">Kancing: <strong>${conCount}</strong></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${generateAdminKancingButtons(conCount, 'con', conId)}
          </div>
          <button class="btn-sm yellow" style="margin-top:8px" onclick="resetKancing('${conId}')">🔄 Reset ke 5</button>
        </div>
      ` : ''}
      ${thirdId ? `
        <div style="padding:12px;background:rgba(255,191,36,0.1);border-radius:8px;border:1px solid #fbbf24">
          <div style="font-size:.9rem;font-weight:700;color:#fbbf24;margin-bottom:8px">⭐ ${thirdName}</div>
          <div style="margin-bottom:8px">Kancing: <strong>${thirdCount}</strong></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${generateAdminKancingButtons(thirdCount, 'netral', thirdId)}
          </div>
          <button class="btn-sm yellow" style="margin-top:8px" onclick="resetKancing('${thirdId}')">🔄 Reset ke 5</button>
        </div>
      ` : ''}
    </div>
  `;
}

function generateAdminKancingButtons(count, side, groupId) {
  // Jangan render tombol jika groupId tidak ada
  if (!groupId || groupId === 'undefined') {
    return '<span style="font-size:0.8rem;opacity:0.5;font-style:italic">Kelompok belum dipilih</span>';
  }
  let html = '';
  for (let i = 0; i < Math.min(count, 5); i++) {
    html += `<button class="admin-kancing" title="Kurangi kancing ${i + 1}" onclick="confirmReduceKancing('${groupId}', '${side}')">
      <span class="kancing"></span>
    </button>`;
  }
  if (count === 0) {
    html = '<span style="font-size:0.82rem;color:#ff6b6b">Kancing habis!</span>';
  }
  return html;
}

// ══════════════════ KANCING REDUCTION ══════════════════
let pendingKancingReduction = null;

function confirmReduceKancing(groupId, side) {
  const groupName = side === 'pro'
    ? (debateState.session?.pro_group?.name || 'Tim PRO')
    : (debateState.session?.con_group?.name || 'Tim KONTRA');

  pendingKancingReduction = { groupId, side, groupName };
  const nameEl = document.getElementById('confirmGroupName');
  if (nameEl) nameEl.textContent = groupName;
  openModal('modal-confirm-kancing');
}

async function confirmKancingReduction() {
  if (!pendingKancingReduction) return;

  const { groupId } = pendingKancingReduction;
  closeModal('modal-confirm-kancing');

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch(`/api/debate/kancing/${groupId}/reduce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({ reason: 'manual_reduction_by_admin' })
    });
    const data = await res.json();

    if (data.success) {
      debateState.kancingStatus = data.data.kancing_status;
      renderKancingButtons();
      renderKancingControls();
      showToast('🔵 Kancing berhasil dikurangi!');
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal mengurangi kancing'));
    }
  } catch (e) {
    console.error('Error reducing kancing:', e);
    showToast('⚠️ Gagal mengurangi kancing');
  }

  pendingKancingReduction = null;
}

async function resetKancing(groupId) {
  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch(`/api/debate/kancing/${groupId}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      }
    });
    const data = await res.json();

    if (data.success) {
      debateState.kancingStatus = data.data.kancing_status;
      renderKancingButtons();
      renderKancingControls();
      showToast('🔄 Kancing berhasil di-reset ke 5!');
    }
  } catch (e) {
    console.error('Error resetting kancing:', e);
    showToast('⚠️ Gagal reset kancing');
  }
}

async function resetAllKancing() {
  const proId = debateState.session?.pro_group?.id;
  const conId = debateState.session?.con_group?.id;

  if (proId) await resetKancing(proId);
  if (conId) await resetKancing(conId);

  showToast('🔄 Semua kancing di-reset!');
}

// ══════════════════ ARGUMENTS ══════════════════
async function loadArguments() {
  try {
    const res = await fetch('/api/debate/arguments');
    const data = await res.json();

    if (data.success) {
      debateState.arguments = data.data;
      renderArguments();
    }
  } catch (e) {
    console.error('Error loading arguments:', e);
  }
}

function renderArguments() {
  const log = document.getElementById('argumentLog');
  if (!log) return;

  // Clear existing dynamic arguments
  const existing = log.querySelectorAll('.arg-entry.dynamic');
  existing.forEach(e => e.remove());

  debateState.arguments.forEach(arg => {
    const entry = document.createElement('div');
    entry.className = 'arg-entry dynamic';
    entry.innerHTML = `
      <div class="arg-avatar" style="${arg.side === 'con' ? 'background:var(--earth)' : ''}">${arg.user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
      <div class="arg-bubble">
        <div class="arg-meta">
          <span>${arg.user?.name || 'Unknown'}</span>
          <span>${arg.time || ''}</span>
        </div>
        <div class="arg-text">${arg.content}</div>
      </div>
    `;
    const inputRow = document.getElementById('argInputRow');
    if (inputRow) {
      log.insertBefore(entry, inputRow);
    }
  });
}

async function sendArgument() {
  const txt = document.getElementById('argInput')?.value?.trim();
  if (!txt) {
    showToast('⚠️ Ketik argumenmu dulu!');
    return;
  }

  if (!debateState.session || debateState.session.status !== 'active') {
    showToast('⚠️ Debat belum dimulai!');
    return;
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch('/api/debate/argument', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({ content: txt, student_id: state.user?.id })
    });
    const data = await res.json();

    if (data.success) {
      debateState.arguments.push(data.data.argument);
      debateState.kancingStatus = data.data.kancing_status;

      renderArguments();
      renderKancingButtons();
      if (state.isAdmin) renderKancingControls();

      const argInput = document.getElementById('argInput');
      if (argInput) argInput.value = '';
      showToast('💬 Argumen berhasil dikirim!');
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal mengirim argumen'));
    }
  } catch (e) {
    console.error('Error sending argument:', e);
    showToast('⚠️ Gagal mengirim argumen');
  }
}

// ══════════════════ POLLING ══════════════════
function startDebatePolling() {
  if (debateState.pollingInterval) {
    clearInterval(debateState.pollingInterval);
  }

  debateState.pollingInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/debate/session');
      const data = await res.json();

      if (data.success && data.data) {
        const session = data.data;

        // Selalu update session state dan board agar nama anggota & kancing selalu sinkron
        debateState.session = session;
        showDebateBoard(session);

        if (session.kancing_status) {
          debateState.kancingStatus = session.kancing_status;
          renderKancingButtons();
          if (state.isAdmin) renderKancingControls();
        }
      } else if (!data.data && debateState.session) {
        debateState.session = null;
        showNoSessionMessage();
        if (debateState.pollingInterval) {
          clearInterval(debateState.pollingInterval);
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, 5000);
}

function stopDebatePolling() {
  if (debateState.pollingInterval) {
    clearInterval(debateState.pollingInterval);
    debateState.pollingInterval = null;
  }
}

// ══════════════════ DEBATE SETUP (ADMIN) ══════════════════
async function loadGroupsForSetup() {
  try {
    const res = await fetch('/api/debate/groups');
    const data = await res.json();

    if (data.success) {
      const proSelect = document.getElementById('proGroupSelect');
      const conSelect = document.getElementById('conGroupSelect');

      if (proSelect) {
        proSelect.innerHTML = '<option value="">-- Pilih Kelompok --</option>' +
          data.data.map(g => `<option value="${g.id}">${g.icon || ''} ${g.name} (${g.members?.length || 0} anggota)</option>`).join('');
      }

      if (conSelect) {
        conSelect.innerHTML = '<option value="">-- Pilih Kelompok --</option>' +
          data.data.map(g => `<option value="${g.id}">${g.icon || ''} ${g.name} (${g.members?.length || 0} anggota)</option>`).join('');
      }

      if (thirdSelect) {
        thirdSelect.innerHTML = '<option value="">-- Pilih Kelompok --</option>' +
          data.data.map(g => `<option value="${g.id}">${g.icon || ''} ${g.name} (${g.members?.length || 0} anggota)</option>`).join('');
      }

      if (debateState.session?.pro_group?.id && proSelect) {
        proSelect.value = debateState.session.pro_group.id;
      }
      if (debateState.session?.con_group?.id && conSelect) {
        conSelect.value = debateState.session.con_group.id;
      }
      if (debateState.session?.third_group?.id && thirdSelect) {
        thirdSelect.value = debateState.session.third_group.id;
      }

      updateSessionStatusInfo();
    }
  } catch (e) {
    console.error('Error loading groups:', e);
  }
}

function updateSessionStatusInfo() {
  const info = document.getElementById('sessionStatusInfo');
  const text = document.getElementById('sessionStatusText');
  if (!info || !text) return;

  if (debateState.session) {
    info.style.display = 'block';
    const statusLabels = {
      'waiting': '⏳ Status: Menunggu',
      'active': '⚔️ Status: Sedang Berlangsung',
      'finished': '🏁 Status: Selesai'
    };
    text.innerHTML = `
      <strong>${statusLabels[debateState.session.status] || debateState.session.status}</strong><br>
      ${debateState.session.topic ? 'Topik: ' + debateState.session.topic + '<br>' : ''}
      Tim 1: ${debateState.session.pro_group?.name || 'Belum dipilih'} ·
      Tim 2: ${debateState.session.con_group?.name || 'Belum dipilih'}${debateState.session.third_group ? ' · Tim 3: ' + debateState.session.third_group.name : ''}
    `;
  } else {
    info.style.display = 'none';
  }
}

async function startDebateSession() {
  const topic = document.getElementById('debateTopicInput')?.value?.trim();
  const proGroupId = document.getElementById('proGroupSelect')?.value;
  const conGroupId = document.getElementById('conGroupSelect')?.value;
  const thirdGroupId = document.getElementById('thirdGroupSelect')?.value;

  if (!topic) {
    showToast('⚠️ Masukkan topik debat!');
    return;
  }

  if (!proGroupId) {
    showToast('⚠️ Pilih kelompok untuk Tim 1 terlebih dahulu!');
    return;
  }

  if (!conGroupId) {
    showToast('⚠️ Pilih kelompok untuk Tim 2 terlebih dahulu!');
    return;
  }

  // Third group is optional
  // if (!thirdGroupId) {
  //   showToast('⚠️ Pilih kelompok untuk Tim 3!');
  //   return;
  // }

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';

    let res = await fetch('/api/debate/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({ topic, pro_group_id: proGroupId || null, con_group_id: conGroupId || null, third_group_id: thirdGroupId || null })
    });
    let data = await res.json();

    if (!data.success) {
      showToast('⚠️ ' + (data.message || 'Gagal membuat sesi'));
      return;
    }

    const sessionId = data.data.id;

    res = await fetch(`/api/debate/session/${sessionId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      }
    });
    data = await res.json();

    if (data.success) {
      debateState.session = data.data;
      showDebateBoard(data.data);
      loadGroupsForSetup();
      closeModal('modal-setup-debate');
      showToast('⚔️ Debat dimulai!');
      startDebatePolling();
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal memulai debat'));
    }
  } catch (e) {
    console.error('Error starting debate:', e);
    showToast('⚠️ Gagal memulai debat');
  }
}

async function finishDebateSession() {
  if (!debateState.session) {
    showToast('⚠️ Tidak ada sesi yang aktif');
    return;
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch(`/api/debate/session/${debateState.session.id}/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      }
    });
    const data = await res.json();

    if (data.success) {
      debateState.session = data.data;
      showDebateBoard(data.data);
      loadGroupsForSetup();
      stopDebatePolling();
      showToast('🏁 Debat selesai!');
    }
  } catch (e) {
    console.error('Error finishing debate:', e);
    showToast('⚠️ Gagal mengakhiri debat');
  }
}

// Legacy functions for backward compatibility
function renderTeamButtons(side) {
  // Now handled by renderKancingButtons
}

function removeTeamButton(side, index) {
  // Admin clicks on kancing to reduce - now handled by confirmReduceKancing
}

function resetTeamButtons(side) {
  // Now handled by resetKancing
}

// ══════════════════ DEBATE RULES (ADMIN) ══════════════════
let editingRuleId = null;

function openAddDebateRule() {
  editingRuleId = null;
  document.getElementById('ruleTitle').value = '';
  document.getElementById('ruleDescription').value = '';
  loadDebateRules();
  openModal('modal-add-debate-rule');
}

async function loadDebateRulesForDisplay() {
  const container = document.getElementById('debateRulesDisplay');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/debate-rules');
    const data = await res.json();

    if (data.success && data.data && data.data.length > 0) {
      container.innerHTML = data.data.map((rule, i) => `
        <div class="rule-item" style="padding:8px 0">
          <div class="rule-num">${rule.order || (i + 1)}</div>
          <div class="rule-text"><strong>${rule.title}:</strong> ${rule.description}</div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p style="font-size:0.85rem;color:var(--gray)">Belum ada aturan.</p>';
    }
  } catch (e) {
    console.error('Error loading debate rules:', e);
  }
}

async function loadDebateRules() {
  try {
    const res = await fetch('/api/admin/debate-rules');
    const data = await res.json();

    if (data.success) {
      renderDebateRulesList(data.data);
    }
  } catch (e) {
    console.error('Error loading debate rules:', e);
  }
}

function renderDebateRulesList(rules) {
  const container = document.getElementById('debateRulesList');
  if (!container) return;

  if (!rules || rules.length === 0) {
    container.innerHTML = '<p style="font-size:0.85rem;color:var(--gray);text-align:center;padding:1rem">Belum ada aturan.</p>';
    return;
  }

  container.innerHTML = rules.map(rule => `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;padding:10px;background:var(--card-bg);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--green)">
      <div style="flex:1">
        <div style="font-weight:700;font-size:0.85rem">${rule.title}</div>
        <div style="font-size:0.8rem;color:var(--gray);margin-top:4px">${rule.description}</div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0">
        <button class="btn-sm" style="background:var(--green-pale);color:var(--green-deep);padding:4px 8px;font-size:0.72rem" onclick="editDebateRule(${rule.id}, '${rule.title.replace(/'/g, "\\'")}', '${rule.description.replace(/'/g, "\\'")}')">✏️</button>
        <button class="btn-sm" style="background:#fee2e2;color:#dc2626;padding:4px 8px;font-size:0.72rem" onclick="deleteDebateRule(${rule.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function editDebateRule(id, title, description) {
  editingRuleId = id;
  document.getElementById('ruleTitle').value = title;
  document.getElementById('ruleDescription').value = description;
}

async function saveDebateRule() {
  const title = document.getElementById('ruleTitle')?.value?.trim();
  const description = document.getElementById('ruleDescription')?.value?.trim();

  if (!title || !description) {
    showToast('⚠️ Judul dan deskripsi harus diisi!');
    return;
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    let url = '/api/admin/debate-rules';
    let method = 'POST';
    let body = JSON.stringify({ title, description });

    if (editingRuleId) {
      url = `/api/admin/debate-rules/${editingRuleId}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
      },
      body
    });

    const data = await res.json();

    if (data.success) {
      showToast(editingRuleId ? '✅ Aturan berhasil diperbarui!' : '✅ Aturan berhasil ditambahkan!');
      document.getElementById('ruleTitle').value = '';
      document.getElementById('ruleDescription').value = '';
      editingRuleId = null;
      loadDebateRules();
      loadDebateRulesForDisplay();
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal menyimpan'));
    }
  } catch (e) {
    console.error('Error saving debate rule:', e);
    showToast('⚠️ Gagal menyimpan aturan');
  }
}

async function deleteDebateRule(id) {
  if (!confirm('Yakin ingin menghapus aturan ini?')) return;

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch(`/api/admin/debate-rules/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
      }
    });

    const data = await res.json();

    if (data.success) {
      showToast('🗑️ Aturan berhasil dihapus!');
      loadDebateRules();
      loadDebateRulesForDisplay();
    } else {
      showToast('⚠️ Gagal menghapus');
    }
  } catch (e) {
    console.error('Error deleting debate rule:', e);
    showToast('⚠️ Gagal menghapus aturan');
  }
}

// Export functions globally
window.renderTahap4 = renderTahap4;
window.renderTeamButtons = renderTeamButtons;
window.removeTeamButton = removeTeamButton;
window.resetTeamButtons = resetTeamButtons;
window.sendArgument = sendArgument;
window.renderKancingButtons = renderKancingButtons;
window.renderKancingControls = renderKancingControls;
window.confirmReduceKancing = confirmReduceKancing;
window.confirmKancingReduction = confirmKancingReduction;
window.resetKancing = resetKancing;
window.resetAllKancing = resetAllKancing;
window.loadGroupsForSetup = loadGroupsForSetup;
window.startDebateSession = startDebateSession;
window.finishDebateSession = finishDebateSession;
window.debateState = debateState;
// Debate rules
window.openAddDebateRule = openAddDebateRule;
window.loadDebateRules = loadDebateRules;
window.loadDebateRulesForDisplay = loadDebateRulesForDisplay;
window.editDebateRule = editDebateRule;
window.saveDebateRule = saveDebateRule;
window.deleteDebateRule = deleteDebateRule;
