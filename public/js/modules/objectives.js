// ══════════════════════════════════════════════════════════════════════════
// LEARNING OBJECTIVES (Tujuan Pembelajaran) MODULE
// ══════════════════════════════════════════════════════════════════════════

// Simple HTML Escaper
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Fetch and render learning objectives
async function loadLearningObjectives() {
    const container = document.getElementById('objectivesListContainer');
    const addBtn = document.getElementById('addObjectiveBtn');

    if (!container) return;

    // Toggle Add Button based on Admin status
    if (addBtn) {
        addBtn.style.display = state.isAdmin ? 'inline-block' : 'none';
    }

    try {
        const response = await fetch('/api/learning-objectives', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();

        if (data.success) {
            state.learningObjectives = data.data;
            renderLearningObjectives();
        } else {
            container.innerHTML = `<div style="color:red; font-style:italic">Gagal memuat tujuan pembelajaran.</div>`;
        }
    } catch (e) {
        console.error('Error loading objectives:', e);
        container.innerHTML = `<div style="color:var(--gray); font-style:italic">Koneksi gagal saat memuat tujuan pembelajaran.</div>`;
    }
}

// Render learning objectives list
function renderLearningObjectives() {
    const container = document.getElementById('objectivesListContainer');
    if (!container) return;

    const objectives = state.learningObjectives || [];

    if (objectives.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:1.5rem; background:rgba(0,0,0,0.02); border-radius:12px; border: 1px dashed rgba(0,0,0,0.1)">
                <div style="font-size:1.8rem; margin-bottom:0.5rem">🍃</div>
                <div style="color:var(--gray); font-size:0.9rem">Belum ada tujuan pembelajaran yang ditambahkan oleh Guru.</div>
            </div>
        `;
        return;
    }

    let html = '';
    objectives.forEach(obj => {
        const escapedText = escapeHtml(obj.text);
        html += `
            <div class="objective-item" style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; padding:12px 16px; background:#f9fbf9; border: 1px solid rgba(82,183,136,0.15); border-radius:12px; transition:all 0.2s">
                <div style="display:flex; gap:10px; align-items:flex-start">
                    <span style="color:var(--green-light); font-weight:bold; font-size:1.1rem; line-height:1.2">✔️</span>
                    <span style="font-size:0.95rem; color:var(--dark); line-height:1.4">${escapedText}</span>
                </div>
                ${state.isAdmin ? `
                    <div style="display:flex; gap:6px; flex-shrink:0">
                        <button class="btn-sm yellow" onclick="openEditObjectiveModal(${obj.id})" style="padding:4px 8px; font-size:0.75rem">✏️ Edit</button>
                        <button class="btn-sm" onclick="deleteObjective(${obj.id})" style="padding:4px 8px; font-size:0.75rem; background:#d9534f; color:white">🗑 Hapus</button>
                    </div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

// Open modal to add new objective
function openAddObjectiveModal() {
    document.getElementById('objectiveId').value = '';
    document.getElementById('objectiveText').value = '';
    document.getElementById('objectiveModalTitle').textContent = '🎯 Tambah Tujuan Pembelajaran';
    openModal('modal-learning-objective');
}

// Open modal to edit objective
function openEditObjectiveModal(id) {
    const obj = state.learningObjectives.find(o => o.id === id);
    if (!obj) return;

    document.getElementById('objectiveId').value = obj.id;
    document.getElementById('objectiveText').value = obj.text;
    document.getElementById('objectiveModalTitle').textContent = '✏️ Edit Tujuan Pembelajaran';
    openModal('modal-learning-objective');
}

// Save objective (Create or Update)
async function saveLearningObjective() {
    const id = document.getElementById('objectiveId').value;
    const text = document.getElementById('objectiveText').value.trim();

    if (!text) {
        showToast('⚠️ Tujuan pembelajaran tidak boleh kosong!');
        return;
    }

    const isEdit = id !== '';
    const url = isEdit ? `/api/admin/learning-objectives/${id}` : '/api/admin/learning-objectives';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ text })
        });
        const data = await response.json();

        if (data.success) {
            closeModal('modal-learning-objective');
            showToast(isEdit ? '✅ Berhasil mengubah tujuan pembelajaran!' : '✅ Berhasil menambah tujuan pembelajaran!');
            await loadLearningObjectives();
        } else {
            showToast('❌ Gagal menyimpan tujuan pembelajaran');
        }
    } catch (e) {
        console.error('Error saving objective:', e);
        showToast('❌ Terjadi kesalahan saat menyimpan');
    }
}

// Delete objective
async function deleteObjective(id) {
    if (!confirm('Apakah Bapak/Ibu yakin ingin menghapus tujuan pembelajaran ini?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/learning-objectives/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });
        const data = await response.json();

        if (data.success) {
            showToast('✅ Berhasil menghapus tujuan pembelajaran!');
            await loadLearningObjectives();
        } else {
            showToast('❌ Gagal menghapus tujuan pembelajaran');
        }
    } catch (e) {
        console.error('Error deleting objective:', e);
        showToast('❌ Terjadi kesalahan saat menghapus');
    }
}

// Export functions to window
window.loadLearningObjectives = loadLearningObjectives;
window.renderLearningObjectives = renderLearningObjectives;
window.openAddObjectiveModal = openAddObjectiveModal;
window.openEditObjectiveModal = openEditObjectiveModal;
window.saveLearningObjective = saveLearningObjective;
window.deleteObjective = deleteObjective;
