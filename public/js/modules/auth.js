// ══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION - Login/Logout Functions
// ══════════════════════════════════════════════════════════════════════════

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

    const token = document
        .querySelector('meta[name="csrf-token"]')
        .content;

    try {

        const response = await fetch('/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': token
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
async function doLoginAdmin() {

    const username = prompt('Username admin:');

    if (!username) return;

    const password = prompt('Password:');

    if (!password) return;

    const token = document
        .querySelector('meta[name="csrf-token"]')
        .content;

    try {

        const response = await fetch('/admin/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': token
            },

            body: JSON.stringify({

                username,
                password

            })

        });

        const data = await response.json();

        if (!data.success) {

            showToast(data.message);

            return;

        }

        state.user = data.user;
        state.isAdmin = true;

        loginSuccess();

    } catch (e) {

        console.error(e);

        showToast("Gagal terhubung ke server.");

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

    // Clean up stale online data when logging in
    cleanupStaleOnlineData();

    // Load video data from database
    await loadVideoData();

    // Load news data
    await loadNews();

    console.log("NEWS =",state.news);

    goTo('home');

    generateLeaves();

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

  // Call server-side logout to mark user as offline
  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
      },
      body: JSON.stringify({ student_id: state.user?.id })
    });
  } catch (e) {
    console.error('Logout error:', e);
  }

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

  if (!savedPage) return; // Tab baru atau belum pernah login → biarkan login page

  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    const data = await res.json();

    if (!data.success) {
      // Sesi server sudah expired → bersihkan sessionStorage
      try { sessionStorage.removeItem('eclypse_page'); } catch(e) {}
      return;
    }

    // Pulihkan state
    state.user = data.user;
    state.user.nama    = data.user.name;
    state.user.sekolah = data.user.school;
    state.isAdmin      = data.is_admin === true;

    // Jalankan loginSuccess (akan navigasi ke 'home' dulu)
    await loginSuccess();

    // Lalu langsung lompat ke halaman yang tersimpan (jika bukan home)
    if (savedPage !== 'home') {
      goTo(savedPage);
    }

  } catch (e) {
    console.error('Session restore error:', e);
    // Gagal → tetap di halaman login
  }
}
