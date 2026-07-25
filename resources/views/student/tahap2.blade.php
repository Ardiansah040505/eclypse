{{-- TAHAP 2: VIDEO & ECO CARDS --}}

{{-- Navbar --}}
@include('components.navbar')

{{-- ═══════════════════════ TAHAP 2 ═══════════════════════ --}}
<div id="page-tahap2" class="page">
  <div class="content">
    <div class="page-header">
      <div>
        <h2>🎬 Tahap 2 — Video & Eco Cards</h2>
        <p>Tonton video dan pelajari kartu ekologi iklim</p>
      </div>
    </div>

    {{-- Video Section (Multiple Videos) --}}
    <div class="video-section">
      <div class="section-title">🎥 Video Pembelajaran</div>
      <p style="font-size:0.85rem;color:var(--gray)">Saksikan video berikut untuk memahami lebih dalam tentang perubahan iklim global.</p>

      {{-- Videos Container --}}
      <div id="videosContainer" class="videos-container">
        {{-- Videos will be rendered by JS --}}
        <div class="video-empty-message">
          <p>Loading videos...</p>
        </div>
      </div>

      {{-- Admin: Add Video Button --}}
      <div id="adminBar2" style="display:none; margin-top: 1rem;">
        <div id="addVideoBtnContainer"></div>
      </div>
    </div>

    {{-- Materi Section --}}
    <div style="margin-top:2rem;padding:1.5rem;background:white;border-radius:16px;box-shadow:0 2px 12px rgba(29,67,50,0.1)">
      <div class="section-title">📖 Materi Literasi Iklim</div>
      <p style="font-size:0.85rem;color:#4B5563;margin:0.75rem 0 1.25rem 0">
        Pelajari 7 kotak materi tentang perubahan iklim — dari <strong>definisi &amp; penyebab</strong>, <strong>dampak</strong>, <strong>plastik &amp; iklim</strong>, hingga <strong>aksi nyata</strong> yang bisa kamu lakukan untuk bumi!
      </p>
      <div style="text-align:center">
        <button class="btn-sm green" style="padding:12px 28px;font-weight:700;font-size:0.95rem;border-radius:10px" onclick="openMateriModal()">
          📖 Baca Materi
        </button>
      </div>
    </div>

    <div class="eco-section">
      <div class="section-title">🃏 Eco Climate Cards <span style="font-size:0.78rem;font-weight:600;color:var(--gray);margin-left:8px">3 paket · 6–7 kartu per paket</span></div>
      <div id="roleAssignedMessage" style="display:none;margin-bottom:1rem;padding:0.75rem 1rem;background:#fef3c7;border-radius:8px;font-size:0.85rem;color:#92400e"></div>
      <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Buka paket sesuai role yang kamu dapat dan pelajari data faktual yang akan memperkuat argumenmu di debat! 🎴</p>
      <div id="ecoPacksView">
        <div class="eco-packs" id="ecoPacksGrid"><!-- diisi JS --></div>
      </div>
      <div id="ecoCardsView" style="display:none">
        <div class="eco-pack-view-head">
          <div>
            <div id="ecoPackViewTitle" class="section-title" style="margin:0"></div>
            <div id="ecoPackViewSub" style="font-size:0.78rem;color:var(--gray);margin-top:2px"></div>
          </div>
          <button class="btn-sm" style="background:var(--green-pale);color:var(--green-deep)" onclick="closePackView()">← Kembali ke Paket</button>
        </div>
        <div class="eco-cards-grid" id="ecoCardsGrid"><!-- diisi JS --></div>
      </div>
    </div>
  </div>
</div>

{{-- Modal: Add/Edit Video (Admin) --}}
<x-modal id="modal-addvideo" title="Kelola Video Pembelajaran">
  <div class="admin-video-modal">
    <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Tambahkan video YouTube untuk ditampilkan di Tahap 2.</p>

    {{-- Form Type Toggle --}}
    <div class="form-toggle mb-4" id="formTypeToggle" style="display:none">
      <button type="button" class="btn-sm" onclick="showSingleVideoForm()">📹 Satu Video</button>
      <button type="button" class="btn-sm" onclick="showMultipleVideoForm()">📚 Banyak Video</button>
    </div>

    {{-- Single Video Form --}}
    <div id="singleVideoForm">
      <input type="hidden" id="editingVideoId" value="">
      <div class="form-group">
        <label>Judul Video</label>
        <input type="text" id="videoTitleInput" placeholder="Contoh: Pengenalan Perubahan Iklim" style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px">
      </div>
      <div class="form-group mt-2">
        <label>Link YouTube</label>
        <input type="text" id="videoUrlInput" placeholder="https://www.youtube.com/watch?v=..." style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px">
      </div>
      <div class="form-group mt-2">
        <label>Deskripsi</label>
        <textarea id="videoDescInput" placeholder="Deskripsi singkat video..." rows="3" style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px;resize:vertical"></textarea>
      </div>
      <div class="form-group mt-2">
        <label>Urutan</label>
        <input type="number" id="videoOrderInput" value="0" min="0" style="width:100%;padding:0.5rem;border:1px solid #e3e3e0;border-radius:6px">
      </div>
    </div>

    {{-- Multiple Videos Form --}}
    <div id="multipleVideoForm" style="display:none">
      <p style="font-size:0.85rem;color:var(--gray);margin-bottom:1rem">Tambahkan beberapa video sekaligus. Biarkan kolom kosong untuk video yang tidak diperlukan.</p>
      <div id="multipleVideoInputs">
        {{-- Generated by JS --}}
      </div>
    </div>

    {{-- Existing Videos List --}}
    <div class="mt-4">
      <h4 style="font-size:0.9rem;font-weight:600;margin-bottom:0.5rem">📋 Video yang Sudah Ada</h4>
      <div id="adminVideoList">
        <p class="text-gray-500 text-sm">Memuat...</p>
      </div>
    </div>
  </div>

  <div slot="footer">
    <button type="button" class="btn-sm" onclick="closeModal('modal-addvideo')">Batal</button>
    <button type="button" class="btn-sm danger" onclick="clearAllVideos()">🗑️ Hapus Semua</button>
    <button type="button" class="btn-sm green" onclick="saveMultipleVideos()">💾 Simpan</button>
  </div>
</x-modal>


<div class="modal-overlay" id="modal-materi">
  <div class="modal-box" style="max-width:820px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden">
    <div class="modal-header" style="background:linear-gradient(135deg,#1B4332,#2D6A4F);color:white;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.4rem">🌿</span>
        <div>
          <div class="modal-title" style="color:white">Menu Literasi — ECO-CLIMATE</div>
        </div>
      </div>
      <button class="modal-close" style="color:white;opacity:0.9" onclick="closeModal('modal-materi')">✕</button>
    </div>
    <div style="max-height:calc(90vh - 140px);overflow-y:auto;padding:1.25rem 1.5rem">

      <!-- KOTAK 1 -->
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid #1B4332">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">📦</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">APA ITU PERUBAHAN IKLIM?</span>
        </div>
        <div style="margin-bottom:0.75rem">
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:4px">Definisi</div>
          <p style="font-size:0.85rem;line-height:1.6;color:#333">Perubahan iklim adalah pergeseran jangka panjang pada pola suhu, curah hujan, dan kondisi atmosfer bumi yang terjadi akibat peningkatan konsentrasi gas rumah kaca di atmosfer karena aktivitas manusia.</p>
        </div>
        <div>
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:6px">Bedakan: Cuaca vs Iklim</div>
          <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
            <thead>
              <tr style="background:#B7E4C7">
                <th style="padding:7px 10px;text-align:left;border:1px solid #B7E4C7;color:#1B4332"></th>
                <th style="padding:7px 10px;text-align:left;border:1px solid #B7E4C7;color:#1B4332;font-weight:700">Cuaca</th>
                <th style="padding:7px 10px;text-align:left;border:1px solid #B7E4C7;color:#1B4332;font-weight:700">Iklim</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px 10px;border:1px solid #e0e0e0;font-weight:600;color:#1B4332">Waktu</td>
                <td style="padding:6px 10px;border:1px solid #e0e0e0">Jam - Hari</td>
                <td style="padding:6px 10px;border:1px solid #e0e0e0">Puluhan - Ratusan tahun</td>
              </tr>
              <tr style="background:#f9f9f9">
                <td style="padding:6px 10px;border:1px solid #e0e0e0;font-weight:600;color:#1B4332">Sifat</td>
                <td style="padding:6px 10px;border:1px solid #e0e0e0">Singkat, berubah-ubah</td>
                <td style="padding:6px 10px;border:1px solid #e0e0e0">Jangka panjang, stabil</td>
              </tr>
              <tr>
                <td style="padding:6px 10px;border:1px solid #e0e0e0;font-weight:600;color:#1B4332">Prediksi</td>
                <td style="padding:6px 10px;border:1px solid #e0e0e0">Sulit diprediksi</td>
                <td style="padding:6px 10px;border:1px solid #e0e0e0">Dapat dipelajari polanya</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:0.75rem;background:#FFF9E6;border-radius:10px;padding:0.75rem">
          <div style="font-weight:700;color:#8B5E3C;margin-bottom:6px">📊 Data Penting</div>
          <ul style="font-size:0.82rem;line-height:1.7;color:#333;padding-left:1.2rem">
            <li>Suhu rata-rata bumi telah naik <strong>1,1°C</strong> sejak era pra-industri.</li>
            <li>Dekade 2011-2020 adalah <strong>dekade terpanas</strong> yang pernah tercatat.</li>
            <li>Indonesia mengalami kenaikan suhu rata-rata <strong>0,02°C/tahun</strong> dalam 50 tahun terakhir.</li>
          </ul>
        </div>
      </div>

      <!-- KOTAK 2 -->
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid #2D6A4F">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">⚙️</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">APA PENYEBABNYA?</span>
        </div>
        <div style="margin-bottom:0.75rem">
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:6px">Proses Rumah Kaca</div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#333">
              <span>☀️</span><span>Matahari memancarkan energi ke Bumi</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#333">
              <span>🔄</span><span>Sebagian besar dipantulkan kembali ke angkasa</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#333">
              <span>☁️</span><span>GRK menyerap dan memantulkan kembali ke Bumi</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:#dc2626">
              <span>⬆️</span><span>Akibat: Bumi semakin panas!</span>
            </div>
          </div>
        </div>
        <div>
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:6px">Gas Rumah Kaca Utama</div>
          <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
            <thead><tr style="background:#B7E4C7"><th style="padding:6px 8px;text-align:left;border:1px solid #e0e0e0;color:#1B4332">Gas</th><th style="padding:6px 8px;text-align:left;border:1px solid #e0e0e0;color:#1B4332">Sumber Utama</th><th style="padding:6px 8px;text-align:left;border:1px solid #e0e0e0;color:#1B4332">Kontribusi</th></tr></thead>
            <tbody>
              <tr><td style="padding:5px 8px;border:1px solid #e0e0e0"><strong>CO₂</strong></td><td style="padding:5px 8px;border:1px solid #e0e0e0">Pembakaran bahan bakar fosil</td><td style="padding:5px 8px;border:1px solid #e0e0e0">~76%</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:5px 8px;border:1px solid #e0e0e0"><strong>CH₄</strong> (Metana)</td><td style="padding:5px 8px;border:1px solid #e0e0e0">Peternakan, sawah, sampah</td><td style="padding:5px 8px;border:1px solid #e0e0e0">~16%</td></tr>
              <tr><td style="padding:5px 8px;border:1px solid #e0e0e0"><strong>N₂O</strong></td><td style="padding:5px 8px;border:1px solid #e0e0e0">Pupuk, industri</td><td style="padding:5px 8px;border:1px solid #e0e0e0">~6%</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:5px 8px;border:1px solid #e0e0e0"><strong>F-gas</strong></td><td style="padding:5px 8px;border:1px solid #e0e0e0">Pendingin, industri</td><td style="padding:5px 8px;border:1px solid #e0e0e0">~2%</td></tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:0.75rem;background:#FFF3B0;border-radius:10px;padding:0.75rem">
          <div style="font-weight:700;color:#8B5E3C;margin-bottom:4px">💡 Efek Kritis</div>
          <p style="font-size:0.82rem;line-height:1.5;color:#333">Konsentrasi CO₂ saat ini (421 ppm) adalah yang tertinggi dalam 800.000 tahun terakhir, menyebabkan laju pemanasan 10x lebih cepat dari rata-rata era冰河时代.</p>
        </div>
      </div>



      <!-- KOTAK 3 -->
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid #52B788">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">🔍</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">PENYEBAB UTAMA — AKTIVITAS MANUSIA</span>
        </div>
        <div style="font-weight:700;color:#2D6A4F;margin-bottom:8px">5 Sumber Emisi GRK Indonesia</div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem;border-left:3px solid #dc2626">
          <div style="font-weight:700;font-size:0.85rem;color:#dc2626;margin-bottom:4px">1. ⚡ Energi (34%)</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Batu bara, minyak bumi, dan gas alam dibakar untuk energi listrik dan transportasi</li>
            <li>Menghasilkan CO2 dalam jumlah sangat besar</li>
            <li>Sektor energi menyumbang 34% emisi GRK Indonesia</li>
          </ul>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem;border-left:3px solid #16a34a">
          <div style="font-weight:700;font-size:0.85rem;color:#16a34a;margin-bottom:4px">2. 🌳 Lahan & Hutan (25%)</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Hutan berfungsi menyerap CO2 dari atmosfer</li>
            <li>Ketika hutan ditebang atau dibakar, karbon yang tersimpan dilepaskan</li>
            <li>Indonesia kehilangan rata-rata 1,18 juta hektar hutan per tahun</li>
          </ul>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem;border-left:3px solid #ca8a04">
          <div style="font-weight:700;font-size:0.85rem;color:#ca8a04;margin-bottom:4px">3. 🌾 Pertanian & Peternakan (12%)</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Sawah menghasilkan gas metana (CH4) saat pembusukan bahan organik</li>
            <li>Peternakan sapi menghasilkan CH4 dari proses pencernaan hewan</li>
            <li>Menyumbang 12% emisi GRK Indonesia</li>
          </ul>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem;border-left:3px solid #0891b2">
          <div style="font-weight:700;font-size:0.85rem;color:#0891b2;margin-bottom:4px">4. 🗑️ Limbah (8%)</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Sampah organik dan plastik yang membusuk di TPA menghasilkan CH4</li>
            <li>Pembakaran sampah menghasilkan CO2 dan partikel berbahaya</li>
            <li>Sektor limbah menyumbang 8% emisi GRK Indonesia</li>
          </ul>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem;border-left:3px solid #7c3aed">
          <div style="font-weight:700;font-size:0.85rem;color:#7c3aed;margin-bottom:4px">5. 🏭 Industri (5%)</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Pabrik semen, baja, dan kimia menghasilkan GRK dalam proses produksi</li>
            <li>Menyumbang 5% emisi GRK Indonesia</li>
          </ul>
        </div>
        <div style="margin-top:0.75rem;background:#B7E4C7;border-radius:10px;padding:0.75rem">
          <div style="font-weight:700;color:#1B4332;margin-bottom:6px">📊 Kontribusi Faktor Alam vs Manusia</div>
          <table style="width:100%;border-collapse:collapse;font-size:0.8rem">
            <thead>
              <tr style="background:#1B4332;color:white">
                <th style="padding:5px 8px;text-align:left;border:1px solid #1B4332">Faktor</th>
                <th style="padding:5px 8px;text-align:left;border:1px solid #1B4332">Kontribusi</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding:5px 8px;border:1px solid #e0e0e0">Aktivitas Manusia</td><td style="padding:5px 8px;border:1px solid #e0e0e0"><strong>~95%</strong></td></tr>
              <tr style="background:#f9f9f9"><td style="padding:5px 8px;border:1px solid #e0e0e0">Faktor Alam</td><td style="padding:5px 8px;border:1px solid #e0e0e0">~5%</td></tr>
            </tbody>
          </table>
          <div style="margin-top:6px;font-size:0.82rem;color:#1B4332;font-style:italic">Kesimpulan: Perubahan iklim terutama disebabkan oleh aktivitas manusia.</div>
        </div>
      </div>

      <!-- KOTAK 4 -->
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid #1B4332">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">⚠️</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">APA DAMPAKNYA?</span>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem">
          <div style="font-weight:700;font-size:0.85rem;color:#dc2626;margin-bottom:4px">🌡️ Dampak Global</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Kenaikan permukaan laut rata-rata 3,7 mm per tahun sejak 1993</li>
            <li>Mencairnya es di Greenland dan Antartika</li>
            <li>Peningkatan frekuensi dan intensitas cuaca ekstrem</li>
            <li>Pergeseran musim yang tidak menentu</li>
          </ul>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem">
          <div style="font-weight:700;font-size:0.85rem;color:#0891b2;margin-bottom:4px">🌊 Dampak Ekosistem</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Pemutihan terumbu karang akibat kenaikan suhu laut</li>
            <li>Pergeseran habitat flora dan fauna</li>
            <li>Kepunahan spesies yang tidak bisa beradaptasi</li>
            <li>Gangguan rantai makanan di ekosistem laut dan darat</li>
          </ul>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem;margin-bottom:0.5rem">
          <div style="font-weight:700;font-size:0.85rem;color:#7c3aed;margin-bottom:4px">🌾 Dampak Sosial-Ekonomi</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Gagal panen akibat pola hujan yang tidak menentu</li>
            <li>Banjir rob yang menggenangi wilayah pesisir</li>
            <li>Peningkatan penyakit tropis</li>
            <li>Krisis air bersih di daerah kering</li>
          </ul>
        </div>
        <div style="background:#f8faf8;border-radius:10px;padding:0.75rem">
          <div style="font-weight:700;font-size:0.85rem;color:#16a34a;margin-bottom:4px">🇮🇩 Dampak Khusus Indonesia</div>
          <ul style="font-size:0.8rem;line-height:1.6;color:#333;padding-left:1rem">
            <li>Beberapa pulau kecil terancam tenggelam</li>
            <li>Petani kesulitan memprediksi musim tanam</li>
            <li>Banjir dan longsor yang semakin sering</li>
            <li>Suhu perkotaan semakin panas</li>
          </ul>
        </div>
      </div>

      <!-- KOTAK 5 -->
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid #2D6A4F">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">🍶</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">PLASTIK & PERUBAHAN IKLIM</span>
        </div>
        <div style="margin-bottom:0.75rem">
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:4px">Plastik = Bahan Bakar Fosil</div>
          <ul style="font-size:0.82rem;line-height:1.6;color:#333;padding-left:1.2rem">
            <li>Plastik dibuat dari <strong>bahan bakar fosil</strong> (minyak bumi & gas alam)</li>
            <li>Proses produksi plastik menghasilkan emisi CO2 yang signifikan</li>
            <li>Setiap <strong>1 kg plastik</strong> yang diproduksi menghasilkan ~3,5 kg CO2</li>
          </ul>
        </div>
        <div style="margin-bottom:0.75rem">
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:6px">Emisi dari Sektor Plastik</div>
          <div style="background:#f0f9ff;border-radius:10px;padding:0.6rem;font-size:0.8rem;margin-bottom:4px">Produksi Plastik (dari minyak bumi) - Emisi CO2 dari proses</div>
          <div style="background:#dc2626;color:white;border-radius:8px;padding:0.6rem;font-size:0.8rem;text-align:center"><strong>+3,5 kg CO₂ / kg plastik</strong></div>
        </div>
        <div>
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:4px">Plastik di Indonesia</div>
          <ul style="font-size:0.82rem;line-height:1.6;color:#333;padding-left:1.2rem">
            <li>Indonesia menghasilkan <strong>12,4 juta ton</strong> sampah plastik per tahun</li>
            <li>Hanya <strong>9-10%</strong> yang berhasil didaur ulang</li>
            <li><strong>90% lebih</strong> berakhir di TPA, dibakar, atau mencemari lingkungan</li>
            <li>Sektor limbah menyumbang <strong>8%</strong> emisi GRK nasional</li>
          </ul>
        </div>
        <div style="margin-top:0.75rem;background:#fee2e2;border-radius:10px;padding:0.75rem">
          <div style="font-weight:700;color:#dc2626;margin-bottom:4px">🦠 Dampak Mikroplastik</div>
          <ul style="font-size:0.82rem;line-height:1.6;color:#333;padding-left:1.2rem">
            <li>Plastik di lingkungan terfragmentasi menjadi partikel kecil (mikroplastik)</li>
            <li>Mikroplastik ditemukan di air minum, ikan konsumsi, garam, dan darah manusia</li>
            <li><strong>73%</strong> sampel terumbu karang di Indonesia terkontaminasi mikroplastik</li>
            <li>Mikroplastik mengganggu kemampuan fotosintesis fitoplankton</li>
          </ul>
        </div>
      </div>

      <!-- KOTAK 6 -->
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid #52B788">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">💡</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">APA YANG BISA KITA LAKUKAN?</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem">
          <div style="background:#f0fdf4;border-radius:12px;padding:0.75rem">
            <div style="font-weight:800;color:#16a34a;font-size:0.9rem;margin-bottom:6px">🌱 Mitigasi</div>
            <table style="width:100%;border-collapse:collapse;font-size:0.78rem">
              <thead><tr style="background:#16a34a20"><th style="padding:4px 6px;text-align:left;color:#1B4332">Aksi</th><th style="padding:4px 6px;text-align:left;color:#1B4332">Dampak CO₂</th></tr></thead>
              <tbody>
                <tr><td style="padding:4px 6px;border:1px solid #e0e0e0">Hemat energi</td><td style="padding:4px 6px;border:1px solid #e0e0e0">-2-4 ton/th</td></tr>
                <tr style="background:#f0fdf4"><td style="padding:4px 6px;border:1px solid #e0e0e0">Energi terbarukan</td><td style="padding:4px 6px;border:1px solid #e0e0e0">-5-15 ton/th</td></tr>
                <tr><td style="padding:4px 6px;border:1px solid #e0e0e0">Kurangi daging merah</td><td style="padding:4px 6px;border:1px solid #e0e0e0">-0,8-1,5 ton/th</td></tr>
                <tr style="background:#f0fdf4"><td style="padding:4px 6px;border:1px solid #e0e0e0">Transportasi publik</td><td style="padding:4px 6px;border:1px solid #e0e0e0">-1-2,5 ton/th</td></tr>
                <tr><td style="padding:4px 6px;border:1px solid #e0e0e0">Diet vegetarian</td><td style="padding:4px 6px;border:1px solid #e0e0e0">-1,5-3 ton/th</td></tr>
              </tbody>
            </table>
          </div>
          <div style="background:#eff6ff;border-radius:12px;padding:0.75rem">
            <div style="font-weight:800;color:#1976D2;font-size:0.9rem;margin-bottom:6px">🛡️ Adaptasi</div>
            <table style="width:100%;border-collapse:collapse;font-size:0.78rem">
              <thead><tr style="background:#1976D220"><th style="padding:4px 6px;text-align:left;color:#1B4332">Aksi</th><th style="padding:4px 6px;text-align:left;color:#1B4332">Manfaat</th></tr></thead>
              <tbody>
                <tr><td style="padding:4px 6px;border:1px solid #e0e0e0">Tanam mangrove</td><td style="padding:4px 6px;border:1px solid #e0e0e0">Lindungi pesisir</td></tr>
                <tr style="background:#eff6ff"><td style="padding:4px 6px;border:1px solid #e0e0e0">Irigasi modern</td><td style="padding:4px 6px;border:1px solid #e0e0e0">Hemat air</td></tr>
                <tr><td style="padding:4px 6px;border:1px solid #e0e0e0">Varietas tahan panas</td><td style="padding:4px 6px;border:1px solid #e0e0e0">Panen stabil</td></tr>
                <tr style="background:#eff6ff"><td style="padding:4px 6px;border:1px solid #e0e0e0">Sistem peringatan dini</td><td style="padding:4px 6px;border:1px solid #e0e0e0">Siaga bencana</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style="background:#1B4332;color:white;border-radius:12px;padding:0.75rem">
          <div style="font-weight:800;margin-bottom:6px;text-align:center">🎯 Prinsip 3R untuk Plastik</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;text-align:center">
            <div style="background:#2D6A4F;border-radius:8px;padding:6px"><div style="font-weight:900">♻️</div><div style="font-size:0.78rem">Reduce<br><small>Kurangi</small></div></div>
            <div style="background:#2D6A4F;border-radius:8px;padding:6px"><div style="font-weight:900">🔄</div><div style="font-size:0.78rem">Reuse<br><small>Gunakan ulang</small></div></div>
            <div style="background:#2D6A4F;border-radius:8px;padding:6px"><div style="font-weight:900">♻️</div><div style="font-size:0.78rem">Recycle<br><small>Daur ulang</small></div></div>
          </div>
          <div style="margin-top:6px;font-size:0.78rem;text-align:center">Plastik daur ulang menghasilkan <strong>66% lebih sedikit CO₂</strong> dibanding plastik baru</div>
        </div>
      </div>

      <!-- KOTAK 7 -->
      <div style="background:white;border-radius:16px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 2px 12px rgba(29,67,50,0.1);border-left:5px solid #1B4332">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.75rem">
          <span style="font-size:1.2rem">⚖️</span>
          <span style="font-weight:900;font-size:1rem;color:#1B4332">KEBIJAKAN & KESEIMBANGAN</span>
        </div>
        <div style="margin-bottom:0.75rem">
          <div style="font-weight:700;color:#2D6A4F;margin-bottom:6px">Kesetaraan dalam Krisis Iklim</div>
          <ul style="font-size:0.82rem;line-height:1.6;color:#333;padding-left:1.2rem">
            <li>Negara-negara miskin dan berkembang paling merasakan dampak perubahan iklim</li>
            <li>Masyarakat pesisir dan petani kecil paling rentan terhadap perubahan cuaca</li>
            <li>Generasi muda mewarisi masalah yang sebagian besar diciptakan oleh generasi sebelumnya</li>
          </ul>
        </div>
        <div style="background:#FFF3B0;border-radius:10px;padding:0.75rem">
          <div style="font-weight:700;color:#8B5E3C;margin-bottom:6px">🤔 Pertanyaan untuk Refleksi</div>
          <ul style="font-size:0.82rem;line-height:1.6;color:#333;padding-left:1.2rem">
            <li>Apakah adil melarang penggunaan plastik tanpa menyediakan alternatif terjangkau?</li>
            <li>Siapa yang harus bertanggung jawab - individu konsumen atau korporasi besar?</li>
            <li>Bagaimana menyeimbangkan antara kepentingan ekonomi jangka pendek dan keberlanjutan lingkungan?</li>
          </ul>
        </div>
      </div>

      <!-- SUMBER -->
      <div style="background:#f3f4f6;border-radius:12px;padding:1rem;margin-bottom:0.5rem">
        <div style="font-weight:800;font-size:0.85rem;color:#1B4332;margin-bottom:6px">Sumber dan Referensi</div>
        <div style="font-size:0.72rem;line-height:1.7;color:#4B5563">
          IPCC. (2023). Climate Change 2023: Synthesis Report.<br>
          KLHK. (2023). Laporan Inventarisasi GRK danMPV Tahun 2023.<br>
          Ford, H. V., et al. (2022). The fundamental links between climate change and marine plastic pollution.<br>
          Tang, K. (2024). Climate change education in Indonesia formal education: A policy analysis.
        </div>
      </div>


    </div>
    <div style="flex-shrink:0;padding:0.75rem 1.5rem;border-top:1px solid #e0e0e0;display:flex;justify-content:flex-end;gap:0.5rem">
      <button class="btn-sm" style="background:var(--gray-200);color:var(--dark);padding:8px 20px" onclick="closeModal('modal-materi')">Tutup</button>
    </div>
  </div>
</div>
{{-- Custom Styles for Videos --}}
<style>
.videos-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.video-item {
  background: var(--white);
  border: 1px solid var(--border-color, #e3e3e0);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.video-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.video-item-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-color, #1b1b18);
}

.video-item-number {
  font-size: 0.75rem;
  color: var(--gray);
  background: var(--bg-gray, #f5f5f5);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.video-item-desc {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--gray);
  padding: 0.5rem;
  background: var(--bg-gray, #f9f9f9);
  border-radius: 6px;
}

.video-embed-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-embed-wrap iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-placeholder-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-placeholder-btn:hover {
  background: linear-gradient(135deg, #2d2d2d 0%, #404040 100%);
}

.video-placeholder-btn:hover .play-circle {
  transform: scale(1.1);
}

.play-circle {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 0.5rem;
  transition: transform 0.2s ease;
}

.video-iframe-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  z-index: 10;
  transition: background 0.2s ease;
}

.video-close-btn:hover {
  background: rgba(0,0,0,0.9);
}

.video-empty-message {
  text-align: center;
  padding: 2rem;
  background: var(--bg-gray, #f5f5f5);
  border-radius: 12px;
  color: var(--gray);
}

.admin-video-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.admin-video-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.admin-video-info {
  flex: 1;
}

.admin-video-actions {
  display: flex;
  gap: 0.5rem;
}

.video-input-group {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.video-input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.video-input-group input,
.video-input-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e3e3e0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.video-input-group input:focus,
.video-input-group textarea:focus {
  outline: none;
  border-color: var(--green);
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: #e3e3e0;
  transition: background 0.2s ease;
}

.btn-xs:hover {
  background: #d0d0d0;
}

.btn-xs.danger {
  background: #fee2e2;
  color: #dc2626;
}

.btn-xs.danger:hover {
  background: #fecaca;
}
</style>
