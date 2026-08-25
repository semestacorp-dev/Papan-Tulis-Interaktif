import { DriveFileItem, LessonMaterial, SlideItem } from '../types';

export const SAMPLE_BGTK_DRIVE_FILES: DriveFileItem[] = [
  {
    id: 'drive-metro-slides-1',
    name: 'Modul_Ajar_Fisika_SMPN1Metro_Listrik_Dinamis.gslides',
    mimeType: 'application/vnd.google-apps.presentation',
    modifiedTime: '2026-08-20T08:30:00Z',
    size: '4.2 MB',
    thumbnailLink: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    webViewLink: 'https://docs.google.com/presentation/d/sample-fisika-metro/preview'
  },
  {
    id: 'drive-metro-slides-2',
    name: 'Papan_Interaktif_Geometri_Pythagoras_SMP2Metro.gslides',
    mimeType: 'application/vnd.google-apps.presentation',
    modifiedTime: '2026-08-18T14:15:00Z',
    size: '3.8 MB',
    thumbnailLink: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    webViewLink: 'https://docs.google.com/presentation/d/sample-pythagoras/preview'
  },
  {
    id: 'drive-metro-pdf-3',
    name: 'Buku_Ajar_Muatan_Lokal_Sejarah_Kota_Metro_Bumi_Sai_Wawai.pdf',
    mimeType: 'application/pdf',
    modifiedTime: '2026-08-15T10:00:00Z',
    size: '12.5 MB',
    thumbnailLink: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
    webViewLink: 'https://drive.google.com/file/d/sample-sejarah-metro/preview'
  },
  {
    id: 'drive-metro-doc-4',
    name: 'RPP_Kurikulum_Merdeka_BGTK_Kota_Metro_2026.gdoc',
    mimeType: 'application/vnd.google-apps.document',
    modifiedTime: '2026-08-22T09:45:00Z',
    size: '1.1 MB',
    thumbnailLink: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    webViewLink: 'https://docs.google.com/document/d/sample-rpp-metro/preview'
  }
];

export async function fetchGoogleDriveFiles(accessToken?: string, searchQuery = ''): Promise<DriveFileItem[]> {
  if (!accessToken) {
    // Return curated BGTK Kota Metro drive repository when user is not authenticated with personal drive
    if (searchQuery.trim()) {
      return SAMPLE_BGTK_DRIVE_FILES.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return SAMPLE_BGTK_DRIVE_FILES;
  }

  try {
    let q = "trashed = false and (mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document' or mimeType contains 'image/')";
    if (searchQuery.trim()) {
      q += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,iconLink,modifiedTime,size)&pageSize=25`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.warn('Drive API error, returning sample BGTK files:', res.statusText);
      return SAMPLE_BGTK_DRIVE_FILES;
    }

    const data = await res.json();
    const driveFiles = data.files || [];
    
    // Combine fetched files with sample Kota Metro files for maximum usability
    return [...driveFiles, ...SAMPLE_BGTK_DRIVE_FILES];
  } catch (error) {
    console.error('Error fetching drive files:', error);
    return SAMPLE_BGTK_DRIVE_FILES;
  }
}

export function convertDriveFileToLesson(file: DriveFileItem): LessonMaterial {
  const isPresentation = file.mimeType.includes('presentation');
  const isPdf = file.mimeType.includes('pdf');

  let slides: SlideItem[] = [];

  if (file.id === 'drive-metro-slides-1') {
    slides = [
      {
        id: 'drive-s1',
        slideNumber: 1,
        title: 'Pengenalan Arus Listrik & Beda Potensial',
        type: 'drive_slide',
        mainContent: 'Materi Slide Presentasi Google Drive - Kelistrikan Dinamis SMP Kota Metro.',
        bulletPoints: [
          'Arus Listrik: Aliran elektron bebas dalam penghantar kawat tembaga',
          'Arah Arus Konvensional: Dari kutub positif (+) ke kutub negatif (-)',
          'Alat Ukur: Amperemeter (dipasang Seri) dan Voltmeter (dipasang Paralel)'
        ],
        teacherNotes: 'Tunjukkan alat peraga voltmeter dan amperemeter di meja guru.'
      },
      {
        id: 'drive-s2',
        slideNumber: 2,
        title: 'Hukum I Kirchhoff & Titik Percabangan',
        type: 'drive_slide',
        mainContent: 'Jumlah kuat arus listrik yang masuk ke suatu titik percabangan sama dengan jumlah kuat arus listrik yang keluar dari titik tersebut.',
        bulletPoints: [
          'Σ I_masuk = Σ I_keluar',
          'Contoh: Jika I_masuk = 10 A, dan terbagi ke I_1 = 4 A, maka I_2 = 6 A',
          'Hukum kekekalan muatan listrik'
        ],
        teacherNotes: 'Gunakan pena merah dan biru di papan tulis untuk menandai arus masuk dan keluar.'
      },
      {
        id: 'drive-s3',
        slideNumber: 3,
        title: 'Kuis Singkat Interaktif Kelas',
        type: 'quiz',
        mainContent: 'Uji pemahaman langsung di papan tulis interaktif!',
        bulletPoints: [
          'Sentuh pilihan jawaban di papan tulis atau kirim via perangkat masing-masing'
        ]
      }
    ];
  } else if (file.id === 'drive-metro-slides-2') {
    slides = [
      {
        id: 'drive-p1',
        slideNumber: 1,
        title: 'Teorema Pythagoras: Sejarah & Pembuktian Visual',
        type: 'drive_slide',
        mainContent: 'Pembuktian Teorema Pythagoras melalui penyusunan 4 segitiga kongruen dalam bujursangkar.',
        bulletPoints: [
          'Karya filsuf Yunani Kuno Pythagoras dari Samos (570–495 SM)',
          'Luas persegi besar = (a + b)²',
          'Luas 4 segitiga + luas persegi miring = 4(½ab) + c² = 2ab + c²',
          'Terbukti: a² + 2ab + b² = 2ab + c²  ===>  a² + b² = c²'
        ]
      },
      {
        id: 'drive-p2',
        slideNumber: 2,
        title: 'Aplikasi Nyata: Menghitung Tinggi Pohon / Tiang Samber Park',
        type: 'drive_slide',
        mainContent: 'Menggunakan klinometer dan Teorema Pythagoras untuk mengukur tinggi obyek tanpa memanjat.',
        bulletPoints: [
          'Tinggi Obyek = (Jarak Pengamat × tan θ) + Tinggi Mata Pengamat',
          'Latihan pengukuran di lapangan olahraga sekolah'
        ]
      }
    ];
  } else {
    // Generic fallback presentation slides
    slides = [
      {
        id: `drive-gen-1`,
        slideNumber: 1,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        type: 'drive_slide',
        mainContent: `Dokumen Pembelajaran Terintegrasi dari Google Drive: ${file.name}`,
        bulletPoints: [
          `Format Berkas: ${isPresentation ? 'Google Slides' : isPdf ? 'Dokumen PDF' : 'Berkas Google Drive'}`,
          'Dapat dianotasi langsung secara real-time di atas papan tulis interaktif',
          'Perubahan coretan guru tersinkronisasi otomatis untuk semua siswa di kelas'
        ],
        teacherNotes: 'Gunakan stylus atau sentuhan jari pada layar papan interaktif untuk menulis anotasi.'
      },
      {
        id: `drive-gen-2`,
        slideNumber: 2,
        title: 'Eksplorasi Konsep & Catatan Interaktif',
        type: 'concept',
        mainContent: 'Gunakan alat gambar (pen, highlighter, bentuk geometri) untuk menandai bagian penting.',
        bulletPoints: [
          'Pena warna-warni untuk membuat sketsa dan persamaan',
          'Stabilo transparan untuk menggarisbawahi poin kunci',
          'Kertas tempel (Sticky Note) untuk ringkasan catatan siswa'
        ]
      }
    ];
  }

  return {
    id: `drive-mat-${file.id}`,
    title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
    subject: 'Materi Google Drive',
    gradeLevel: 'Umum / Terintegrasi',
    summary: `Materi yang diimpor dari Google Drive: ${file.name}`,
    slides,
    driveFileId: file.id,
    driveFileName: file.name,
    driveMimeType: file.mimeType,
    authorName: 'Google Drive Terhubung',
    schoolName: 'Dinas Pendidikan Kota Metro',
    createdAt: Date.now(),
    tags: ['Google Drive', 'Papan Tulis Interaktif', 'BGTK Kota Metro']
  };
}
