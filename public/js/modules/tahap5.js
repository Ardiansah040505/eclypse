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
  } else {
    if (studentView) studentView.style.display = 'block';
    if (adminView) adminView.style.display = 'none';
    if (recapPanel) recapPanel.style.display = 'none';
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

// Export functions globally
window.renderTahap5 = renderTahap5;
window.submitRefleksi = submitRefleksi;
window.replyComment = replyComment;
window.filterRefleksi = filterRefleksi;
window.openAnswerModal = openAnswerModal;
window.sendAnswer = sendAnswer;
window.deleteReflection = deleteReflection;
