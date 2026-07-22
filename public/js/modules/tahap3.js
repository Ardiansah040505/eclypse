// ═══════════════════════════════════════════
// TAHAP 3 - Preparation Room
// ═══════════════════════════════════════════

// Cache for admin prep questions (for faster modal loading)
let cachedAdminPrepQuestions = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 detik cache

// Load ALL questions for students (show both role-specific AND universal questions)
async function loadPrepQuestions() {
  try {
    // Fetch all questions without role filter so students see both universal AND role-specific
    const res = await fetch('/api/preparation/questions?role=all');
    const data = await res.json();
    if (data.success) state.prepQuestions = data.data || [];
    renderPrepForm();
  } catch(e) { console.error('Error loading prep questions:', e); }
}

// Render pertanyaan dengan section per role
function renderPrepForm() {
  const container = document.getElementById('prepFormContainer');
  const actions = document.getElementById('prepFormActions');

  if (!container) return;

  if (!state.prepQuestions || state.prepQuestions.length === 0) {
    container.style.display = 'none';
    if (actions) actions.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  if (actions) actions.style.display = 'flex';

  // Group questions by role
  const grouped = { all: [], peneliti: [], aktivis: [], pedagang: [] };
  let globalIndex = 0;
  state.prepQuestions.forEach(q => {
    const role = q.role || 'all';
    if (grouped.hasOwnProperty(role)) {
      grouped[role].push({ ...q, globalIndex: globalIndex++ });
    } else {
      grouped.all.push({ ...q, globalIndex: globalIndex++ });
    }
  });

  const roleConfig = {
    all:       { emoji: '🌐', label: 'Semua Role', color: '#8b5cf6', border: '#8b5cf6', bg: '#8b5cf620' },
    peneliti:  { emoji: '🔬', label: 'Peneliti',    color: '#3b82f6', border: '#3b82f6', bg: '#3b82f620' },
    aktivis:   { emoji: '🌿', label: 'Aktivis',     color: '#22c55e', border: '#22c55e', bg: '#22c55e20' },
    pedagang:  { emoji: '🛒', label: 'Pedagang',    color: '#f59e0b', border: '#f59e0b', bg: '#f59e0b20' }
  };

  let sectionsHtml = '';
  let totalQuestions = 0;
  let qCounter = 0;

  Object.keys(grouped).forEach(role => {
    const qs = grouped[role];
    if (qs.length === 0) return; // Skip empty sections
    totalQuestions += qs.length;

    const cfg = roleConfig[role];
    sectionsHtml += `
      <div style="margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px solid ${cfg.border}">
          <span style="font-size:1.1rem">${cfg.emoji}</span>
          <span style="font-weight:800;font-size:0.95rem;color:${cfg.color}">${cfg.label}</span>
          <span style="background:${cfg.bg};color:${cfg.color};font-size:0.72rem;font-weight:700;padding:2px 10px;border-radius:99px;margin-left:4px">${qs.length}</span>
        </div>
        ${qs.map(q => {
          const num = ++qCounter;
          return `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #e5e7eb">
            <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:${cfg.color};color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.82rem">${num}</div>
            <div style="flex:1">
              <div style="font-size:0.9rem;color:var(--dark);line-height:1.5;margin-bottom:0.6rem">${escapeHtml(q.question_text)}</div>
              <textarea class="prep-textarea" data-qid="${q.id}" placeholder="Tulis jawabanmu..." rows="3" style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.65rem 0.8rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s;background:#fafffe" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--green-pale)'"></textarea>
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  });

  container.innerHTML = `
    <div style="background:white;border:2px solid var(--green);border-radius:16px;padding:1.5rem;margin-bottom:1rem">
      <h3 style="margin:0 0 0.5rem 0;color:var(--green-deep);display:flex;align-items:center;gap:0.5rem">
        📋 Pertanyaan Persiapan
        <span style="background:var(--green-pale);color:var(--green-deep);font-size:0.72rem;font-weight:700;padding:2px 10px;border-radius:99px;margin-left:4px">${totalQuestions}</span>
        ${state.isAdmin ? `<button class="btn-sm green" style="margin-left:auto;font-size:0.75rem;padding:4px 10px" onclick="openManagePrepQuestions()">⚙️ Kelola</button>` : ''}
      </h3>
      <p style="font-size:0.85rem;color:var(--gray);margin:0 0 1.25rem 0">Jawab pertanyaan berikut berdasarkan eco cards yang kamu pilih.</p>
      ${sectionsHtml}
    </div>
  `;

  const btn = document.getElementById('prepSubmitBtn');
  if (btn) btn.onclick = submitPrepAnswers;
}

async function submitPrepAnswers() {
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  const inputs = document.querySelectorAll('.prep-textarea');
  let saved = 0;
  for (const inp of inputs) {
    const val = inp.value.trim();
    if (!val) continue;
    try {
      await fetch('/api/student/prep-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: inp.dataset.qid, answer: val, student_id: state.user?.id })
      });
      saved++;
    } catch(e) { console.error(e); }
  }
  if (saved > 0) {
    state.prepSubmitted = true;
    const status = document.getElementById('prepStatus');
    if (status) status.textContent = `✅ ${saved} jawaban tersimpan`;
    showToast(`✅ ${saved} jawaban tersimpan`);
  } else {
    showToast('⚠️ Isi jawaban dulu');
  }
}

// Groups management
async function loadGroupsAndStudents() {
  try {
    const resGroups = await fetch('/api/groups');
    const dataGroups = await resGroups.json();
    if (dataGroups.success) {
      state.groups = dataGroups.data || [];
    }

    const resStudents = await fetch('/api/students');
    const dataStudents = await resStudents.json();
    if (dataStudents.success) {
      // Tampilkan SEMUA siswa yang online, независимо dari статус kelompok
      // Agar admin bisa melihat siswa yang baru login dan belum masuk kelompok
      state.onlineStudents = (dataStudents.data || []).filter(s => s.is_online);
    }

    renderTahap3();
  } catch (e) {
    console.error(e);
  }
}

async function loadStudentGroupInfo() {
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  try {
    const res = await fetch('/api/heartbeat?include_group=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({ student_id: state.user?.id, include_group: true })
    });
    const data = await res.json();
    if (data.success) {
      state.myGroup = data.group;
    }
    renderTahap3();
  } catch (e) {
    console.error(e);
  }
}

function renderTahap3() {
  document.getElementById('adminBar3').style.display = state.isAdmin ? 'block' : 'none';
  const groupsContainer = document.getElementById('groupsContainer');

  if (state.isAdmin) {
    // Admin view
    groupsContainer.innerHTML = (state.groups || []).map(group => {
      const members = (group.members || []).map(member => {
        if (typeof member === 'object' && member !== null) {
          return member.name;
        }
        const student = (state.onlineStudents || []).find(s => s.id == member || s.name == member);
        return student ? student.name : member;
      }).filter(Boolean);
      return `<div class="group-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;width:100%">
          <div>
            <div class="group-name">${group.icon || '👥'} ${group.name}</div>
            <div class="group-members">${members.length ? members.join(', ') : 'Belum ada anggota'}</div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <button class="btn-sm" style="background:#dc3545;color:white;padding:4px 10px;font-size:0.75rem" onclick="deleteGroup(${group.id}, '${group.name.replace(/'/g, "\\'")}')">🗑 Hapus</button>
          </div>
        </div>
      </div>`;
    }).join('');

    const panel = document.getElementById('onlineStudentsPanel');
    if (panel) {
      panel.style.display = 'block';
      panel.innerHTML = `<div class="online-panel">
        <div class="online-panel-title">🟢 Siswa Online (${state.onlineStudents ? state.onlineStudents.length : 0})</div>
        <div class="online-panel-note">Pilih kelompok untuk setiap siswa. Siswa akan otomatis dipindahkan dari kelompok sebelumnya.</div>
        ${(state.onlineStudents || []).map(student => {
          const currentGroup = (state.groups || []).find(group => {
            return (group.members || []).some(m => {
              if (typeof m === 'object' && m !== null) {
                return m.id == student.id;
              }
              return m == student.id;
            });
          });
          return `<div class="online-student">
            <span class="online-dot"></span>
            <span class="online-student-name">${student.name}</span>
            <select class="group-select" onchange="assignStudentToGroup('${student.id}', this.value)">
              <option value="">Belum masuk kelompok</option>
              ${(state.groups || []).map(group => `<option value="${group.id}" ${currentGroup?.id == group.id ? 'selected' : ''}>${group.icon || '👥'} ${group.name}</option>`).join('')}
            </select>
          </div>`;
        }).join('')}
      </div>`;
    }
  } else {
    // Student view
    const panel = document.getElementById('onlineStudentsPanel');
    if (panel) panel.style.display = 'none';
    
    if (state.myGroup) {
      const membersList = (state.myGroup.members || []).map(m => m.name).join(', ') || 'Hanya Anda';
      groupsContainer.innerHTML = `
        <div class="my-group-container" style="background:var(--green-pale); border: 2px solid var(--green); padding: 1.25rem; border-radius: 12px; margin-top: 1rem;">
          <h3 style="margin-top:0;color:var(--green-deep);display:flex;align-items:center;gap:0.5rem">
            ${state.myGroup.icon || '👥'} Kelompok Anda: ${state.myGroup.name}
          </h3>
          <div>
            <span style="font-weight:bold">Anggota Kelompok:</span>
            <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--dark)">${membersList}</p>
          </div>
          
          <!-- Chat Box -->
          <div class="group-chat-box">
            <div style="background:var(--green-mid);color:white;padding:10px 12px;font-weight:700;font-size:0.85rem;display:flex;align-items:center;gap:6px">
              💬 Obrolan Kelompok
            </div>
            <div id="groupChatMessages" class="group-chat-messages">
              <div style="text-align:center;color:var(--gray);font-size:0.8rem;margin-top:2rem">Memuat pesan...</div>
            </div>
            <div class="chat-input-area">
              <input type="text" id="groupChatInput" placeholder="Ketik pesan..." onkeypress="if(event.key === 'Enter') sendGroupChat()">
              <button onclick="sendGroupChat()">Kirim</button>
            </div>
          </div>
        </div>
      `;
      startChatPolling();
    } else {
      groupsContainer.innerHTML = `
        <div class="my-group-container" style="background:#fff3cd; border: 2px solid #ffeeba; padding: 1.25rem; border-radius: 12px; margin-top: 1rem; color: #856404;">
          <h3 style="margin-top:0;display:flex;align-items:center;gap:0.5rem">⏳ Belum Masuk Kelompok</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem">Anda belum dimasukkan ke kelompok mana pun oleh Guru/Admin. Silakan tunggu beberapa saat atau hubungi Guru Anda.</p>
        </div>
      `;
    }
  }
}

async function assignStudentToGroup(studentId, groupId) {
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  try {
    if (groupId) {
      await fetch('/api/groups/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, debate_group_id: groupId })
      });
    } else {
      await fetch(`/api/groups/student/${studentId}`, {
        method: 'DELETE',
        headers: {  }
      });
    }
    await loadGroupsAndStudents();
    showToast('✅ Kelompok siswa diperbarui');
  } catch (e) {
    console.error(e);
    showToast('⚠️ Gagal menyimpan ke server');
  }
}

async function addGroup() {
  const name = document.getElementById('groupName')?.value?.trim();
  const memberCount = parseInt(document.getElementById('groupMemberCount')?.value) || 5;
  if (!name) { showToast('⚠️ Isi nama kelompok!'); return; }
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';

  const icons = ['🌿','⚡','🌊','🔥','🌪️','🌱'];
  const icon = icons[Math.floor(Math.random() * icons.length)];

  try {
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, icon, member_count: memberCount })
    });

    closeModal('modal-addgroup');
    showToast('✅ Kelompok ditambahkan!');
    if (document.getElementById('groupName')) document.getElementById('groupName').value = '';
    if (document.getElementById('groupMemberCount')) document.getElementById('groupMemberCount').value = '5';
    await loadGroupsAndStudents();
  } catch (e) {
    console.error(e);
    showToast('⚠️ Gagal menyimpan kelompok');
  }
}

async function deleteGroup(groupId, groupName) {
  if (!confirm(`Yakin ingin menghapus kelompok "${groupName}"?\nSemua anggota akan dikeluarkan dari kelompok ini.`)) {
    return;
  }

  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';

  try {
    await fetch(`/api/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        
      }
    });
    showToast('🗑 Kelompok berhasil dihapus');
    await loadGroupsAndStudents();
  } catch (e) {
    console.error(e);
    showToast('⚠️ Gagal menghapus kelompok');
  }
}

// Group Chat Logic
let chatPollingInterval = null;
let lastChatCount = 0;

function startChatPolling() {
  if (chatPollingInterval) clearInterval(chatPollingInterval);
  loadGroupChat(); // Initial load
  chatPollingInterval = setInterval(loadGroupChat, 3000);
}

function stopChatPolling() {
  if (chatPollingInterval) {
    clearInterval(chatPollingInterval);
    chatPollingInterval = null;
  }
}

async function loadGroupChat() {
  if (!state.myGroup) return;
  try {
    const res = await fetch(`/api/groups/${state.myGroup.id}/chat`);
    const data = await res.json();
    if (data.success) {
      renderChatMessages(data.data);
    }
  } catch (e) {
    console.error('Error loading chat:', e);
  }
}

function renderChatMessages(messages) {
  const container = document.getElementById('groupChatMessages');
  if (!container) return;
  
  if (messages.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--gray);font-size:0.8rem;margin-top:2rem">Belum ada obrolan. Mulai sapa teman kelompokmu!</div>';
    lastChatCount = 0;
    return;
  }

  // Only auto-scroll if new messages arrived
  const shouldScroll = messages.length > lastChatCount;
  
  container.innerHTML = messages.map(msg => {
    const isMine = msg.student_id == state.user?.id;
    return `
      <div class="chat-msg ${isMine ? 'mine' : 'others'}">
        ${!isMine ? `<div class="chat-sender">${msg.student_name}</div>` : ''}
        <div class="chat-bubble">${msg.message}</div>
        <span class="chat-time">${msg.time}</span>
      </div>
    `;
  }).join('');
  
  if (shouldScroll) {
    container.scrollTop = container.scrollHeight;
    lastChatCount = messages.length;
  }
}

async function sendGroupChat() {
  const input = document.getElementById('groupChatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg || !state.myGroup) return;
  
  input.value = ''; // clear immediately for better UX
  
  try {
    await fetch(`/api/groups/${state.myGroup.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: state.user?.id, message: msg })
    });
    // Immediately reload
    await loadGroupChat();
  } catch (e) {
    console.error('Error sending chat:', e);
    showToast('⚠️ Gagal mengirim pesan');
  }
}

// Hook to stop polling when leaving page if needed
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.id === 'page-tahap3' && mutation.target.style.display === 'none') {
      stopChatPolling();
    }
  });
});
const page3 = document.getElementById('page-tahap3');
if (page3) observer.observe(page3, { attributes: true, attributeFilter: ['style'] });


// --- Admin Manage Prep Questions ---
async function openManagePrepQuestions() {
  openModal('modal-manage-questions');
  resetPrepQuestionForm();

  // Tampilkan data cached dulu jika ada (instant display)
  if (cachedAdminPrepQuestions !== null && cachedAdminPrepQuestions.length > 0) {
    renderAdminPrepQuestions(cachedAdminPrepQuestions);
  }

  // Fetch data terbaru dari server
  await loadAdminPrepQuestions();
}

async function loadAdminPrepQuestions() {
  console.log('Loading admin prep questions...', { userId: state.user?.id, isAdmin: state.isAdmin });

  // Show loading state di semua section
  ['all', 'peneliti', 'aktivis', 'pedagang'].forEach(role => {
    const el = document.getElementById('prep-list-' + role);
    const countEl = document.getElementById('count-' + role);
    if (el) el.innerHTML = '<div style="text-align:center;color:var(--gray);padding:0.75rem;font-size:0.85rem">Memuat...</div>';
    if (countEl) countEl.textContent = '0';
  });

  try {
    const response = await Promise.race([
      fetch('/api/admin/prep-questions', {
        headers: { 'X-Admin-Id': state.user?.id || '' }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    ]);

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.success) {
      cachedAdminPrepQuestions = data.data || [];
      lastFetchTime = Date.now();
      renderAdminPrepQuestions(cachedAdminPrepQuestions);
    } else {
      // Show error di semua section
      ['all', 'peneliti', 'aktivis', 'pedagang'].forEach(role => {
        const el = document.getElementById('prep-list-' + role);
        if (el) el.innerHTML = `<div style="color:red;padding:0.75rem;font-size:0.85rem;text-align:center">Error: ${data.message || 'Unknown error'}</div>`;
      });
    }
  } catch (e) {
    console.error('Fetch error:', e);
    // Show error di semua section
    ['all', 'peneliti', 'aktivis', 'pedagang'].forEach(role => {
      const el = document.getElementById('prep-list-' + role);
      if (el) {
        if (e.message === 'timeout') {
          el.innerHTML = `<div style="color:#f59e0b;padding:0.75rem;font-size:0.85rem;text-align:center">⚠️ Waktu habis (10dtk). Coba klik 🔄 Refresh.</div>`;
        } else {
          el.innerHTML = `<div style="color:red;padding:0.75rem;font-size:0.85rem;text-align:center">Gagal memuat: ${e.message}</div>`;
        }
      }
    });
  }
}

// Reload questions (bypass cache) - dipanggil dari tombol Refresh
async function reloadAdminPrepQuestions() {
  // Clear all section containers
  ['all','peneliti','aktivis','pedagang'].forEach(role => {
    const el = document.getElementById('prep-list-' + role);
    if (el) el.innerHTML = '<div style="text-align:center;color:var(--gray);padding:0.75rem;font-size:0.85rem">Memuat...</div>';
  });
  // Clear cache dan reload
  cachedAdminPrepQuestions = null;
  lastFetchTime = 0;
  await loadAdminPrepQuestions();
}

function renderAdminPrepQuestions(questions) {
  // Group questions by role
  const grouped = {
    all: [],
    peneliti: [],
    aktivis: [],
    pedagang: []
  };

  questions.forEach(q => {
    if (grouped.hasOwnProperty(q.role)) {
      grouped[q.role].push(q);
    } else {
      grouped.all.push(q);
    }
  });

  // Render each section
  const roleConfig = {
    all:       { color: '#8b5cf6', border: '#8b5cf6' },
    peneliti:  { color: '#3b82f6', border: '#3b82f6' },
    aktivis:   { color: '#22c55e', border: '#22c55e' },
    pedagang:  { color: '#f59e0b', border: '#f59e0b' }
  };

  Object.keys(grouped).forEach(role => {
    const container = document.getElementById('prep-list-' + role);
    const countEl = document.getElementById('count-' + role);
    if (!container) return;

    const qs = grouped[role];

    // Update count badge
    if (countEl) countEl.textContent = qs.length;

    if (qs.length === 0) {
      container.innerHTML = `<div style="text-align:center;color:var(--gray);padding:0.75rem;font-size:0.82rem">Belum ada pertanyaan.</div>`;
      return;
    }

    container.innerHTML = qs.map(q => {
      const cfg = roleConfig[role];
      return `
      <div style="background:white;border:1px solid ${cfg.color}30;border-radius:8px;padding:0.75rem;margin-bottom:8px;border-left:3px solid ${cfg.color}">
        <div style="font-size:0.9rem;color:var(--dark);line-height:1.5;margin-bottom:0.5rem">${escapeHtml(q.question_text)}</div>
        <div style="display:flex;justify-content:flex-end;gap:6px">
          <button class="btn-sm yellow" style="padding:3px 10px;font-size:0.72rem" onclick="editPrepQuestion(${q.id}, \`${q.question_text.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\n/g,' ')}\`, '${q.role}')">✏️ Edit</button>
          <button class="btn-sm" style="background:#fee2e2;color:#dc2626;padding:3px 10px;font-size:0.72rem" onclick="deletePrepQuestion(${q.id})">🗑️</button>
        </div>
      </div>
    `}).join('');
  });

  // If NO questions at all, show message
  const total = questions.length;
  if (total === 0) {
    const firstSection = document.getElementById('prep-list-all');
    if (firstSection) firstSection.innerHTML = '<div style="text-align:center;color:var(--gray);padding:1rem;font-size:0.85rem">Belum ada pertanyaan sama sekali. Buat pertanyaan baru di atas!</div>';
  }
}

// Helper: Escape HTML untuk mencegah XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function editPrepQuestion(id, text, role) {
  console.log('Editing question:', { id, text, role });
  document.getElementById('tahap3PrepQuestionId').value = id;
  document.getElementById('tahap3PrepQuestionText').value = text;
  document.getElementById('tahap3PrepQuestionRole').value = role;
  document.getElementById('tahap3BtnCancelEditPrep').style.display = 'inline-block';
  document.getElementById('tahap3PrepQuestionText').focus();
}

function resetPrepQuestionForm() {
  document.getElementById('tahap3PrepQuestionId').value = '';
  document.getElementById('tahap3PrepQuestionText').value = '';
  document.getElementById('tahap3PrepQuestionRole').value = 'all';
  document.getElementById('tahap3BtnCancelEditPrep').style.display = 'none';
}

async function saveTahap3PrepQuestion() {
  const id = document.getElementById('tahap3PrepQuestionId').value;
  const text = document.getElementById('tahap3PrepQuestionText').value.trim();
  const role = document.getElementById('tahap3PrepQuestionRole').value;

  console.log('Saving question:', { id, text, role, isEditing: !!id });

  if (!text) {
    showToast('⚠️ Pertanyaan tidak boleh kosong');
    return;
  }

  const url = id ? `/api/admin/prep-questions/${id}` : '/api/admin/prep-questions';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Id': state.user?.id || ''
      },
      body: JSON.stringify({ question_text: text, role: role })
    });
    const data = await res.json();
    console.log('Save response:', data);
    if (data.success) {
      showToast(id ? '✅ Pertanyaan berhasil diperbarui' : '✅ Pertanyaan berhasil ditambahkan');
      resetPrepQuestionForm();
      // Invalidate cache dan reload
      cachedAdminPrepQuestions = null;
      lastFetchTime = 0;
      await loadAdminPrepQuestions();
    } else {
      showToast('⚠️ Gagal menyimpan pertanyaan: ' + (data.message || 'Unknown error'));
    }
  } catch (e) {
    console.error('Save error:', e);
    showToast('⚠️ Terjadi kesalahan saat menyimpan');
  }
}

async function deletePrepQuestion(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) return;

  console.log('Deleting question ID:', id, 'Admin ID:', state.user?.id);

  try {
    const res = await fetch(`/api/admin/prep-questions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Id': state.user?.id || ''
      }
    });

    const data = await res.json();
    console.log('Delete response:', data);

    if (data.success) {
      showToast('✅ Pertanyaan berhasil dihapus');
      // Invalidate cache dan reload
      cachedAdminPrepQuestions = null;
      lastFetchTime = 0;
      await loadAdminPrepQuestions();
    } else {
      showToast('⚠️ Gagal menghapus pertanyaan: ' + (data.message || 'Unknown error'));
    }
  } catch (e) {
    console.error('Delete error:', e);
    showToast('⚠️ Terjadi kesalahan saat menghapus');
  }
}

// Export
window.loadPrepQuestions = loadPrepQuestions;
window.loadAdminPrepQuestions = loadAdminPrepQuestions;
window.reloadAdminPrepQuestions = reloadAdminPrepQuestions;
window.submitPrepAnswers = submitPrepAnswers;
window.addGroup = addGroup;
window.deleteGroup = deleteGroup;
window.renderTahap3 = renderTahap3;
window.loadGroupsAndStudents = loadGroupsAndStudents;
window.loadStudentGroupInfo = loadStudentGroupInfo;
window.assignStudentToGroup = assignStudentToGroup;
window.sendGroupChat = sendGroupChat;
window.openManagePrepQuestions = openManagePrepQuestions;
window.saveTahap3PrepQuestion = saveTahap3PrepQuestion;
window.editPrepQuestion = editPrepQuestion;
window.deletePrepQuestion = deletePrepQuestion;
window.resetPrepQuestionForm = resetPrepQuestionForm;
window.escapeHtml = escapeHtml;
