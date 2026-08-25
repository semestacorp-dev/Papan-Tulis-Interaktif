import { LessonMaterial } from '../types';

export const DEFAULT_KOTA_METRO_MATERIALS: LessonMaterial[] = [
  {
    id: 'metro-ipa-smp-1',
    title: 'Transformasi Energi & Kelistrikan Ramah Lingkungan di Kota Metro',
    subject: 'IPA (Ilmu Pengetahuan Alam)',
    gradeLevel: 'SMP Kelas VIII / Fase D',
    competencyStandard: 'Memahami konsep perpindahan energi dan merancang solusi hemat energi untuk fasilitas publik Kota Metro.',
    summary: 'Materi interaktif tentang prinsip dasar arus listrik, hukum Ohm, rangkaian seri-paralel, dan implementasi panel surya di sekolah-sekolah Kota Metro Lampung.',
    schoolName: 'SMP Negeri 1 Kota Metro / BGTK Disdikbud',
    authorName: 'Tim BGTK Bidang Dikdas Kota Metro',
    createdAt: Date.now() - 86400000 * 2,
    tags: ['IPA', 'Kurikulum Merdeka', 'Energi Terbarukan', 'Kota Metro'],
    slides: [
      {
        id: 's1',
        slideNumber: 1,
        title: 'Hukum Dasar Kelistrikan: Arus, Tegangan, & Hambatan',
        type: 'concept',
        mainContent: 'Arus listrik ($I$) adalah aliran muatan elektron per satuan waktu. Tegangan ($V$) adalah beda potensial yang mendorong muatan, dan Hambatan ($R$) adalah rintangan aliran arus.',
        bulletPoints: [
          'Hukum Ohm: V = I × R',
          'Satuan: V (Volt), I (Ampere), R (Ohm / Ω)',
          'Analogi pipa air: Tegangan = Pompa Tekanan, Hambatan = Keran Penyempit, Arus = Debit Air'
        ],
        teacherNotes: 'Gunakan papan tulis untuk menggambar diagram pipa air di sebelah kiri dan rumus segitiga V-I-R di sebelah kanan.',
        quickCheckQuestion: 'Jika sebuah lampu kelas di Kota Metro memiliki hambatan 20 Ω dan tegangan 220 V, berapakah arus yang mengalir?'
      },
      {
        id: 's2',
        slideNumber: 2,
        title: 'Rangkaian Seri vs Rangkaian Paralel di Ruang Kelas',
        type: 'diagram',
        mainContent: 'Di instalasi gedung sekolah dan Smart Classroom Kota Metro, instalasi lampu menggunakan rangkaian paralel agar jika 1 lampu padam, lampu lain tetap menyala.',
        bulletPoints: [
          'Rangkaian Seri: Arus sama di setiap titik (I_total = I_1 = I_2), Tegangan terbagi',
          'Rangkaian Paralel: Tegangan sama di setiap cabang (V_total = V_1 = V_2), Arus terbagi',
          'Hambatan Pengganti Paralel: 1/R_total = 1/R_1 + 1/R_2 + ...'
        ],
        teacherNotes: 'Minta perwakilan 2 siswa maju ke papan tulis untuk menyambungkan kabel virtual rangkaian seri dan paralel.'
      },
      {
        id: 's3',
        slideNumber: 3,
        title: 'Penerapan Panel Surya Smart School Kota Metro',
        type: 'activity',
        mainContent: 'Kota Metro menerima intensitas sinar matahari tropis tinggi rata-rata 4.8 kWh/m²/hari. Panel fotovoltaik mengubah energi foton matahari langsung menjadi energi listrik DC.',
        bulletPoints: [
          'Komponen: Sel Surya (Silikon) → Inverter (DC ke AC) → Baterai Penyimpan → Beban Sekolah',
          'Menghemat biaya listrik operasional sekolah hingga 40%',
          'Mendukung target Kota Metro sebagai Kota Pendidikan Berkelanjutan & Ramah Lingkungan'
        ],
        teacherNotes: 'Diskusikan dengan siswa potensi penempatan panel surya di atap sekolah masing-masing.'
      }
    ],
    interactiveQuiz: [
      {
        id: 'q1',
        question: 'Sebuah lampu proyektor pintar memiliki hambatan 44 Ω dihubungkan ke sumber listrik 220 Volt. Berapa kuat arus listriknya?',
        options: ['2.5 Ampere', '5.0 Ampere', '10.0 Ampere', '0.2 Ampere'],
        correctAnswer: 1,
        explanation: 'Sesuai Hukum Ohm: I = V / R = 220 / 44 = 5.0 Ampere.'
      },
      {
        id: 'q2',
        question: 'Mengapa instalasi listrik di ruang kelas sekolah Kota Metro dirancang secara paralel?',
        options: [
          'Agar menghemat kabel secara drastis',
          'Agar jika satu lampu dimatikan, lampu lain tetap menyala normal',
          'Agar hambatan total menjadi semakin besar',
          'Agar arus listrik mengalir searah saja'
        ],
        correctAnswer: 1,
        explanation: 'Pada rangkaian paralel, tiap cabang mendapat tegangan yang sama dan bekerja mandiri tanpa memutus cabang lainnya.'
      }
    ],
    homeworkOrProject: 'Proyek Profil Pelajar Pancasila: Buat peta audit penggunaan daya listrik di kelas dan usulkan 3 langkah efisiensi energi.'
  },
  {
    id: 'metro-matematika-smp-2',
    title: 'Teorema Pythagoras & Pengukuran Jarak Real di Kota Metro',
    subject: 'Matematika',
    gradeLevel: 'SMP Kelas VIII',
    competencyStandard: 'Membuktikan dan menerapkan Teorema Pythagoras dalam pemecahan masalah spasial dan navigasi.',
    summary: 'Eksplorasi visual segitiga siku-siku, rumus Pythagoras a² + b² = c², tripel pythagoras, serta studi kasus menghitung jarak terpendek antar landmark di Kota Metro.',
    schoolName: 'SMP Negeri 2 Kota Metro',
    authorName: 'MGMP Matematika Kota Metro',
    createdAt: Date.now() - 86400000 * 5,
    tags: ['Matematika', 'Geometri', 'Pythagoras', 'Studi Kasus Metro'],
    slides: [
      {
        id: 'm1',
        slideNumber: 1,
        title: 'Konsep Geometris Luas Persegi Sisi Miring',
        type: 'concept',
        mainContent: 'Pada segitiga siku-siku dengan panjang sisi tegak $a$ dan $b$, serta sisi hipotenusa (sisi miring) $c$, jumlah luas persegi pada kedua sisi tegak sama dengan luas persegi pada sisi miring.',
        bulletPoints: [
          'Rumus Utama: a² + b² = c²',
          'Mencari Sisi Miring: c = √(a² + b²)',
          'Mencari Sisi Tegak: a = √(c² - b²) atau b = √(c² - a²)'
        ],
        teacherNotes: 'Gambar segitiga siku-siku di papan tulis dengan 3 kotak luas di setiap sisinya (3x3, 4x4, 5x5).'
      },
      {
        id: 'm2',
        slideNumber: 2,
        title: 'Tripel Pythagoras Populer yang Wajib Dihafal',
        type: 'formula',
        mainContent: 'Tiga bilangan bulat positif yang memenuhi a² + b² = c² disebut Tripel Pythagoras. Kelipatan dari tripel ini juga berlaku.',
        bulletPoints: [
          'Tripel Dasar 1: (3, 4, 5) → Kelipatan: (6, 8, 10), (9, 12, 15), dll.',
          'Tripel Dasar 2: (5, 12, 13) → Kelipatan: (10, 24, 26)',
          'Tripel Dasar 3: (7, 24, 25)',
          'Tripel Dasar 4: (8, 15, 17)'
        ],
        teacherNotes: 'Tuliskan tantangan cepat di papan tulis: jika a=9 dan b=12, berapakah c?'
      },
      {
        id: 'm3',
        slideNumber: 3,
        title: 'Studi Kasus Jarak: Dari Lapangan Samber ke Taman Merdeka Metro',
        type: 'activity',
        mainContent: 'Seorang siswa bersepeda dari Lapangan Samber ke arah Timur sejauh 600 meter, lalu berbelok ke arah Utara sejauh 800 meter menuju Taman Merdeka Kota Metro.',
        bulletPoints: [
          'Jarak lintasan tempuh: 600 m + 800 m = 1.400 m',
          'Perpindahan lurus (hipotenusa): c = √(600² + 800²) = √(360.000 + 640.000) = √1.000.000 = 1.000 meter',
          'Penghematan lintasan langsung: 400 meter!'
        ],
        teacherNotes: 'Ajak siswa menggambar sistem koordinat kartesius Kota Metro di papan tulis interaktif.'
      }
    ],
    interactiveQuiz: [
      {
        id: 'q-mat-1',
        question: 'Sebuah tangga sepanjang 10 meter disandarkan pada dinding tiang bendera di Alun-Alun Kota Metro. Jarak ujung bawah tangga ke dinding adalah 6 meter. Berapakah tinggi dinding yang dicapai tangga?',
        options: ['7 meter', '8 meter', '8.5 meter', '9 meter'],
        correctAnswer: 1,
        explanation: 'Menggunakan rumus b = √(c² - a²) = √(10² - 6²) = √(100 - 36) = √64 = 8 meter.'
      }
    ]
  },
  {
    id: 'metro-sejarah-3',
    title: 'Sejarah Kota Kolonisasi & Warisan Budaya Sai Wawai Kota Metro',
    subject: 'IPS / Sejarah & Muatan Lokal',
    gradeLevel: 'SMP/SMA Kota Metro',
    competencyStandard: 'Menganalisis sejarah pembentukan Kota Metro sejak era Kolonisasi Belanda (1936), tata ruang kota cagar budaya, dan kearifan lokal Lampung.',
    summary: 'Pembelajaran interaktif menelusuri sejarah Kota Metro dari Desa Trimurjo (1936), Bedeng-bedeng kolonisasi, Rumah Asisten Residen / Dokter Swart, hingga filosofi Sai Wawai.',
    schoolName: 'Dinas Pendidikan & Kebudayaan Kota Metro',
    authorName: 'Pamong Budaya & Tim BGTK Kota Metro',
    createdAt: Date.now() - 86400000 * 8,
    tags: ['Sejarah Metro', 'Budaya Lampung', 'Cagar Budaya', 'Sai Wawai'],
    slides: [
      {
        id: 'h1',
        slideNumber: 1,
        title: 'Asal-Usul & Periode Kolonisasi Metro (1936)',
        type: 'concept',
        mainContent: 'Nama Metro berasal dari bahasa Belanda "Meterm" (pusat) dan bahasa Jawa "Mitro" (teman/mitra). Dibuka pada 9 Juni 1936 oleh rombongan transmigran kolonisasi pertama di bawah pimpinan Raden Mas Sewaka.',
        bulletPoints: [
          'Sistem Penomoran Bedeng: Bedeng 1 (Trimurjo), Bedeng 21 (Yosodadi), Bedeng 24 (Tejosari)',
          'Desain Tata Kota Grid konsentris yang rapi dan terencana',
          'Sentralisasi irigasi Way Sekampung yang menyuburkan lumbung pangan'
        ],
        teacherNotes: 'Tampilkan peta arsip sejarah Kota Metro tahun 1937 dan tandai lokasi sekolah saat ini.'
      },
      {
        id: 'h2',
        slideNumber: 2,
        title: 'Semboyan "Bumi Sai Wawai" & Nilai Kearifan Lokal',
        type: 'diagram',
        mainContent: '"Sai Wawai" dalam bahasa Lampung dialek Belalau/Abung berarti "Yang Indah / Yang Bagus / Yang Harmonis". Menggambarkan Kota Metro sebagai kota yang nyaman, damai, dan menjunjung tinggi pendidikan.',
        bulletPoints: [
          'Piil Pesenggiri: Kehormatan dan harga diri yang berbudi luhur',
          'Sakai Sambayan: Semangat gotong royong dan tolong-menolong tanpa pamrih',
          'Nemui Nyimah: Keramahan dan keterbukaan dalam menyambut tamu',
          'Nengah Nyappur: Kemampuan bergaul dan bermusyawarah di masyarakat majemuk'
        ],
        teacherNotes: 'Minta siswa menuliskan aksara Lampung untuk kata "Sai Wawai" di papan tulis interaktif.'
      }
    ]
  }
];
