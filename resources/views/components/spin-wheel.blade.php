<!-- Spin Wheel Modal for Role Randomization -->
<div class="modal-overlay" id="modal-spin-wheel">
  <div class="modal-box" style="max-width:420px;text-align:center">
    <div class="modal-header">
      <div class="modal-title">🎡 Acak Role!</div>
      <button class="modal-close" onclick="closeSpinWheelModal()">✕</button>
    </div>
    <div class="modal-form" style="padding:1rem">
      <p style="color:var(--gray);margin-bottom:1rem">Putar wheel untuk ketahui role kamu dalam debat!</p>

      <!-- Wheel Container -->
      <div style="position:relative;display:inline-block;margin-bottom:1.5rem">
        <canvas id="spinWheelCanvas" width="280" height="280"></canvas>
        <!-- Pointer -->
        <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:20px solid var(--green-deep)"></div>
      </div>

      <!-- Spin Button -->
      <button id="spinBtn" class="btn-sm green" style="width:100%;padding:14px;font-size:1rem;font-weight:700" onclick="spinWheel()">
        🎰 PUTAR!
      </button>

      <!-- Result -->
      <div id="spinResult" style="display:none;margin-top:1.5rem;padding:1rem;background:var(--green-pale);border-radius:12px">
        <div style="font-size:0.85rem;color:var(--gray);margin-bottom:0.5rem">Role kamu adalah:</div>
        <div id="spinResultRole" style="font-size:1.5rem;font-weight:800;color:var(--green-deep)">-</div>
        <div id="spinResultDesc" style="font-size:0.85rem;color:var(--dark);margin-top:0.5rem">-</div>
      </div>

      <!-- Continue Button -->
      <div id="continueBtnContainer" style="display:none;margin-top:1rem">
        <button class="btn-sm green" style="width:100%;padding:14px;font-size:1rem;font-weight:700" onclick="continueAfterSpin()">
          ➡️ Lanjut ke Tahap 2
        </button>
      </div>
    </div>
  </div>
</div>

<style>
.spin-wheel-container {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
}
</style>

<script>
// Spin Wheel State - for role assignment
let spinWheelState = {
  roles: [
    { id: 'peneliti', name: '🔬 Peneliti', desc: 'Fokus pada data dan fakta ilmiah', color: '#3b82f6' },
    { id: 'aktivis', name: '🌿 Aktivis', desc: 'Fokus pada aksi nyata dan lingkungan', color: '#22c55e' },
    { id: 'pedagang', name: '🛒 Pedagang', desc: 'Fokus pada dampak ekonomi', color: '#f59e0b' }
  ],
  isSpinning: false,
  currentRotation: 0
};

// Initialize spin wheel with roles
function initSpinWheel() {
  spinWheelState.isSpinning = false;
  spinWheelState.currentRotation = 0;

  drawRoleWheel();
  document.getElementById('spinResult').style.display = 'none';
  document.getElementById('spinBtn').disabled = false;
  document.getElementById('spinBtn').textContent = '🎰 PUTAR!';
}

// Draw the wheel with 3 roles
function drawRoleWheel() {
  const canvas = document.getElementById('spinWheelCanvas');
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 120;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const roles = spinWheelState.roles;
  const numRoles = roles.length;
  const arcSize = (2 * Math.PI) / numRoles;

  // Draw segments
  for (let i = 0; i < numRoles; i++) {
    const startAngle = i * arcSize - Math.PI / 2;
    const endAngle = (i + 1) * arcSize - Math.PI / 2;
    const role = roles[i];

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = role.color;
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Nunito, sans-serif';
    ctx.fillText(role.name, radius / 2, -10);
    ctx.font = '10px Nunito, sans-serif';
    ctx.fillText(role.desc.substring(0, 15), radius / 2, 10);
    ctx.restore();
  }

  // Draw center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw center text
  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎡', centerX, centerY);
}

// Spin the wheel
function spinWheel() {
  if (spinWheelState.isSpinning) return;

  spinWheelState.isSpinning = true;
  const btn = document.getElementById('spinBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Memutar...';

  const canvas = document.getElementById('spinWheelCanvas');
  const roles = spinWheelState.roles;
  const arcSize = (2 * Math.PI) / roles.length;

  // Calculate random winning role
  const randomRoleIndex = Math.floor(Math.random() * roles.length);
  // Add extra rotations (5-10 full spins)
  const extraSpins = (5 + Math.random() * 5) * 2 * Math.PI;
  // Calculate target angle to land on winning segment center
  const targetAngle = extraSpins + (randomRoleIndex * arcSize + arcSize / 2);

  spinWheelState.currentRotation = targetAngle;

  // Apply rotation with animation
  canvas.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  canvas.style.transform = `rotate(${targetAngle}deg)`;

  // Wait for animation to complete
  setTimeout(() => {
    spinWheelState.isSpinning = false;
    const winningRole = roles[randomRoleIndex];

    // Show result
    showSpinRoleResult(winningRole);

    // Save role to state and database
    saveStudentRole(winningRole);

    // Hide spin button, show continue button
    btn.style.display = 'none';
    const continueContainer = document.getElementById('continueBtnContainer');
    if (continueContainer) continueContainer.style.display = 'block';
  }, 4000);
}

// Show spin result
function showSpinRoleResult(role) {
  const resultDiv = document.getElementById('spinResult');
  const roleName = document.getElementById('spinResultRole');
  const roleDesc = document.getElementById('spinResultDesc');

  resultDiv.style.display = 'block';
  roleName.textContent = role.name;
  roleDesc.textContent = role.desc;

  // Celebration animation
  resultDiv.style.animation = 'none';
  resultDiv.offsetHeight; // Trigger reflow
  resultDiv.style.animation = 'popIn 0.5s ease-out';
}

// Save student role
async function saveStudentRole(role) {
  // Save to state
  state.selectedEcoRole = role.id;
  state._studentRole = role;

  // Save to localStorage immediately
  if (typeof savePersistedState === 'function') {
    savePersistedState();
  } else {
    localStorage.setItem('eclypse_role_' + state.user?.id, JSON.stringify(role));
  }

  // Save to database
  if (state.user?.id) {
    try {
      const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
      await fetch('/api/student/eco-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token
        },
        body: JSON.stringify({
          student_id: state.user.id,
          eco_role: role.id
        })
      });
    } catch (e) {
      console.error('Error saving role:', e);
    }
  }
}

// Open spin wheel modal
function openSpinWheel() {
  document.getElementById('modal-spin-wheel').style.display = 'flex';
  initSpinWheel();
}

// Close spin wheel modal
function closeSpinWheelModal() {
  document.getElementById('modal-spin-wheel').style.display = 'none';
}

// Continue to Tahap 2 after spin
function continueAfterSpin() {
  closeSpinWheelModal();
  goTo('tahap2');
}

// Export functions
window.openSpinWheel = openSpinWheel;
window.closeSpinWheelModal = closeSpinWheelModal;
window.spinWheel = spinWheel;
window.initSpinWheel = initSpinWheel;
window.saveStudentRole = saveStudentRole;
window.continueAfterSpin = continueAfterSpin;
</script>
