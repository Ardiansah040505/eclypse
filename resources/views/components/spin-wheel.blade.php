<!-- Spin Wheel Modal for Group Assignment (Admin) -->
<div class="modal-overlay" id="modal-spin-wheel">
  <div class="modal-box" style="max-width:500px;text-align:center">
    <div class="modal-header">
      <div class="modal-title">🎡 Acak Kelompok!</div>
      <button class="modal-close" onclick="closeSpinWheelModal()">✕</button>
    </div>
    <div class="modal-form" style="padding:1rem">
      <p style="color:var(--gray);margin-bottom:1rem">Putar wheel untuk memilih kelompok secara acak!</p>

      <!-- Info -->
      <div id="spinWheelInfo" style="margin-bottom:1rem;padding:0.75rem;background:var(--green-pale);border-radius:8px;font-size:0.85rem">
        <strong>📊 6 Kelompok:</strong> Peneliti 1 & 2 · Aktivis 1 & 2 · Pedagang 1 & 2
        <br><strong id="remainingGroups">Sisa: 6 kelompok</strong>
      </div>

      <!-- Wheel Container -->
      <div style="position:relative;display:inline-block;margin-bottom:1.5rem">
        <canvas id="spinWheelCanvas" width="320" height="320"></canvas>
        <!-- Pointer - SEGITIGA ATAS -->
        <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:24px solid #1b1b18;z-index:10"></div>
      </div>

      <!-- Spin Button -->
      <button id="spinBtn" class="btn-sm green" style="width:100%;padding:14px;font-size:1rem;font-weight:700" onclick="adminSpinWheel()">
        🎰 PUTAR!
      </button>

      <!-- Result -->
      <div id="spinResult" style="display:none;margin-top:1.5rem;padding:1rem;background:var(--green-pale);border-radius:12px;text-align:center">
        <div style="font-weight:700;margin-bottom:0.5rem">🎉 Kelompok Terpilih:</div>
        <div id="spinResultContent" style="font-size:1.8rem;font-weight:800;padding:0.75rem;background:white;border-radius:8px;margin-bottom:0.75rem"></div>
        <button class="btn-sm" style="background:#dc3545;color:white;padding:8px 16px;font-size:0.85rem" onclick="removeSelectedGroup()">✅ Tetapkan & Hapus dari List</button>
      </div>

      <!-- Reset Button -->
      <div style="margin-top:1rem">
        <button class="btn-sm yellow" onclick="resetSpinWheel()">🔄 Reset Semua</button>
        <button class="btn-sm" style="background:var(--gray-200);color:var(--dark)" onclick="closeSpinWheelModal()">Tutup</button>
      </div>
    </div>
  </div>
</div>

<style>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.spinning { animation: shake 0.1s linear infinite; }
</style>

<script>
// Spin Wheel State
let adminSpinWheelState = {
  allGroups: [
    { id: 'peneliti_1', name: 'Peneliti 1', color: '#3b82f6' },
    { id: 'peneliti_2', name: 'Peneliti 2', color: '#6366f1' },
    { id: 'aktivis_1', name: 'Aktivis 1', color: '#22c55e' },
    { id: 'aktivis_2', name: 'Aktivis 2', color: '#16a34a' },
    { id: 'pedagang_1', name: 'Pedagang 1', color: '#f59e0b' },
    { id: 'pedagang_2', name: 'Pedagang 2', color: '#d97706' }
  ],
  remainingGroups: [],
  selectedGroups: [],
  isSpinning: false,
  currentRotation: 0
};

// Initialize spin wheel
function openSpinWheelForAdmin() {
  // Reset state
  adminSpinWheelState.remainingGroups = [...adminSpinWheelState.allGroups];
  adminSpinWheelState.selectedGroups = [];
  adminSpinWheelState.isSpinning = false;
  adminSpinWheelState.currentRotation = 0;

  updateRemainingCount();
  drawAdminWheel();
  document.getElementById('spinResult').style.display = 'none';
  document.getElementById('spinBtn').disabled = false;
  document.getElementById('spinBtn').textContent = '🎰 PUTAR!';
  document.getElementById('modal-spin-wheel').style.display = 'flex';
}

function updateRemainingCount() {
  const remaining = adminSpinWheelState.remainingGroups.length;
  document.getElementById('remainingGroups').textContent = 'Sisa: ' + remaining + ' kelompok';
}

// Draw the wheel with remaining groups
function drawAdminWheel() {
  const canvas = document.getElementById('spinWheelCanvas');
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 140;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const groups = adminSpinWheelState.remainingGroups;
  const numGroups = groups.length;

  if (numGroups === 0) {
    // Draw "Selesai" center text
    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = '#e5e5e5';
    ctx.fill();
    ctx.fillStyle = '#666';
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SEMUA', centerX, centerY - 6);
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillText('TERPILIH', centerX, centerY + 8);
    return;
  }

  const arcSize = (2 * Math.PI) / numGroups;

  for (let i = 0; i < numGroups; i++) {
    const startAngle = i * arcSize - Math.PI / 2;
    const endAngle = (i + 1) * arcSize - Math.PI / 2;
    const group = groups[i];

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = group.color;
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Nunito, sans-serif';
    ctx.fillText(group.name, radius / 2, 0);
    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎡', centerX, centerY);
}

// Spin the wheel
function adminSpinWheel() {
  if (adminSpinWheelState.isSpinning) return;

  const groups = adminSpinWheelState.remainingGroups;
  if (groups.length === 0) {
    showToast('⚠️ Semua kelompok sudah terpilih!');
    return;
  }

  adminSpinWheelState.isSpinning = true;
  const btn = document.getElementById('spinBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Memutar...';

  const canvas = document.getElementById('spinWheelCanvas');
  const arcDeg = 360 / groups.length;

  // Pilih grup yang menang DULU
  const randomGroupIndex = Math.floor(Math.random() * groups.length);
  const winningGroup = groups[randomGroupIndex];

  // Extra spins (integer, 4 full rotations = 1440°)
  const extraSpins = 1440;

  // Pointer di ATAS (270°)
  // Segment i center = -90° + 30° + i*60° = i*60° - 60° (dalam 0-360° range)
  // Untuk segment 0: -60° = 300°
  // Untuk letakkan segment i di atas (270°): rotasi = 270° - segmentBase
  // = 270° - (i*60° - 60°) = 330° - i*60°
  const targetAngle = extraSpins + 330 - (randomGroupIndex * arcDeg);

  adminSpinWheelState.currentRotation = targetAngle;
  adminSpinWheelState.winningGroup = winningGroup;
  adminSpinWheelState.winningIndex = randomGroupIndex;

  canvas.style.transition = 'transform 2.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  canvas.style.transform = `rotate(${targetAngle}deg)`;

  setTimeout(() => {
    adminSpinWheelState.isSpinning = false;
    showSpinResult(winningGroup);
    btn.textContent = '🎰 Putar Lagi';
    btn.disabled = false;
  }, 2500);
}

// Show result
function showSpinResult(group) {
  const resultDiv = document.getElementById('spinResult');
  const contentDiv = document.getElementById('spinResultContent');

  contentDiv.innerHTML = `<span style="color:${group.color}">${group.name}</span>`;
  resultDiv.style.display = 'block';
}

// Remove selected group from remaining
function removeSelectedGroup() {
  const group = adminSpinWheelState.winningGroup;
  if (!group) return;

  // Add to selected
  adminSpinWheelState.selectedGroups.push(group);

  // Remove from remaining
  adminSpinWheelState.remainingGroups = adminSpinWheelState.remainingGroups.filter(g => g.id !== group.id);

  // Update UI
  updateRemainingCount();
  drawAdminWheel();
  document.getElementById('spinResult').style.display = 'none';

  if (adminSpinWheelState.remainingGroups.length === 0) {
    showToast('🎉 Semua kelompok sudah terpilih!');
  } else {
    showToast(`✅ ${group.name} ditetapkan!`);
  }
}

// Reset all selections
function resetSpinWheel() {
  adminSpinWheelState.remainingGroups = [...adminSpinWheelState.allGroups];
  adminSpinWheelState.selectedGroups = [];
  adminSpinWheelState.winningGroup = null;

  updateRemainingCount();
  drawAdminWheel();
  document.getElementById('spinResult').style.display = 'none';
  document.getElementById('spinBtn').disabled = false;
  document.getElementById('spinBtn').textContent = '🎰 PUTAR!';

  showToast('🔄 Reset! Semua kelompok tersedia kembali.');
}

// Open spin wheel modal
function openSpinWheel() {
  openSpinWheelForAdmin();
}

// Close spin wheel modal
function closeSpinWheelModal() {
  document.getElementById('modal-spin-wheel').style.display = 'none';
}

// Export functions
window.openSpinWheel = openSpinWheel;
window.closeSpinWheelModal = closeSpinWheelModal;
window.adminSpinWheel = adminSpinWheel;
window.openSpinWheelForAdmin = openSpinWheelForAdmin;
window.triggerAdminSpinWheel = triggerAdminSpinWheel;
window.removeSelectedGroup = removeSelectedGroup;
window.resetSpinWheel = resetSpinWheel;
</script>
