// ═══════════════════════════════════════════
// TAHAP 3 - Preparation Room
// ═══════════════════════════════════════════

// Load ALL questions for students (no eco_role filtering anymore)
async function loadPrepQuestions() {
  try {
    // Load ALL prep questions since students don't have eco_role anymore
    const res = await fetch('/api/preparation/questions?role=all');
    const data = await res.json();
    if (data.success) state.prepQuestions = data.data || [];
    renderPrepForm();
  } catch(e) { console.error('Error loading prep questions:', e); }
}

// Render pertanyaan
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

  container.innerHTML = `
    <div style="background:white;border:2px solid var(--green);border-radius:16px;padding:1.5rem;margin-bottom:1rem">
      <h3 style="margin:0 0 0.5rem 0;color:var(--green-deep);display:flex;align-items:center;gap:0.5rem">📋 Pertanyaan Persiapan</h3>
      <p style="font-size:0.85rem;color:var(--gray);margin:0 0 1.25rem 0">Jawab pertanyaan berikut berdasarkan eco cards yang kamu pilih.</p>
      ${state.prepQuestions.map((q, i) => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid var(--green-pale)">
          <div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:#fbbf24;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem">${i + 1}</div>
          <div style="flex:1">
            <div style="font-size:0.92rem;color:var(--dark);line-height:1.5;margin-bottom:0.75rem">${q.question_text}</div>
            <textarea class="prep-textarea" data-qid="${q.id}" placeholder="Tulis jawabanmu..." rows="3" style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.75rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s;background:#fafffe" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--green-pale)'"></textarea>
          </div>
        </div>
      `).join('')}
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


// Export
window.loadPrepQuestions = loadPrepQuestions;
window.submitPrepAnswers = submitPrepAnswers;
window.addGroup = addGroup;
window.deleteGroup = deleteGroup;
window.renderTahap3 = renderTahap3;
window.loadGroupsAndStudents = loadGroupsAndStudents;
window.loadStudentGroupInfo = loadStudentGroupInfo;
window.assignStudentToGroup = assignStudentToGroup;
window.sendGroupChat = sendGroupChat;

