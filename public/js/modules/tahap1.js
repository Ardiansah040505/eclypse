// ══════════════════════════════════════════════════════════════════════════
// TAHAP 1 - Climate News (Berita Perubahan Iklim)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════ LOAD NEWS FROM API ══════════════════
async function loadNews() {

    try{
        console.log("AKAN FETCH KE LARAVEL");
        const response = await fetch('/api/admin/news');
        console.log(response.status);
        const news = await response.json();

        state.news = news.map(item => ({

            id: item.id,
            title: item.title,
            body: item.content,
            tag: item.tag,
            image: item.thumbnail,
            // Transform questions dari format database ke format frontend
            questions: (item.questions || []).map(q => {
                // Esai tidak punya options
                if (q.type === 'essay') {
                    return {
                        id: q.id,
                        text: q.question,
                        type: 'essay'
                    };
                }
                // Multiple choice
                const answer = q.options?.findIndex(o => o.is_correct) ?? 0;
                return {
                    id: q.id,
                    text: q.question,
                    type: 'mc',
                    options: (q.options || []).map(o => o.option_text),
                    answer: answer
                };
            })
        }));

        console.log("JUMLAH BERITA =", state.news.length);

        // Load saved answers dari database
        await loadStudentAnswers();

        renderTahap1();

    } catch(e) {

        console.error(e);

    }

}

// ══════════════════ LOAD STUDENT ANSWERS FROM DATABASE ══════════════════
async function loadStudentAnswers() {
    if (state.isAdmin) return; // Admin tidak perlu load answers

    try {
        // Load progress untuk setiap berita
        for (const news of state.news) {
            try {
                const response = await fetch(`/api/student/news/${news.id}/answer?student_id=${state.user?.id || ''}`);
                if (response.status === 401) {
                    // User belum login, skip
                    console.log('User belum login, skip load answers');
                    return;
                }
                const data = await response.json();

                if (data.success && data.data) {
                    // Simpan ke state
                    if (!state.dbAnswers) state.dbAnswers = {};
                    state.dbAnswers[news.id] = data.data;

                    // Update progress tracking
                    if (!state.newsProgress) state.newsProgress = {};
                    state.newsProgress[news.id] = {
                        answered_count: data.data.answered_count,
                        total_questions: data.data.total_questions,
                        is_completed: data.data.is_completed
                    };
                }
            } catch(e) {
                console.error(`Error loading answer for news ${news.id}:`, e);
            }
        }

        console.log("Loaded student answers:", state.dbAnswers);
        updateProgressBar();

    } catch(e) {
        console.error("Error loading student answers:", e);
    }
}

// ══════════════════ RENDER TAHAP 1 (NEWS LIST) ══════════════════
function renderTahap1() {
  // Admin bar
  const adminBar = document.getElementById('adminBar1');
  if (adminBar) adminBar.style.display = state.isAdmin ? 'block' : 'none';

  // News list
  const nc = document.getElementById('newsContainer');
  if (!nc) return;

  // Reload progress from localStorage if state is empty
  loadProgressFromLocal();

  nc.innerHTML = state.news.map((n, i) => {
    // Check progress for this news - check both state and localStorage
    let progress = state.newsProgress ? state.newsProgress[n.id] : null;

    // Also check localStorage for persisted progress
    if (!progress) {
      const recap = JSON.parse(localStorage.getItem('eclypse_recap') || '{}');
      if (recap.climateNews && recap.climateNews[n.id]) {
        const saved = recap.climateNews[n.id];
        progress = {
          answered_count: Object.keys(saved.jawaban || {}).length,
          total_questions: saved.questions?.length || saved.jawaban ? Object.keys(saved.jawaban).length : 0,
          is_completed: saved.jawaban && saved.questions && Object.keys(saved.jawaban).length >= saved.questions.length
        };
      }
    }

    let statusBadge = '';
    if (progress) {
      if (progress.is_completed) {
        statusBadge = '<span class="news-status-badge completed">✅ Selesai</span>';
      } else {
        statusBadge = `<span class="news-status-badge partial">📝 ${progress.answered_count}/${progress.total_questions}</span>`;
      }
    } else if (n.questions && n.questions.length > 0) {
      // Has questions but not answered yet - show empty state hint
      statusBadge = `<span class="news-status-badge">📋 ${n.questions.length} soal</span>`;
    }

    return `
    <div class="news-card">
      ${n.image ? `<img src="${n.image}" class="news-card-image" alt="${n.title}" onerror="this.style.display='none'">` : ''}
      <div class="news-card-header">
        <div class="news-tag">📰 ${n.tag || 'Berita'}</div>
        ${statusBadge}
      </div>
      <h3>${n.title}</h3>
      <p>${(n.body || n.content || '').slice(0, 180)}...</p>
      <div class="news-card-actions">
        ${state.isAdmin ? `<button class="btn-sm yellow" onclick="openNewsEditor(${i})">✏️ Edit</button><button class="btn-sm" style="background:#d9534f;color:white" onclick="deleteNews(${i})">🗑 Hapus</button>` : ''}
        <button class="btn-sm green" onclick="openNews(${i})">Baca Berita & Jawab →</button>
      </div>
    </div>
  `}).join('');
}

// Load progress from localStorage
function loadProgressFromLocal() {
  try {
    const recap = JSON.parse(localStorage.getItem('eclypse_recap') || '{}');
    if (recap.climateNews && state.news) {
      for (const newsId in recap.climateNews) {
        const saved = recap.climateNews[newsId];
        const news = state.news.find(n => n.id == newsId || n.id === parseInt(newsId));
        if (news) {
          if (!state.newsProgress) state.newsProgress = {};
          const answeredCount = Object.keys(saved.jawaban || {}).filter(k => saved.jawaban[k] !== '' && saved.jawaban[k] !== null).length;
          const totalQuestions = saved.questions?.length || 0;
          state.newsProgress[news.id] = {
            answered_count: answeredCount,
            total_questions: totalQuestions,
            is_completed: totalQuestions > 0 && answeredCount >= totalQuestions
          };
        }
      }
    }
  } catch (e) {
    console.error('Error loading progress from localStorage:', e);
  }
}

// ══════════════════ OPEN NEWS DETAIL ══════════════════
function openNews(index) {
  state.selectedNewsIndex = index;
  goTo('news-detail');
}

// ══════════════════ RENDER NEWS DETAIL ══════════════════
function renderNewsDetail() {
  const n = state.news[state.selectedNewsIndex];
  if (!n) { goTo('tahap1'); return; }
  const questions = n.questions || [];

  // Load saved answers from database or local
  const savedAnswers = {};
  if (state.dbAnswers && state.dbAnswers[n.id]) {
    // Use database answers
    Object.assign(savedAnswers, state.dbAnswers[n.id].answers);
  } else if (state.answers[state.selectedNewsIndex]) {
    // Use local answers
    Object.assign(savedAnswers, state.answers[state.selectedNewsIndex]);
  }

  const mcQuestions = questions.filter(q => !q.type || q.type === 'mc');
  const essayQuestions = questions.filter(q => q.type === 'essay');

  const mcHtml = mcQuestions.map((q, qi) => {
    const globalIdx = questions.indexOf(q);
    return `
      <div class="question-text">${qi + 1}. ${q.text}</div>
      <div class="multiple-choice">${q.options.map((option, oi) => `
        <label class="choice-option"><input type="radio" name="news-question-${globalIdx}" value="${oi}" ${savedAnswers[globalIdx] === oi ? 'checked' : ''}><span class="choice-letter">${'ABCD'[oi]}</span><span>${option}</span></label>
      `).join('')}</div>`;
  }).join('');

  const essayHtml = essayQuestions.map((q, ei) => {
    const globalIdx = questions.indexOf(q);
    const savedEssay = savedAnswers[globalIdx] || '';
    return `
      <div class="question-text">${mcQuestions.length + ei + 1}. ${q.text}</div>
      <textarea
        class="essay-answer-input"
        placeholder="Tuliskan jawabanmu di sini..."
        rows="4"
        data-qidx="${globalIdx}"
        style="width:100%;border:2px solid var(--green-pale);border-radius:10px;padding:0.7rem 1rem;font-family:'Nunito',sans-serif;font-size:0.88rem;resize:vertical;box-sizing:border-box;margin-bottom:0.75rem;transition:border 0.18s"
        onfocus="this.style.borderColor='var(--green)'"
        onblur="this.style.borderColor='var(--green-pale)'"
      >${savedEssay}</textarea>`;
  }).join('');

  const hasMC = mcQuestions.length > 0;
  const hasEssay = essayQuestions.length > 0;

  let questionHtml = '';
  if (hasMC) questionHtml += `<div class="question-counter">SOAL PILIHAN GANDA · ${mcQuestions.length} SOAL</div>${mcHtml}`;
  if (hasEssay) questionHtml += `<div class="question-counter" style="margin-top:${hasMC?'1.25rem':'0'}">SOAL ESAI · ${essayQuestions.length} SOAL</div>${essayHtml}`;

  document.getElementById('newsDetailContainer').innerHTML = `
    <button class="back-link" onclick="goTo('tahap1')">← Kembali ke daftar berita</button>
    <article class="news-detail">
      ${n.image ? `<img src="${n.image}" class="news-detail-image" alt="${n.title}" onerror="this.style.display='none'">` : ''}
      <div class="news-tag">📰 ${n.tag}</div><h2>${n.title}</h2>
      <p class="news-body">${n.body}</p>
      <div class="question-block">
        ${questions.length ? questionHtml : '<div class="question-text">Admin belum menambahkan soal untuk berita ini.</div>'}


        ${state.isAdmin ? `
        <button class="btn-sm yellow" onclick="openNewsEditor(${state.selectedNewsIndex})">
✏️       Edit Berita
        </button>

          <button class="btn-sm green" onclick="openQuestionModal(${state.selectedNewsIndex})">
          ➕ Tambah Soal
          </button>
` : ''}

        ${questions.length ? `<br><button class="btn-next" onclick="saveNewsAnswer()">Simpan Jawaban ✓</button>` : ''}
      </div>
    </article>`;
}

// ══════════════════ SAVE NEWS ANSWER ══════════════════
async function saveNewsAnswer() {
  const news = state.news[state.selectedNewsIndex];
  const questions = news.questions || [];
  const answers = {};

  // Collect answers dari UI
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.type || q.type === 'mc') {
      const selected = document.querySelector(`input[name="news-question-${i}"]:checked`);
      if (!selected) { showToast(`⚠️ Pilih jawaban soal pilihan ganda nomor ${i + 1} dulu!`); return; }
      answers[i] = Number(selected.value);
    } else if (q.type === 'essay') {
      const ta = document.querySelector(`.essay-answer-input[data-qidx="${i}"]`);
      const val = ta ? ta.value.trim() : '';
      if (!val) { showToast(`⚠️ Isi jawaban esai nomor ${i + 1} dulu!`); return; }
      answers[i] = val;
    }
  }

  // Simpan ke localStorage (backup)
  state.answers[state.selectedNewsIndex] = answers;

  // Get CSRF token
  const token = document.querySelector('meta[name="csrf-token"]')?.content || '';

  // Simpan ke database
  try {
    const response = await fetch(`/api/student/news/${news.id}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        
      },
      body: JSON.stringify({ answers: answers, student_id: state.user?.id })
    });

    if (response.status === 401) {
      // User belum login, tetap simpan local
      showToast('⚠️ Login required. Jawaban disimpan secara lokal.');
      if (!state._newsRecap) state._newsRecap = {};
      state._newsRecap[state.selectedNewsIndex] = { judul: news.title, jawaban: answers, questions };
      saveStudentRecap('climateNews', state._newsRecap);
      updateProgressBar();
      return;
    }

    const data = await response.json();

    if (data.success) {
      // Update progress tracking
      if (!state.newsProgress) state.newsProgress = {};
      state.newsProgress[news.id] = {
        answered_count: data.data.answered_count,
        total_questions: data.data.total_questions,
        is_completed: data.data.is_completed
      };

      // Update dbAnswers state
      if (!state.dbAnswers) state.dbAnswers = {};
      state.dbAnswers[news.id] = {
        answers: answers,
        answered_count: data.data.answered_count,
        total_questions: data.data.total_questions,
        is_completed: data.data.is_completed
      };

      // Simpan ke rekap localStorage
      if (!state._newsRecap) state._newsRecap = {};
      state._newsRecap[state.selectedNewsIndex] = { judul: news.title, jawaban: answers, questions };
      saveStudentRecap('climateNews', state._newsRecap);

      updateProgressBar();

      // Check and trigger spin wheel after completing all news
      setTimeout(() => {
        checkAndTriggerSpinWheel();
      }, 500);

      // Show success message and go back to news list
      if (data.data.is_completed) {
        showToast('🎉 Semua soal dijawab! Tahap 1 selesai!', 3000);
      } else {
        showToast('✅ Jawaban berhasil disimpan!', 2000);
      }

      // Auto go back to news list after short delay
      setTimeout(() => {
        goTo('tahap1');
      }, 1500);
    } else {
      showToast('⚠️ ' + (data.message || 'Gagal menyimpan ke server'));
    }
  } catch(e) {
    console.error(e);
    // Fallback: tetap simpan local
    if (!state._newsRecap) state._newsRecap = {};
    state._newsRecap[state.selectedNewsIndex] = { judul: news.title, jawaban: answers, questions };
    saveStudentRecap('climateNews', state._newsRecap);
    updateProgressBar();
    showToast('✅ Jawaban tersimpan (offline)');
    setTimeout(() => {
      goTo('tahap1');
    }, 1500);
  }
}

// ══════════════════ QUESTION EDITOR (FOR ADMIN) ══════════════════
function questionFormHtml(number, question = null, type = null) {
  const qtype = type || question?.type || 'mc';
  if (qtype === 'essay') {
    const val = question || { text: '', type: 'essay' };
    return `<div class="question-editor essay-editor">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <label style="margin:0">Soal Esai ${number} <span style="background:#e8f0fe;color:#1a3a7a;font-size:0.7rem;padding:2px 8px;border-radius:99px;font-weight:700;margin-left:6px">ESAI</span></label>
        <button type="button" class="editor-remove" onclick="removeQuestionForm(this)">Hapus</button>
      </div>
      <textarea class="mc-question essay-question" placeholder="Tulis pertanyaan esai..." style="min-height:80px">${val.text}</textarea>
      <input type="hidden" class="mc-essay-flag" value="essay">
    </div>`;
  }
  // default: pilihan ganda
  const values = question || { text:'', options:['', '', '', ''], answer:0 };
  return `<div class="question-editor">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <label style="margin:0">Soal PG ${number} <span style="background:var(--green-pale);color:var(--green-deep);font-size:0.7rem;padding:2px 8px;border-radius:99px;font-weight:700;margin-left:6px">PILIHAN GANDA</span></label>
      <button type="button" class="editor-remove" onclick="removeQuestionForm(this)">Hapus</button>
    </div>
    <textarea class="mc-question" placeholder="Tulis pertanyaan...">${values.text}</textarea>
    <label>Pilihan jawaban</label>
    <div class="option-grid">
      ${['A', 'B', 'C', 'D'].map((letter, index) => `<input class="mc-option" placeholder="${letter}. Pilihan ${letter}" value="${values.options[index] || ''}">`).join('')}
    </div>
    <label>Jawaban yang benar</label>
    <select class="mc-answer"><option value="0" ${values.answer === 0 ? 'selected' : ''}>A</option><option value="1" ${values.answer === 1 ? 'selected' : ''}>B</option><option value="2" ${values.answer === 2 ? 'selected' : ''}>C</option><option value="3" ${values.answer === 3 ? 'selected' : ''}>D</option></select>
  </div>`;
}

function addQuestionForm(containerId = 'questionBuilder', question = null, type = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.insertAdjacentHTML('beforeend', questionFormHtml(container.children.length + 1, question, type));
}

function initQuestionBuilder(containerId = 'questionBuilder', questions = []) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (questions.length) questions.forEach(question => addQuestionForm(containerId, question));
  else addQuestionForm(containerId);
}

function removeQuestionForm(button) {
  const builder = button.closest('[id$="questionBuilder"], [id$="QuestionBuilder"]');
  button.closest('.question-editor').remove();
  [...builder.querySelectorAll('.question-editor')].forEach((editor, index) => {
    editor.querySelector('label').textContent = `Soal ${index + 1}`;
  });
}

function collectQuestionForms(containerId) {
  return [...document.querySelectorAll(`#${containerId} .question-editor`)].map(editor => {
    const text = editor.querySelector('.mc-question').value.trim();
    if (!text) return null;
    // cek apakah esai
    if (editor.querySelector('.mc-essay-flag')) {
      return { type: 'essay', text };
    }
    const options = [...editor.querySelectorAll('.mc-option')].map(input => input.value.trim());
    const answer = Number(editor.querySelector('.mc-answer').value);
    if (options.some(option => !option)) return null;
    return { type: 'mc', text, options, answer };
  }).filter(Boolean);
}

// ══════════════════ SAVE QUESTIONS (ADMIN) ══════════════════
async function saveArticleQuestions(){

    console.log("SAVE QUESTION");

    const news = state.news[state.selectedNewsIndex];

    if(!news){

        alert("News tidak ditemukan");

        return;

    }

    const questions = collectQuestionForms("newQuestionBuilder");

    if(questions.length===0){

        alert("Isi minimal satu soal");

        return;

    }

    const token=document
        .querySelector('meta[name="csrf-token"]')
        .content;

    for(const [i, q] of questions.entries()){

        console.log("KIRIM SOAL KE-" + (i+1), q);

        const response=await fetch(
            "/api/admin/news/"+news.id+"/question",
            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    "Accept":"application/json",

                    

                },

                body:JSON.stringify({

                    question:q.text,

                    type: q.type,

                    options: q.options,

                    answer: q.answer,

                    order: i + 1

                })

            }
        );

        const data=await response.json();

        console.log("HASIL:", data);

    }

    closeModal("modal-addquestion");

    await loadNews();

    showToast("✅ Soal berhasil ditambahkan");

}

function openQuestionModal(index){

    state.selectedNewsIndex = index;

    document.getElementById("newQuestionBuilder").innerHTML = "";

    initQuestionBuilder("newQuestionBuilder");

    openModal("modal-addquestion");

}

// ══════════════════ NEWS EDITOR (ADMIN) ══════════════════
function openNewsEditor(index){

    state.selectedNewsIndex=index;

    const news=state.news[index];

    document.getElementById('editNewsTitle').value=news.title;

    document.getElementById('editNewsBody').value=news.body;

    document.getElementById('editNewsTag').value=news.tag||"";

    document.getElementById('editNewsImage').value=news.image||"";

    previewNewsImage(news.image||"","editNewsImagePreview");

    openModal('modal-editnews');

}

async function saveNewsEdits(){

    const index=state.selectedNewsIndex;

    const news=state.news[index];

    const token=document
        .querySelector('meta[name="csrf-token"]')
        .content;

    const response=await fetch('/api/admin/news/'+news.id,{

        method:'PUT',

        headers:{

            'Content-Type':'application/json',

            'Accept':'application/json',

            

        },

        body:JSON.stringify({

            title:document.getElementById('editNewsTitle').value,

            content:document.getElementById('editNewsBody').value,

            tag:document.getElementById('editNewsTag').value,

            thumbnail:document.getElementById('editNewsImage').value

        })

    });

    const data=await response.json();

    if(data.success){

        closeModal('modal-editnews');

        await loadNews();

        showToast("✅ Berhasil diupdate");

    }

}

async function deleteNews(index){

    if(!confirm("Hapus berita ini?")) return;

    const token=document
        .querySelector('meta[name="csrf-token"]')
        .content;

    const id=state.news[index].id;

    const response=await fetch('/api/admin/news/'+id,{

        method:'DELETE',

        headers:{

            'Accept':'application/json',

            

        }

    });

    const data=await response.json();

    if(data.success){

        await loadNews();

        showToast("🗑 Berita berhasil dihapus");

    }

}

function previewNewsImage(url, targetId) {

    const el = document.getElementById(targetId);

    if (!el) return;

    el.innerHTML = "";

    if (!url.trim()) return;

    const img = document.createElement("img");

    img.src = url;

    img.style.maxWidth = "100%";
    img.style.maxHeight = "140px";
    img.style.borderRadius = "8px";
    img.style.objectFit = "cover";

    img.onerror = function(){

        el.innerHTML =
        "<span style='color:red'>⚠️ Gambar tidak dapat dimuat</span>";

    };

    el.appendChild(img);

}

async function addNews() {

    const t = document.getElementById('newsTitle').value.trim();
    const b = document.getElementById('newsBody').value.trim();
    const tag = document.getElementById('newsTag').value.trim() || 'Berita';
    const image = document.getElementById('newsImage').value.trim();

    if (!t || !b) {
        showToast("⚠️ Isi semua field");
        return;
    }

    // Collect questions from questionBuilder
    const questions = collectQuestionForms('questionBuilder');

    const token = document
        .querySelector('meta[name="csrf-token"]')
        .content;

    // First, create the news
    const newsResponse = await fetch('/api/admin/news', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            
        },

        body: JSON.stringify({
            title: t,
            content: b,
            tag: tag,
            thumbnail: image
        })

    });

    const newsData = await newsResponse.json();

    if (newsData.success && newsData.news){
        // Then save all questions
        for (const [i, q] of questions.entries()) {
            await fetch('/api/admin/news/' + newsData.news.id + '/question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    
                },
                body: JSON.stringify({
                    question: q.text,
                    type: q.type,
                    options: q.options,
                    answer: q.answer,
                    order: i + 1
                })
            });
        }

        // Clear the form
        document.getElementById('newsTitle').value = '';
        document.getElementById('newsBody').value = '';
        document.getElementById('newsTag').value = '';
        document.getElementById('newsImage').value = '';
        document.getElementById('questionBuilder').innerHTML = '';
        document.getElementById('newsImagePreview').innerHTML = '';

        // Reload news list
        await loadNews();

        closeModal('modal-addnews');

        const qCount = questions.length;
        showToast(qCount > 0 ? `✅ Berita + ${qCount} soal berhasil ditambahkan!` : '✅ Berita berhasil ditambahkan (tanpa soal)');
    } else {
        showToast("❌ Gagal menambahkan berita");
    }
}

// Export functions globally
window.loadNews = loadNews;
window.renderTahap1 = renderTahap1;
window.openNews = openNews;
window.renderNewsDetail = renderNewsDetail;
window.saveNewsAnswer = saveNewsAnswer;
window.questionFormHtml = questionFormHtml;
window.addQuestionForm = addQuestionForm;
window.initQuestionBuilder = initQuestionBuilder;
window.removeQuestionForm = removeQuestionForm;
window.collectQuestionForms = collectQuestionForms;
window.saveArticleQuestions = saveArticleQuestions;
window.openQuestionModal = openQuestionModal;
window.openNewsEditor = openNewsEditor;
window.saveNewsEdits = saveNewsEdits;
window.deleteNews = deleteNews;
window.previewNewsImage = previewNewsImage;
window.addNews = addNews;
