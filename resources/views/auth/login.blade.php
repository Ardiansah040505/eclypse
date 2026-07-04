{{-- LOGIN PAGE --}}

{{-- ═══════════════════════ LOGIN ═══════════════════════ --}}
<div id="page-login" class="page active">
  <div class="login-bg-art"></div>
  <div class="floating-leaves" id="floatingLeaves"></div>
  <div class="login-card">
    <div class="login-logo">
      <div class="login-logo-icon">🌱</div>
      <h1>ECLYPSE</h1>
      <p>Climate Learning Platform</p>
    </div>
    <div class="login-tag">🌍 Selamat datang di platform pembelajaran iklim</div>
    <div class="login-form">
      <div class="form-group">
        <label>Nama Lengkap</label>
        <input type="text" id="loginNama" placeholder="Tulis nama lengkapmu..." autocomplete="name">
      </div>
      <div class="form-group">
        <label>NIS (Nomor Induk Siswa)</label>
        <input type="text" id="loginNIS" placeholder="Contoh: 2024001..." autocomplete="off" inputmode="numeric">
      </div>
      <div class="form-group">
        <label>Nama Sekolah</label>
        <input type="text" id="loginSekolah" placeholder="Contoh: SMAN 1 Surabaya..." autocomplete="organization">
      </div>
      <button class="btn-primary" onclick="doLoginSiswa()">Masuk ke ECLYPSE 🌿</button>
      <div class="login-divider">atau masuk sebagai</div>
      <button class="btn-primary btn-yellow" onclick="doLoginAdmin()">👤 Admin / Guru</button>
    </div>
  </div>
</div>
