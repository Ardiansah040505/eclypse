// ═══════════════════════════════════════════
// TAHAP 3 - Preparation Room
// ═══════════════════════════════════════════

// Load questions
async function loadPrepQuestions() {
  try {
    const res = await fetch('/api/preparation/questions');
    const data = await res.json();
    if (data.success) state.prepQuestions = data.data || [];
    renderPrepForm();
  } catch(e) { console.error(e); }
}

// Render pertanyaan
function renderPrepForm() {
  const container = document.getElementById('prepFormContainer');
  if (!container) return;
  container.innerHTML = state.prepQuestions.map((q, i) => `
    <div class="prep-item">
      <div class="prep-num">${i + 1}</div>
      <div class="prep-q">${q.question_text}</div>
      <textarea class="prep-textarea" data-qid="${q.id}" placeholder="Tulis jawabanmu..." rows="3"></textarea>
    </div>
  `).join('');

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
      await fetch('/student/prep-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
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
    const res = await fetch('/api/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
      },
      body: JSON.stringify({ student_id: state.user?.id })
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
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="group-name">${group.icon || '👥'} ${group.name}</div>
            <div class="group-members">${members.length ? members.join(', ') : 'Belum ada anggota'}</div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span class="group-badge">${group.side === 'pro' || group.side === 'Pro' ? '✅ PRO' : '❌ KONTRA'}</span>
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
              ${(state.groups || []).map(group => `<option value="${group.id}" ${currentGroup?.id == group.id ? 'selected' : ''}>${group.icon || '👥'} ${group.name} (${group.side === 'pro' || group.side === 'Pro' ? 'Pro' : 'Kontra'})</option>`).join('')}
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
          <div style="margin-bottom:0.75rem">
            <span style="font-weight:bold">Posisi Debat:</span> 
            <span class="badge" style="background:${state.myGroup.side === 'pro' || state.myGroup.side === 'Pro' ? 'var(--green)' : '#ff6b6b'};color:white;padding:3px 10px;border-radius:20px;font-size:0.8rem">
              ${state.myGroup.side === 'pro' || state.myGroup.side === 'Pro' ? '✅ PRO KEBIJAKAN' : '❌ KONTRA KEBIJAKAN'}
            </span>
          </div>
          <div>
            <span style="font-weight:bold">Anggota Kelompok:</span>
            <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--dark)">${membersList}</p>
          </div>
        </div>
      `;
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
        body: JSON.stringify({ student_id: studentId, debate_group_id: groupId })
      });
    } else {
      await fetch(`/api/groups/student/${studentId}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-TOKEN': token }
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
  const side = document.getElementById('groupSide')?.value || 'Pro';
  if (!name) { showToast('⚠️ Isi nama kelompok!'); return; }
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';

  const icons = ['🌿','⚡','🌊','🔥','🌪️','🌱'];
  const icon = icons[Math.floor(Math.random() * icons.length)];

  try {
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
      body: JSON.stringify({ name, side, icon })
    });

    closeModal('modal-addgroup');
    showToast('✅ Kelompok ditambahkan!');
    if (document.getElementById('groupName')) document.getElementById('groupName').value = '';
    if (document.getElementById('groupMembers')) document.getElementById('groupMembers').value = '';
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
        'X-CSRF-TOKEN': token
      }
    });
    showToast('🗑 Kelompok berhasil dihapus');
    await loadGroupsAndStudents();
  } catch (e) {
    console.error(e);
    showToast('⚠️ Gagal menghapus kelompok');
  }
}

// Export
window.loadPrepQuestions = loadPrepQuestions;
window.submitPrepAnswers = submitPrepAnswers;
window.addGroup = addGroup;
window.deleteGroup = deleteGroup;
window.renderTahap3 = renderTahap3;
window.loadGroupsAndStudents = loadGroupsAndStudents;
window.loadStudentGroupInfo = loadStudentGroupInfo;
window.assignStudentToGroup = assignStudentToGroup;

