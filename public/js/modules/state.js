// ══════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT - Eclypse App
// ══════════════════════════════════════════════════════════════════════════

const state = {
  user: null,
  isAdmin: false,
  currentPage: 'login',
  selectedNewsIndex: null,
  answers: {},
  news: [],
  videoUrl: '',
  videoTitle: 'Video Pembelajaran',
  videoDesc: '🌿 <strong>Judul video:</strong> Krisis Iklim — Mengapa Kita Harus Peduli?',
  ecoCards: [
    // ── AKTIVIS LINGKUNGAN (6 kartu) ──
    {
      type:'aktivis', icon:'🗑️', badge:'Aktivis Lingkungan',
      title:'Sampah Plastik di Indonesia & Malang',
      desc:'Data pengelolaan sampah nasional menunjukkan bahwa sampah plastik menyumbang sekitar 19% dari total timbulan sampah di Indonesia. Artinya, dari seluruh sampah yang dihasilkan masyarakat, hampir seperlimanya berupa plastik. Di Kota Malang sendiri, sampah plastik menyumbang sekitar 16% dari 731 ton sampah harian, atau lebih dari 106 ton plastik setiap harinya.<br><br><em>Sumber: SIPSN KLHK (2024); DLH Kota Malang (2025)</em>'
    },
    {
      type:'aktivis', icon:'🌊', badge:'Aktivis Lingkungan',
      title:'Plastik Mengancam Lautan',
      desc:'Menurut laporan UNEP, sekitar 11 juta ton sampah plastik masuk ke ekosistem laut setiap tahun. Jika tidak ada perubahan kebijakan dan perilaku masyarakat, jumlah tersebut diperkirakan hampir tiga kali lipat pada tahun 2040. Sampah plastik yang masuk ke laut dapat membahayakan berbagai organisme laut dan mengganggu keseimbangan ekosistem.<br><br><em>Sumber: UNEP (2023). Turning Off the Tap.</em>'
    },
    {
      type:'aktivis', icon:'⏳', badge:'Aktivis Lingkungan',
      title:'Plastik Butuh Ratusan Tahun untuk Terurai',
      desc:'Berbagai jenis plastik membutuhkan waktu sangat lama untuk terurai di lingkungan. Kantong plastik membutuhkan 10–20 tahun, sedotan plastik sekitar 200 tahun, dan botol plastik hingga 450 tahun. Styrofoam bahkan diperkirakan membutuhkan hingga 500 tahun untuk terurai sepenuhnya.<br><br><em>Sumber: UNEP, Single-Use Plastics: A Roadmap for Sustainability.</em>'
    },
    {
      type:'aktivis', icon:'📈', badge:'Aktivis Lingkungan',
      title:'Produksi Plastik Global Terus Melonjak',
      desc:'Laporan OECD menunjukkan bahwa produksi plastik global meningkat dari sekitar 234 juta ton pada tahun 2000 menjadi 460 juta ton pada tahun 2019 — lebih dari dua kali lipat dalam 19 tahun. OECD memproyeksikan produksi plastik global akan mencapai 1.231 juta ton pada tahun 2060 jika tidak ada intervensi kebijakan yang signifikan.<br><br><em>Sumber: OECD, Global Plastics Outlook.</em>'
    },
    {
      type:'aktivis', icon:'🏭', badge:'Aktivis Lingkungan',
      title:'Plastik & Emisi Gas Rumah Kaca',
      desc:'Menurut laporan OECD, seluruh siklus hidup plastik menghasilkan sekitar 1,8 miliar ton emisi gas rumah kaca pada tahun 2019 dan menyumbang sekitar 3,4% emisi gas rumah kaca global. Sekitar 90% emisi tersebut berasal dari proses produksi dan pengolahan plastik yang menggunakan bahan bakar fosil.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook.</em>'
    },
    {
      type:'aktivis', icon:'🐢', badge:'Aktivis Lingkungan',
      title:'Dampak Plastik pada Satwa Laut',
      desc:'Menurut WWF, hampir 88% spesies laut di dunia sudah terdampak oleh pencemaran plastik yang parah di lautan. Banyak hewan laut seperti penyu, lumba-lumba, dan burung laut menelan plastik karena mengira plastik adalah makanan mereka. Bahkan, 25% spesies ikan laut yang kita konsumsi sehari-hari sudah mengandung partikel mikroplastik di tubuhnya.<br><br><em>Sumber: WWF (2022). Impacts of plastic pollution on biodiversity.</em>'
    },

    // ── PEDAGANG (7 kartu) ──
    {
      type:'pedagang', icon:'💰', badge:'Pedagang',
      title:'Harga Plastik vs Kemasan Ramah Lingkungan',
      desc:'Kantong plastik belanja dapat diperoleh dengan kisaran harga sekitar Rp100–Rp300 per lembar, sedangkan paper bag dengan ukuran yang setara berkisar antara Rp500–Rp2.000 per lembar, tergantung ukuran, ketebalan, dan kualitas bahan. Perbedaan harga ini sangat terasa bagi pedagang kecil yang melayani ratusan pembeli per hari.<br><br><em>Sumber: INAPLAS (2024); Survei harga kemasan marketplace Indonesia 2024–2025.</em>'
    },
    {
      type:'pedagang', icon:'📦', badge:'Pedagang',
      title:'Keunggulan Plastik yang Belum Tergantikan',
      desc:'Kemasan plastik menjadi pilihan utama pelaku usaha karena memiliki kombinasi keunggulan yang belum sepenuhnya tergantikan: harga murah, ringan, tahan air, fleksibel, dan mampu melindungi produk dari kerusakan. Menurut UNEP (2018), karakteristik inilah yang menjadikan plastik sebagai material kemasan paling dominan di dunia, terutama untuk produk makanan dan minuman.<br><br><em>Sumber: UNEP (2018). Single-Use Plastics: A Roadmap for Sustainability.</em>'
    },
    {
      type:'pedagang', icon:'📊', badge:'Pedagang',
      title:'Kemasan sebagai Biaya Produksi UMKM',
      desc:'Dalam kegiatan usaha, kemasan bukan hanya berfungsi untuk membungkus produk tetapi juga menjadi bagian dari biaya produksi yang harus diperhitungkan. Bagi usaha mikro dan kecil, peningkatan biaya kemasan dapat memengaruhi keuntungan yang diperoleh. Oleh karena itu, pelaku usaha cenderung memilih kemasan yang mampu melindungi produk dengan biaya yang terjangkau agar harga jual tetap dapat diterima oleh konsumen.<br><br><em>Sumber: Kementerian Perindustrian RI (2022). Analisis Perkembangan Industri Kemasan Indonesia.</em>'
    },
    {
      type:'pedagang', icon:'🛍️', badge:'Pedagang',
      title:'Konsumen & Sensitivitas Harga',
      desc:'Berbagai penelitian mengenai perilaku konsumen menunjukkan bahwa harga merupakan salah satu faktor utama yang memengaruhi keputusan pembelian. Banyak konsumen mendukung penggunaan kemasan ramah lingkungan, namun sebagian masih mempertimbangkan harga produk yang harus dibayar. Jika biaya kemasan meningkat, harga jual produk juga berpotensi meningkat sehingga dapat memengaruhi minat pembeli.<br><br><em>Sumber: Prakash, G., et al. (2019). Journal of Cleaner Production.</em>'
    },
    {
      type:'pedagang', icon:'🏪', badge:'Pedagang',
      title:'65 Juta UMKM Bergantung pada Plastik',
      desc:'Berdasarkan data Kementerian Koperasi dan UKM (2023), terdapat lebih dari 65 juta UMKM di Indonesia yang sebagian besar masih mengandalkan kemasan plastik dalam operasional harian mereka. Beban biaya kemasan ramah lingkungan yang lebih tinggi berpotensi mengancam keberlangsungan usaha mikro yang marginnya sudah sangat tipis.<br><br><em>Sumber: Kementerian Koperasi dan UKM RI (2023).</em>'
    },
    {
      type:'pedagang', icon:'🚧', badge:'Pedagang',
      title:'Tantangan Ketersediaan Kemasan Alternatif',
      desc:'Meskipun penggunaan kemasan ramah lingkungan terus berkembang, penerapannya masih menghadapi berbagai tantangan. Beberapa alternatif kemasan memiliki harga yang lebih tinggi, ketersediaan yang belum merata, serta memerlukan penyesuaian dalam proses produksi dan distribusi. Di Indonesia, ketersediaan kemasan alternatif yang terjangkau masih sangat terbatas, terutama di luar kota besar, sehingga pedagang kecil di daerah seperti Malang belum memiliki banyak pilihan yang realistis.<br><br><em>Sumber: UNEP (2023). Turning off the Tap.</em>'
    },
    {
      type:'pedagang', icon:'📋', badge:'Pedagang',
      title:'Kebijakan Plastik & Masa Transisi UMKM',
      desc:'Berbagai negara dan daerah mulai menerapkan kebijakan pengurangan plastik sekali pakai. Namun, pelaksanaan kebijakan tersebut sering kali memerlukan masa transisi bagi pelaku usaha, terutama UMKM. Di Kota Malang, rencana Perda pembatasan plastik yang ditargetkan pada 2026 belum disertai program pendampingan resmi bagi pedagang kecil untuk beralih ke kemasan alternatif.<br><br><em>Sumber: UNEP (2023); DPRD Kota Malang dalam JatimTimes, Agustus 2025.</em>'
    },

    // ── PENELITI (7 kartu) ──
    {
      type:'peneliti', icon:'🔮', badge:'Peneliti',
      title:'Proyeksi Produksi Plastik 2060',
      desc:'OECD (2022) memproyeksikan bahwa tanpa perubahan kebijakan yang signifikan, produksi plastik global dapat mencapai 1.231 juta ton pada tahun 2060 — hampir tiga kali lipat dari produksi tahun 2019. Pada skenario yang sama, sampah plastik yang bocor ke lingkungan diperkirakan akan meningkat dua kali lipat.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook. OECD Publishing.</em>'
    },
    {
      type:'peneliti', icon:'🌡️', badge:'Peneliti',
      title:'Plastik & Emisi Karbon: Data Ilmiah',
      desc:'Berdasarkan laporan OECD, seluruh siklus hidup plastik menghasilkan sekitar 1,8 miliar ton emisi gas rumah kaca pada tahun 2019, atau setara dengan 3,4% emisi gas rumah kaca global. Sekitar 90% emisi tersebut berasal dari proses produksi dan konversi plastik berbahan bakar fosil. Temuan ini menunjukkan bahwa permasalahan plastik tidak hanya berkaitan dengan limbah, tetapi juga berkaitan langsung dengan perubahan iklim.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook.</em>'
    },
    {
      type:'peneliti', icon:'♻️', badge:'Peneliti',
      title:'Nasib Plastik: Hanya 9% yang Didaur Ulang',
      desc:'Studi yang diterbitkan dalam jurnal Science (2017) memperkirakan bahwa dari seluruh plastik yang pernah diproduksi sejak 1950 hingga 2015 — totalnya sekitar 8,3 miliar ton — hanya 9% yang berhasil didaur ulang, 12% dibakar, dan sisanya 79% menumpuk di tempat pembuangan akhir atau mencemari lingkungan.<br><br><em>Sumber: Geyer, R., Jambeck, J. R., & Law, K. L. (2017). Science Advances, 3(7), e1700782.</em>'
    },
    {
      type:'peneliti', icon:'🩸', badge:'Peneliti',
      title:'Mikroplastik Ditemukan dalam Darah Manusia',
      desc:'Penelitian yang dipublikasikan dalam jurnal Environment International melaporkan bahwa partikel mikroplastik ditemukan pada 17 dari 22 sampel darah manusia (sekitar 77%) yang dianalisis. Di Kota Malang, penelitian InfoMalang (Juli 2025) juga mengonfirmasi bahwa mikroplastik telah ditemukan di Sungai Brantas dengan konsentrasi 31 partikel per 10 liter air di sekitar Jembatan Muharto.<br><br><em>Sumber: Leslie, H. A., et al. (2022). Environment International, 163, 107199.</em>'
    },
    {
      type:'peneliti', icon:'🌊', badge:'Peneliti',
      title:'Skala Plastik di Perairan Global',
      desc:'OECD memperkirakan bahwa pada tahun 2019 sekitar 6,1 juta ton sampah plastik masuk ke lingkungan perairan, dan sekitar 1,7 juta ton di antaranya mencapai lautan. Total akumulasi plastik di lingkungan perairan diperkirakan telah mencapai 139 juta ton. Untuk membayangkan skalanya: 1,7 juta ton setara dengan membuang satu truk sampah plastik ke laut setiap menitnya.<br><br><em>Sumber: OECD (2022). Global Plastics Outlook.</em>'
    },
    {
      type:'peneliti', icon:'🌱', badge:'Peneliti',
      title:'Mikroplastik Merusak Kemampuan Tanah Menyerap Karbon',
      desc:'Penelitian dalam jurnal Environmental Science & Technology menunjukkan bahwa akumulasi mikroplastik di tanah dapat mengubah struktur tanah, aktivitas mikroorganisme, serta proses dekomposisi bahan organik. Perubahan tersebut berpotensi mengganggu kemampuan tanah dalam menyimpan karbon (carbon sequestration) — salah satu mekanisme penting untuk mengurangi CO₂ di atmosfer.<br><br><em>Sumber: de Souza Machado, A. A., et al. (2019). Environmental Science & Technology, 53(10), 6044–6052.</em>'
    },
    {
      type:'peneliti', icon:'💨', badge:'Peneliti',
      title:'Emisi Plastik Bisa Capai 56 Gigaton CO₂ pada 2050',
      desc:'Penelitian dalam jurnal Nature Climate Change memperkirakan bahwa apabila produksi dan konsumsi plastik terus meningkat tanpa perubahan signifikan, emisi gas rumah kaca dari industri plastik diperkirakan dapat mencapai lebih dari 56 gigaton CO₂ ekuivalen secara kumulatif pada tahun 2050 — setara dengan sekitar 10–13% dari sisa anggaran karbon global untuk membatasi pemanasan bumi pada target 1,5°C.<br><br><em>Sumber: Zheng, J., & Suh, S. (2019). Nature Climate Change, 9(5), 374–378.</em>'
    }
  ],
  arguments: [],
  comments: [],
  onlineStudents: [
    { id:'rafi', name:'Rafi Pratama' }, { id:'dian', name:'Dian Anggraeni' },
    { id:'sari', name:'Sari Dewi' }, { id:'budi', name:'Budi Santoso' },
    { id:'aldi', name:'Aldi Prasetyo' }, { id:'nina', name:'Nina Lestari' },
    { id:'farhan', name:'Farhan Akbar' }, { id:'putri', name:'Putri Maharani' }
  ],
  groups: [
    { id:'hijau', name:'Kelompok Hijau', icon:'🌿', side:'Pro', members:['rafi','dian','sari','budi'] },
    { id:'merah', name:'Kelompok Merah', icon:'⚡', side:'Kontra', members:['aldi','nina','farhan','putri'] }
  ],
  teamButtons: { pro: [true, true, true, true, true], con: [true, true, true, true, true] },
  registeredUsers: {},
  openedPacks: {},
  tahap2Completed: false,   // Tahap 2 selesai dibaca
  pemantikAnswers: {},
  pemantikSubmitted: false,
  _newsRecap: null,
  _refleksiRecap: null,
  _visitedTahap4: false,
  // Database answers tracking
  dbAnswers: {},
  newsProgress: {},
  myGroup: null,
};

// Export state untuk digunakan di modul lain
window.state = state;
