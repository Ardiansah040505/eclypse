// ══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION - Login/Logout Functions
// ══════════════════════════════════════════════════════════════════════════

// Store auth token
function setAuthToken(token) {
    try {
        localStorage.setItem('eclypse_token', token);
    } catch(e) {
        console.error('Failed to store token:', e);
    }
}

function getAuthToken() {
    try {
        return localStorage.getItem('eclypse_token');
    } catch(e) {
        return null;
    }
}

function clearAuthToken() {
    try {
        localStorage.removeItem('eclypse_token');
    } catch(e) {}
}

// ══════════════════ LOGIN SISWA ══════════════════
async function doLoginSiswa() {

    console.log("LOGIN SISWA DIKLIK");

    const nama = document.getElementById('loginNama').value.trim();
    const nis = document.getElementById('loginNIS').value.trim();
    const sekolah = document.getElementById('loginSekolah').value.trim();

    if (!nama) {
        showToast('⚠️ Nama lengkap wajib diisi!');
        return;
    }

    if (!nis) {
        showToast('⚠️ NIS wajib diisi!');
        return;
    }

    if (!sekolah) {
        showToast('⚠️ Nama sekolah wajib diisi!');
        return;
    }

    try {

        const response = await fetch('/api/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify({

                name: nama,
                nis: nis,
                school: sekolah

            })

        });

        const data = await response.json();

        console.log(data);

        if (!data.success) {

            showToast("Login gagal");

            return;
        }

        // Store token for authentication
        if (data.token) {
            setAuthToken(data.token);
        }

        state.user = data.user;
        state.user.nama = data.user.name;
        state.user.sekolah = data.user.school;

        state.isAdmin = false;

        loginSuccess();

    } catch (e) {

        console.error(e);

        showToast("Tidak dapat terhubung ke server.");

    }

}

function doLogin() {
  // fallback lama, tidak dipakai lagi
  doLoginSiswa();
}

// ══════════════════ LOGIN ADMIN ══════════════════
function doLoginAdmin() {
    // Buka modal login admin (mengganti prompt() yang lambat)
    const errEl = document.getElementById('adminLoginError');
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
    const userEl = document.getElementById('adminUsername');
    const passEl = document.getElementById('adminPassword');
    if (userEl) userEl.value = '';
    if (passEl) passEl.value = '';
    openModal('modal-admin-login');
    // Focus ke field username setelah modal terbuka
    setTimeout(() => { if (userEl) userEl.focus(); }, 100);
}

async function submitAdminLogin() {
    const username = (document.getElementById('adminUsername')?.value || '').trim();
    const password = (document.getElementById('adminPassword')?.value || '').trim();
    const errEl   = document.getElementById('adminLoginError');
    const btn     = document.getElementById('adminLoginBtn');

    if (!username || !password) {
        if (errEl) { errEl.textContent = '⚠️ Username dan password wajib diisi.'; errEl.style.display = 'block'; }
        return;
    }

    // Loading state
    if (btn) { btn.textContent = 'Memproses...'; btn.disabled = true; }
    if (errEl) { errEl.style.display = 'none'; }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!data.success) {
            if (errEl) { errEl.textContent = '❌ ' + (data.message || 'Login gagal'); errEl.style.display = 'block'; }
            if (btn) { btn.textContent = 'Masuk sebagai Admin 🔐'; btn.disabled = false; }
            return;
        }

        // Store token
        if (data.token) setAuthToken(data.token);

        state.user    = data.user;
        state.isAdmin = true;

        closeModal('modal-admin-login');
        loginSuccess();

    } catch (e) {
        console.error(e);
        if (errEl) { errEl.textContent = '❌ Tidak dapat terhubung ke server.'; errEl.style.display = 'block'; }
        if (btn) { btn.textContent = 'Masuk sebagai Admin 🔐'; btn.disabled = false; }
    }
}

// ══════════════════ LOGIN SUCCESS ══════════════════
async function loginSuccess() {

    const displayName = state.user.nama || state.user.name || 'Siswa';

    document.getElementById('welcomeName').textContent = displayName;

    if (state.user.sekolah) {

        const greet=document.querySelector('.hero-greeting');

        if(greet){

            greet.textContent=`👋 Selamat datang · ${state.user.sekolah}`;

        }

    }

    document.getElementById('mainNavbar').style.display='flex';

    // Navigasi ke home DULU agar user tidak melihat blank screen
    goTo('home');

    generateLeaves();

    // Clean up stale online data when logging in
    cleanupStaleOnlineData();

    // Load data di background setelah halaman sudah ditampilkan
    try { await loadVideoData(); } catch(e) { console.warn('loadVideoData error:', e); }
    try { await loadNews(); } catch(e) { console.warn('loadNews error:', e); }

    console.log("NEWS =",state.news);

    startHeartbeat();

}

// ══════════════════ CLEANUP STALE ONLINE DATA ══════════════════
function cleanupStaleOnlineData() {
  try {
    const map = loadOnlineMap();
    const now = Date.now();
    const timeout = 60000; // 1 minute
    let cleaned = 0;

    for (const key in map) {
      if (map[key].lastSeen && (now - map[key].lastSeen) > timeout) {
        delete map[key];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      saveOnlineMap(map);
      console.log('Cleaned up', cleaned, 'stale online entries');
    }
  } catch (e) {
    console.error('Error cleaning up online data:', e);
  }
}

// ══════════════════ LOGOUT ══════════════════
async function doLogout() {
  // Stop heartbeat first
  stopHeartbeat();

  // Clear token
  clearAuthToken();

  // Clear local state
  state.user = null;
  state.isAdmin = false;
  state.dbAnswers = {};
  state.newsProgress = {};
  state.answers = {};

  // Clear localStorage data for this user
  try {
    localStorage.removeItem('eclypse_online');
    localStorage.removeItem('eclypse_recap');
    sessionStorage.removeItem('eclypse_page'); // Hapus halaman tersimpan saat logout
  } catch (e) {}

  document.getElementById('mainNavbar').style.display = 'none';
  goTo('login');
}

// ══════════════════ ENTER KEY HANDLERS ══════════════════
document.addEventListener('DOMContentLoaded', function() {
  const loginNis = document.getElementById('loginNIS');
  const loginSekolah = document.getElementById('loginSekolah');

  if (loginNis) {
    loginNis.addEventListener('keydown', e => {
      if (e.key === 'Enter') doLoginSiswa();
    });
  }

  if (loginSekolah) {
    loginSekolah.addEventListener('keydown', e => {
      if (e.key === 'Enter') doLoginSiswa();
    });
  }

  // ── Restore session on page refresh / navigation ──
  restoreSession();
});

// ══════════════════ SESSION RESTORE ══════════════════
async function restoreSession() {
  // Cek sessionStorage dulu — hanya ada jika user sudah pernah login di TAB INI.
  // Jika tab baru / URL di-paste → sessionStorage kosong → tetap di login page.
  let savedPage;
  try { savedPage = sessionStorage.getItem('eclypse_page'); } catch(e) {}

  // Check for stored token
  const authToken = getAuthToken();
  if (!authToken) return; // No token → belum pernah login → biarkan di login page

  // Jika ada token tapi sessionStorage page kosong atau 'login',
  // berarti ini paste URL baru → harus ke login page
  if (!savedPage || savedPage === 'login') {
    clearAuthToken();
    return; // Hapus token, tampilkan login page
  }

  try {
    // Send token in request untuk validasi
    const res = await fetch('/api/me?token=' + encodeURIComponent(authToken));
    const data = await res.json();

    if (!data.success) {
      // Token invalid → bersihkan dan tampilkan login
      clearAuthToken();
      try { sessionStorage.removeItem('eclypse_page'); } catch(e) {}
      return;
    }

    // Token valid → pulihkan session
    state.user = data.user;
    state.user.nama    = data.user.name;
    state.user.sekolah = data.user.school;
    state.isAdmin      = data.is_admin === true;

    // Jalankan loginSuccess (akan navigasi ke 'home' dulu)
    await loginSuccess();

    // Lalu langsung lompat ke halaman yang tersimpan (jika bukan home)
    if (savedPage && savedPage !== 'home') {
      goTo(savedPage);
    }

  } catch (e) {
    console.error('Session restore error:', e);
    // Gagal → tetap di halaman login
  }
}
