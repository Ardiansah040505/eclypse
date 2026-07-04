{{-- Navbar Component --}}
<nav class="navbar" id="mainNavbar" style="display:none">
  <a class="navbar-brand" onclick="goTo('home')">
    <div class="brand-icon">🌱</div>
    <span class="brand-text">ECLYPSE</span>
  </a>
  <ul class="navbar-nav" id="navItems">
    <li class="nav-item"><button class="nav-link" id="nav-home" onclick="goTo('home')"><span class="nav-icon">🏠</span><span class="nav-label">Home</span></button></li>
    <li class="nav-item"><button class="nav-link" id="nav-tahap1" onclick="goTo('tahap1')"><span class="nav-icon">📰</span><span class="nav-label">Tahap 1</span></button></li>
    <li class="nav-item"><button class="nav-link" id="nav-tahap2" onclick="goTo('tahap2')"><span class="nav-icon">🎬</span><span class="nav-label">Tahap 2</span></button></li>
    <li class="nav-item"><button class="nav-link" id="nav-tahap3" onclick="goTo('tahap3')"><span class="nav-icon">🛡️</span><span class="nav-label">Tahap 3</span></button></li>
    <li class="nav-item"><button class="nav-link" id="nav-tahap4" onclick="goTo('tahap4')"><span class="nav-icon">⚔️</span><span class="nav-label">Tahap 4</span></button></li>
    <li class="nav-item"><button class="nav-link" id="nav-tahap5" onclick="goTo('tahap5')"><span class="nav-icon">💬</span><span class="nav-label">Tahap 5</span></button></li>
    <li class="nav-item navbar-progress-wrap" id="navbarProgressWrap">
      <div class="navbar-progress-track"><div class="navbar-progress-fill" id="navbarProgressFill" style="width:0%"></div></div>
      <span class="navbar-progress-text" id="navbarProgressText">0%</span>
    </li>
    <li class="nav-item"><button class="nav-link nav-logout" onclick="doLogout()"><span>↩️</span><span class="nav-label">Keluar</span></button></li>
  </ul>
</nav>
