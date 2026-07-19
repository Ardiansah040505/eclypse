// ══════════════════════════════════════════════════════════════════════════
// TAHAP 5 - Refleksi & Pertanyaan ke Guru (API Integration)
// ══════════════════════════════════════════════════════════════════════════

// Module-level state
let reflectionState = {
  reflections: [],
  filter: 'all',
  pollingInterval: null,
  pendingAnswerId: null
};

// ══════════════════ RENDER TAHAP 5 ══════════════════
async function renderTahap5() {
  // Show/hide views based on role
  const studentView = document.getElementById('studentRefleksiView');
  const adminView = document.getElementById('adminRefleksiView');
  const recapPanel = document.getElementById('adminRecapPanel');

  if (state.isAdmin) {
    if (studentView) studentView.style.display = 'none';
    if (adminView) adminView.style.display = 'block';
    if (recapPanel) recapPanel.style.display = 'block';
    // Load prep questions for admin (CRUD panel)
    await loadAdminPrepQuestions();
  } else {
    if (studentView) studentView.style.display = 'block';
    if (adminView) adminView.style.display = 'none';
    if (recapPanel) recapPanel.style.display = 'none';
    // Load prep questions for student based on their selected eco role
    await loadStudentPrepQuestions();
  }

  // Load reflections
  await loadReflections();

  // Start polling
  startReflectionPolling();
}

async function loadReflections() {
  try {
    console.log('Loading reflections...', { isAdmin: state.isAdmin, userId: state.user?.id });
    const studentId = state.isAdmin ? '' : (state.user?.id || '');
    const adminId = state.isAdmin ? (state.user?.id || '') : '';
    const res = await fetch(`/api/reflection?student_id=${studentId}&admin_id=${adminId}&is_admin=${state.isAdmin}`, {
      credentials: 'include' // Include session cookie
    });
    const data = await res.json();

    console.log('Reflections loaded:', data);

    if (data.success) {
      reflectionState.reflections = data.data;
      console.log('Set reflections to:', reflectionState.reflections.length, 'items');
      updateCounts();
      renderReflections();
    }
  } catch (e) {
    console.error('Error loading reflections:', e);
  }
}

function updateCounts() {
  const total = reflectionState.reflections.length;
  const answered = reflectionState.reflections.filter(r => r.is_answered).length;
  const unanswered = total - answered;

  const totalEl = document.getElementById('totalQuestionsCount');
  const unansweredEl = document.getElementById('unansweredCount');
  const answeredEl = document.getElementById('answeredCount');
  const filterAllEl = document.getElementById('filterAllCount');
  const filterUnansweredEl = document.getElementById('filterUnansweredCount');
  const filterAnsweredEl = document.getElementById('filterAnsweredCount');

  if (totalEl) totalEl.textContent = total;
  if (unansweredEl) unansweredEl.textContent = unanswered;
  if (answeredEl) answeredEl.textContent = answered;
  if (filterAllEl) filterAllEl.textContent = total;
  if (filterUnansweredEl) filterUnansweredEl.textContent = unanswered;
  if (filterAnsweredEl) filterAnsweredEl.textContent = answered;
}

function filterRefleksi(filter) {
  reflectionState.filter = filter;

  // Update tab styles
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });

  renderReflections();
}

function renderReflections() {
  const cl = document.getElementById('commentList');
  const noMessage = document.getElementById('noRefleksiMessage');

  if (!cl) return;

  console.log('Rendering reflections, count:', reflectionState.reflections.length, 'filter:', reflectionState.filter);

  // Filter reflections based on current filter
  let filtered = reflectionState.reflections;
  if (reflectionState.filter === 'unanswered') {
    filtered = filtered.filter(r => !r.is_answered);
  } else if (reflectionState.filter === 'answered') {
    filtered = filtered.filter(r => r.is_answered);
  }

  console.log('Filtered reflections:', filtered.length, filtered.map(r => ({id: r.id, user: r.user?.name})));

  // Clear existing
  cl.innerHTML = '';

  if (filtered.length === 0) {
    if (noMessage) noMessage.style.display = 'block';
    return;
  }

  if (noMessage) noMessage.style.display = 'none';

  filtered.forEach(r => {
    const div = document.createElement('div');
    div.className = 'comment-item' + (r.is_answered ? ' answered' : ' unanswered');
    div.dataset.id = r.id;

    const isOwn = state.user && r.user && r.user.id === state.user.id;

    div.innerHTML = `
      <div class="comment-avatar" style="${r.is_answered ? 'background:var(--earth)' : ''}">${r.user?.initial || '?'}</div>
      <div class="comment-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div class="comment-name">${r.user?.name || 'Siswa'}
            ${r.user?.school ? `<span style="font-size:0.72rem;font-weight:400;opacity:0.6"> · ${r.user.school}</span>` : ''}
            ${isOwn ? '<span style="font-size:0.72rem;background:var(--green-pale);padding:2px 8px;border-radius:99px;margin-left:6px">Kamu</span>' : ''}
          </div>
          ${state.isAdmin ? `
            <button
              onclick="deleteReflection(${r.id})"
              style="flex-shrink:0;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:4px 10px;font-size:0.72rem;font-weight:700;cursor:pointer;white-space:nowrap"
              title="Hapus pertanyaan ini"
            >🗑 Hapus</button>
          ` : ''}
        </div>
        <div class="comment-text">${r.question}</div>
        <div class="comment-time">📅 ${r.date || ''} · 🕐 ${r.time || ''}</div>
        ${r.is_answered ? `
          <div class="teacher-reply">
            <strong>💬 ${r.answered_by?.name || 'Guru'}:</strong> ${r.answer}
            <div style="font-size:0.7rem;opacity:0.6;margin-top:4px">Dijawab: ${r.answered_time || ''}</div>
          </div>
        ` : `
          ${state.isAdmin ? `
            <button class="btn-sm green" style="margin-top:8px;padding:5px 12px;font-size:0.78rem" onclick="openAnswerModal('${r.id}')">
              💬 Jawab Pertanyaan
            </button>
          ` : `
            <div style="font-size:0.78rem;color:var(--yellow);margin-top:6px">⏳ Menunggu jawaban dari guru...</div>
          `}
        `}
      </div>
    `;
    cl.appendChild(div);
  });
}

// ══════════════════ SUBMIT REFLEKSI ══════════════════
async function submitRefleksi() {
  const input = document.getElementById('refleksiInput');
  if (!input) return;

  const txt = input.value.trim();
  if (!txt) {
    showToast('⚠️ Tulis pertanyaanmu dulu!');
    return;
  }

  const submitBtn = document.getElementById('refleksiSubmitBtn');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const studentId = state.user?.id;
    const res = await fetch('/api/reflection', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Student-Id': studentId || ''
      },
      body: JSON.stringify({ question: txt, student_id: studentId })
    });

    const data = await res.json();

    console.log('Submit reflection response:', data);

    if (data.success) {
      input.value = '';
      reflectionState.reflections.unshift(data.data);
      updateCounts();
      renderReflections();

      if (!state._refleksiRecap) state._refleksiRecap = [];
      state._refleksiRecap.push(txt);
      saveStudentRecap('refleksi', state._refleksiRecap);
      updateProgressBar();

      showToast('✅ Pertanyaan berhasil dikirim ke guru!');
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal mengirim pertanyaan'));
    }
  } catch (e) {
    console.error('Error submitting reflection:', e);
    showToast('⚠️ Gagal mengirim pertanyaan');
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Kirim Pertanyaan ✉️';
  }
}

// ══════════════════ ANSWER MODAL (ADMIN) ══════════════════
function openAnswerModal(id) {
  const reflection = reflectionState.reflections.find(r => r.id == id);
  if (!reflection) return;

  reflectionState.pendingAnswerId = id;

  const authorEl = document.getElementById('answerQuestionAuthor');
  const textEl = document.getElementById('answerQuestionText');
  const answerInput = document.getElementById('answerText');

  if (authorEl) authorEl.textContent = reflection.user?.name || 'Siswa';
  if (textEl) textEl.textContent = reflection.question;
  if (answerInput) answerInput.value = '';

  openModal('modal-answer-refleksi');
}

async function sendAnswer() {
  const answerText = document.getElementById('answerText')?.value?.trim();
  if (!answerText) {
    showToast('⚠️ Tulis jawaban kamu dulu!');
    return;
  }

  if (!reflectionState.pendingAnswerId) return;

  const id = reflectionState.pendingAnswerId;

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const adminId = state.user?.id;
    const res = await fetch(`/api/reflection/${id}/answer`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': adminId || ''
      },
      body: JSON.stringify({ answer: answerText, admin_id: adminId })
    });

    const data = await res.json();

    if (data.success) {
      // Update the reflection in local state
      const idx = reflectionState.reflections.findIndex(r => r.id == id);
      if (idx !== -1) {
        reflectionState.reflections[idx] = data.data;
      }

      updateCounts();
      renderReflections();
      closeModal('modal-answer-refleksi');

      showToast('✅ Jawaban berhasil dikirim!');
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal mengirim jawaban'));
    }
  } catch (e) {
    console.error('Error sending answer:', e);
    showToast('⚠️ Gagal mengirim jawaban');
  }

  reflectionState.pendingAnswerId = null;
}

// ══════════════════ POLLING ══════════════════
function startReflectionPolling() {
  if (reflectionState.pollingInterval) {
    clearInterval(reflectionState.pollingInterval);
  }

  reflectionState.pollingInterval = setInterval(async () => {
    try {
      const studentId = state.isAdmin ? '' : (state.user?.id || '');
      const adminId = state.isAdmin ? (state.user?.id || '') : '';
      const res = await fetch(`/api/reflection?student_id=${studentId}&admin_id=${adminId}&is_admin=${state.isAdmin}`, { credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        const oldReflections = reflectionState.reflections;
        const newReflections = data.data;

        // Deteksi perubahan: jumlah berbeda (hapus/tambah) ATAU ada jawaban baru
        const countChanged = newReflections.length !== oldReflections.length;
        const answerChanged = !countChanged && newReflections.some(newR => {
          const oldR = oldReflections.find(o => o.id === newR.id);
          return oldR && (newR.is_answered !== oldR.is_answered || newR.answer !== oldR.answer);
        });

        reflectionState.reflections = newReflections;

        if (countChanged || answerChanged) {
          updateCounts();
          renderReflections();
          // Notifikasi siswa jika ada jawaban baru dari guru
          if (answerChanged && !state.isAdmin) {
            showToast('💬 Guru telah menjawab pertanyaanmu!');
          }
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, 5000); // Poll every 5 seconds
}

function stopReflectionPolling() {
  if (reflectionState.pollingInterval) {
    clearInterval(reflectionState.pollingInterval);
    reflectionState.pollingInterval = null;
  }
}

// ══════════════════ DELETE REFLECTION (ADMIN) ══════════════════
async function deleteReflection(id) {
  if (!confirm('Yakin ingin menghapus pertanyaan ini?')) return;

  try {
    const res = await fetch(`/api/reflection/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({
        admin_id: state.user?.id,
        is_admin: state.isAdmin
      })
    });

    const data = await res.json();

    if (data.success) {
      // Hapus dari local state langsung
      reflectionState.reflections = reflectionState.reflections.filter(r => r.id != id);
      updateCounts();
      renderReflections();
      showToast('🗑 Pertanyaan berhasil dihapus');
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal menghapus pertanyaan'));
    }
  } catch (e) {
    console.error('Error deleting reflection:', e);
    showToast('⚠️ Gagal menghapus pertanyaan');
  }
}

// ══════════════════ REFLEKSI QUESTIONS FOR STUDENT (Tahap 5) ══════════════════

// Muat SEMUA pertanyaan refleksi untuk SISWA (tanpa filter role)
async function loadStudentPrepQuestions() {
  try {
    // Load ALL refleksi questions since students don't have eco_role anymore
    const res = await fetch('/api/refleksi-questions/student?role=all');
    const data = await res.json();

    if (data.success) {
      renderStudentRefleksiQuestions(data.data || [], 'all');
    }
  } catch (e) {
    console.error('[Tahap5] Error loading student refleksi questions:', e);
  }
}

// Tampilkan pertanyaan refleksi di panel siswa (dengan kolom jawaban)
function renderStudentRefleksiQuestions(questions, role) {
  const panel = document.getElementById('studentPrepQuestionsPanel');
  const list = document.getElementById('studentPrepQuestionsList');
  const noMessage = document.getElementById('noStudentPrepQuestionsMessage');
  const roleLabel = document.getElementById('studentPrepRoleLabel');

  if (!panel) return;

  // Selalu tampilkan panel
  panel.style.display = 'block';

  // Label role
  const roleLabels = {
    'peneliti': '🔬 Pertanyaan Refleksi untuk Paket Peneliti',
    'aktivis':  '🌿 Pertanyaan Refleksi untuk Paket Aktivis',
    'pedagang': '🛒 Pertanyaan Refleksi untuk Paket Pedagang',
    'all':      '🌐 Pertanyaan Refleksi Universal untuk Semua Role'
  };
  if (roleLabel) {
    roleLabel.textContent = roleLabels[role] || roleLabels['all'];
  }

  if (!questions || questions.length === 0) {
    if (list) list.innerHTML = '';
    if (noMessage) noMessage.style.display = 'block';
    return;
  }

  if (noMessage) noMessage.style.display = 'none';

  if (list) {
    list.innerHTML = `
      <div>
        ${questions.map((q, i) => `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:14px 4px;border-bottom:1px solid var(--green-pale)">
            <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#fbbf24;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem">${i + 1}</div>
            <div style="flex:1">
              <div style="font-size:0.92rem;color:var(--dark);line-height:1.5;margin-bottom:0.6rem">${q.question_text}</div>
              <textarea
                class="student-prep-answer"
                data-qid="${q.id}"
                placeholder="Tulis jawaban refleksimu di sini..."
                rows="3"
                style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.6rem 0.8rem;font-family:'Nunito',sans-serif;font-size:0.85rem;resize:vertical;box-sizing:border-box;transition:border 0.18s"
                onfocus="this.style.borderColor='var(--green)'"
                onblur="this.style.borderColor='var(--green-pale)'"
              ></textarea>
            </div>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:0.75rem;margin-top:1rem">
          <span id="prepAnswerTahap5Status" style="font-size:0.8rem;color:var(--gray);font-weight:600"></span>
          <button class="btn-sm green" onclick="submitStudentRefleksiAnswers()">Submit Jawaban ✅</button>
        </div>
      </div>
    `;
  }
}

// Simpan jawaban siswa untuk pertanyaan refleksi di tahap 5
async function submitStudentRefleksiAnswers() {
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
  const inputs = document.querySelectorAll('#studentPrepQuestionsList .student-prep-answer');
  const status = document.getElementById('prepAnswerTahap5Status');

  let saved = 0;
  for (const inp of inputs) {
    const val = inp.value.trim();
    if (!val) continue;
    try {
      const res = await fetch('/api/student/refleksi-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({
          question_id: inp.dataset.qid,
          answer: val,
          student_id: state.user?.id
        })
      });
      const data = await res.json();
      if (data.success) saved++;
    } catch (e) {
      console.error('[Tahap5] Error saving refleksi answer:', e);
    }
  }

  if (saved > 0) {
    if (status) status.textContent = `✅ ${saved} jawaban tersimpan`;
    showToast(`✅ ${saved} jawaban refleksi berhasil tersimpan!`);
  } else {
    showToast('⚠️ Isi setidaknya satu jawaban dulu!');
  }
}



// ══════════════════ REFLEKSI QUESTIONS MANAGEMENT (ADMIN) ══════════════════
let prepQuestionsState = {
  allQuestions: [],
  filteredQuestions: [],
  currentFilter: 'all'
};

// Load refleksi questions for admin (CRUD panel)
async function loadAdminPrepQuestions() {
  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch('/api/refleksi-questions', {
      headers: {
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': state.user?.id || ''
      }
    });
    const data = await res.json();

    if (data.success) {
      prepQuestionsState.allQuestions = data.data || [];
      filterPrepQuestions(prepQuestionsState.currentFilter);
    }
  } catch (e) {
    console.error('Error loading admin refleksi questions:', e);
  }
}

// Filter prep questions by role
function filterPrepQuestions(role) {
  prepQuestionsState.currentFilter = role;

  // Update tab styles
  document.querySelectorAll('#adminPrepQuestionsPanel .filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.role === role);
  });

  if (role === 'all') {
    prepQuestionsState.filteredQuestions = prepQuestionsState.allQuestions;
  } else {
    prepQuestionsState.filteredQuestions = prepQuestionsState.allQuestions.filter(q => q.role === role);
  }

  renderPrepQuestions();
}

// Render prep questions list
function renderPrepQuestions() {
  const container = document.getElementById('prepQuestionsList');
  const noMessage = document.getElementById('noPrepQuestionsMessage');

  if (!container) return;

  const questions = prepQuestionsState.filteredQuestions;

  if (questions.length === 0) {
    container.innerHTML = '';
    if (noMessage) noMessage.style.display = 'block';
    return;
  }

  if (noMessage) noMessage.style.display = 'none';

  const roleLabels = {
    'peneliti': { emoji: '🔬', text: 'Peneliti', color: '#3b82f6' },
    'aktivis': { emoji: '🌿', text: 'Aktivis', color: '#22c55e' },
    'pedagang': { emoji: '🛒', text: 'Pedagang', color: '#f59e0b' },
    'all': { emoji: '🌐', text: 'Universal', color: '#8b5cf6' }
  };

  container.innerHTML = questions.map(q => {
    const roleInfo = roleLabels[q.role] || roleLabels['all'];
    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px;background:var(--card-bg);border-radius:8px;margin-bottom:8px;border-left:3px solid ${roleInfo.color}">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="background:${roleInfo.color}20;color:${roleInfo.color};font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:99px">${roleInfo.emoji} ${roleInfo.text}</span>
            <span style="font-size:0.72rem;color:var(--gray)">#${q.order}</span>
          </div>
          <div style="font-size:0.9rem;color:var(--dark)">${q.question_text}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn-sm" style="background:var(--green-pale);color:var(--green-deep);padding:4px 10px;font-size:0.72rem" onclick="editPrepQuestion(${q.id})">✏️ Edit</button>
          <button class="btn-sm" style="background:#fee2e2;color:#dc2626;padding:4px 10px;font-size:0.72rem" onclick="deletePrepQuestion(${q.id})">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// Open add question modal
let editingPrepQuestionId = null;

function openAddPrepQuestion() {
  editingPrepQuestionId = null;
  document.getElementById('prepQuestionText').value = '';
  document.getElementById('prepQuestionRole').value = 'peneliti';
  document.getElementById('prepQuestionSaveBtn').textContent = '💾 Simpan';
  openModal('modal-prep-question');
}

// Edit existing question
function editPrepQuestion(id) {
  const question = prepQuestionsState.allQuestions.find(q => q.id == id);
  if (!question) return;

  editingPrepQuestionId = id;
  document.getElementById('prepQuestionText').value = question.question_text;
  document.getElementById('prepQuestionRole').value = question.role;
  document.getElementById('prepQuestionSaveBtn').textContent = '💾 Update';
  openModal('modal-prep-question');
}

// Save refleksi question (add or update)
async function savePrepQuestion() {
  const text = document.getElementById('prepQuestionText')?.value?.trim();
  const role = document.getElementById('prepQuestionRole')?.value;

  if (!text) {
    showToast('⚠️ Pertanyaan tidak boleh kosong!');
    return;
  }

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    let url = '/api/refleksi-questions';
    let method = 'POST';
    let body = JSON.stringify({ question_text: text, role });

    if (editingPrepQuestionId) {
      url = `/api/refleksi-questions/${editingPrepQuestionId}`;
      method = 'PUT';
      body = JSON.stringify({ question_text: text, role });
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': state.user?.id || ''
      },
      body
    });

    const data = await res.json();

    if (data.success) {
      closeModal('modal-prep-question');
      await loadAdminPrepQuestions();
      showToast(editingPrepQuestionId ? '✅ Pertanyaan refleksi berhasil diperbarui!' : '✅ Pertanyaan refleksi berhasil ditambahkan!');
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal menyimpan pertanyaan'));
    }
  } catch (e) {
    console.error('Error saving refleksi question:', e);
    showToast('⚠️ Gagal menyimpan pertanyaan');
  }
}

// Delete refleksi question
async function deletePrepQuestion(id) {
  if (!confirm('Yakin ingin menghapus pertanyaan ini?')) return;

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const res = await fetch(`/api/refleksi-questions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token,
        'X-Admin-Id': state.user?.id || ''
      }
    });

    const data = await res.json();

    if (data.success) {
      await loadAdminPrepQuestions();
      showToast('🗑️ Pertanyaan refleksi berhasil dihapus!');
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal menghapus pertanyaan'));
    }
  } catch (e) {
    console.error('Error deleting refleksi question:', e);
    showToast('⚠️ Gagal menghapus pertanyaan');
  }
}

// Export functions globally
window.renderTahap5 = renderTahap5;
window.submitRefleksi = submitRefleksi;
window.replyComment = replyComment;
window.filterRefleksi = filterRefleksi;
window.openAnswerModal = openAnswerModal;
window.sendAnswer = sendAnswer;
window.deleteReflection = deleteReflection;
// Admin refleksi questions (CRUD panel)
window.loadAdminPrepQuestions = loadAdminPrepQuestions;
// Student refleksi questions (tahap 5)
window.loadStudentPrepQuestions = loadStudentPrepQuestions;
window.submitStudentRefleksiAnswers = submitStudentRefleksiAnswers;
window.filterPrepQuestions = filterPrepQuestions;
window.openAddPrepQuestion = openAddPrepQuestion;
window.editPrepQuestion = editPrepQuestion;
window.savePrepQuestion = savePrepQuestion;
window.deletePrepQuestion = deletePrepQuestion;

