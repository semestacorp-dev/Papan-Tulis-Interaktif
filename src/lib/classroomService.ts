import { ClassroomCourse, ClassroomAnnouncement, ClassroomCourseWork, LessonMaterial } from '../types';

// Curated sample/mock Classroom data for BGTK Kota Metro
export const SAMPLE_COURSES: ClassroomCourse[] = [
  {
    id: 'class-metro-101',
    name: 'Fisika Kelas VIII - SMPN 1 Metro',
    section: 'Semester Ganjil 2026',
    descriptionHeading: 'Materi Kelistrikan Dinamis & Energi Terbarukan',
    alternateLink: 'https://classroom.google.com/c/sample-fisika-metro'
  },
  {
    id: 'class-metro-202',
    name: 'Matematika Kelas VII - SMPN 2 Metro',
    section: 'Semester Ganjil 2026',
    descriptionHeading: 'Teorema Pythagoras & Geometri Interaktif',
    alternateLink: 'https://classroom.google.com/c/sample-matematika-metro'
  },
  {
    id: 'class-metro-303',
    name: 'Muatan Lokal Sejarah Kota Metro',
    section: 'Semua Kelas IX',
    descriptionHeading: 'Sejarah Budaya Lampung & Cagar Budaya Kota Metro',
    alternateLink: 'https://classroom.google.com/c/sample-mulok-metro'
  }
];

export const SAMPLE_ANNOUNCEMENTS: Record<string, ClassroomAnnouncement[]> = {
  'class-metro-101': [
    {
      id: 'ann-1',
      text: 'Selamat pagi siswa-siswi Kelas VIII. Silakan bersiap untuk kelas hari ini. Kita akan membahas Kelistrikan Dinamis di Papan Tulis Interaktif BGTK Kota Metro.',
      creationTime: '2026-08-25T07:30:00Z',
      alternateLink: 'https://classroom.google.com/c/sample-fisika-metro/p/ann-1'
    }
  ],
  'class-metro-202': [
    {
      id: 'ann-2',
      text: 'Tugas Teorema Pythagoras sudah dikirim ke dashboard masing-masing. Silakan diskusikan di Papan Tulis Interaktif.',
      creationTime: '2026-08-24T09:15:00Z',
      alternateLink: 'https://classroom.google.com/c/sample-matematika-metro/p/ann-2'
    }
  ],
  'class-metro-303': []
};

export const SAMPLE_COURSEWORK: Record<string, ClassroomCourseWork[]> = {
  'class-metro-101': [
    {
      id: 'cw-1',
      title: 'Latihan Hukum Kirchhoff & Hambatan Pengganti',
      description: 'Selesaikan lembar kerja kelistrikan yang dibagikan oleh Guru di Papan Tulis Interaktif.',
      creationTime: '2026-08-22T08:00:00Z',
      alternateLink: 'https://classroom.google.com/c/sample-fisika-metro/a/cw-1'
    }
  ],
  'class-metro-202': [
    {
      id: 'cw-2',
      title: 'Aplikasi Teorema Pythagoras di Kehidupan Nyata',
      description: 'Menghitung tinggi tiang bendera lapangan olahraga menggunakan klinometer sederhana.',
      creationTime: '2026-08-23T11:30:00Z',
      alternateLink: 'https://classroom.google.com/c/sample-matematika-metro/a/cw-2'
    }
  ],
  'class-metro-303': [
    {
      id: 'cw-3',
      title: 'Review Cagar Budaya Dokterswoning & Menara Masjid Taqwa',
      description: 'Buatlah rangkuman singkat tentang sejarah cagar budaya Kota Metro.',
      creationTime: '2026-08-24T14:00:00Z',
      alternateLink: 'https://classroom.google.com/c/sample-mulok-metro/a/cw-3'
    }
  ]
};

export async function fetchClassroomCourses(accessToken?: string): Promise<ClassroomCourse[]> {
  if (!accessToken) {
    return SAMPLE_COURSES;
  }

  try {
    const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      console.warn('Classroom API returned non-200, using sample courses:', res.statusText);
      return SAMPLE_COURSES;
    }

    const data = await res.json();
    const courses = data.courses || [];
    return courses.length > 0 ? courses : SAMPLE_COURSES;
  } catch (err) {
    console.error('Error fetching Classroom courses:', err);
    return SAMPLE_COURSES;
  }
}

export async function fetchClassroomAnnouncements(courseId: string, accessToken?: string): Promise<ClassroomAnnouncement[]> {
  if (!accessToken) {
    return SAMPLE_ANNOUNCEMENTS[courseId] || [];
  }

  try {
    const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      return SAMPLE_ANNOUNCEMENTS[courseId] || [];
    }

    const data = await res.json();
    return data.announcements || SAMPLE_ANNOUNCEMENTS[courseId] || [];
  } catch (err) {
    console.error('Error fetching Classroom announcements:', err);
    return SAMPLE_ANNOUNCEMENTS[courseId] || [];
  }
}

export async function fetchClassroomCourseWork(courseId: string, accessToken?: string): Promise<ClassroomCourseWork[]> {
  if (!accessToken) {
    return SAMPLE_COURSEWORK[courseId] || [];
  }

  try {
    const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      return SAMPLE_COURSEWORK[courseId] || [];
    }

    const data = await res.json();
    return data.courseWork || SAMPLE_COURSEWORK[courseId] || [];
  } catch (err) {
    console.error('Error fetching Classroom courseWork:', err);
    return SAMPLE_COURSEWORK[courseId] || [];
  }
}

// Publish an announcement (whiteboard session link) to Google Classroom
export async function createClassroomAnnouncement(
  courseId: string,
  text: string,
  roomUrl: string,
  accessToken?: string
): Promise<ClassroomAnnouncement> {
  if (!accessToken) {
    // Return mock response for seamless demo flow
    const newAnn: ClassroomAnnouncement = {
      id: `ann-mock-${Date.now()}`,
      text: `${text}\nLink Papan Interaktif: ${roomUrl}`,
      creationTime: new Date().toISOString(),
      alternateLink: 'https://classroom.google.com'
    };
    if (!SAMPLE_ANNOUNCEMENTS[courseId]) {
      SAMPLE_ANNOUNCEMENTS[courseId] = [];
    }
    SAMPLE_ANNOUNCEMENTS[courseId].unshift(newAnn);
    return newAnn;
  }

  const payload = {
    text: `${text}\nLink Akses Papan Tulis: ${roomUrl}`,
    assigneeMode: 'ALL_STUDENTS',
    materials: [
      {
        link: {
          url: roomUrl,
          title: 'Gabung Papan Tulis Interaktif BGTK Kota Metro'
        }
      }
    ]
  };

  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Failed to publish announcement: ${res.statusText}`);
  }

  return await res.json();
}

// Publish a Lesson Material directly as a Google Classroom coursework material
export async function createClassroomCourseWorkMaterial(
  courseId: string,
  lesson: LessonMaterial,
  roomUrl: string,
  accessToken?: string
): Promise<ClassroomCourseWork> {
  if (!accessToken) {
    // Return mock response for demo flow
    const newCW: ClassroomCourseWork = {
      id: `cw-mock-${Date.now()}`,
      title: `[Materi Ajar] ${lesson.title}`,
      description: `${lesson.summary}\nBahan ajar dipublikasikan dari Papan Tulis Interaktif BGTK Kota Metro.`,
      creationTime: new Date().toISOString(),
      alternateLink: 'https://classroom.google.com'
    };
    if (!SAMPLE_COURSEWORK[courseId]) {
      SAMPLE_COURSEWORK[courseId] = [];
    }
    SAMPLE_COURSEWORK[courseId].unshift(newCW);
    return newCW;
  }

  const payload = {
    title: `[Materi] ${lesson.title}`,
    description: `${lesson.summary}\n\nMateri ini dapat dipelajari langsung melalui Papan Tulis Interaktif BGTK Dinas Pendidikan Kota Metro dengan mengakses link di bawah ini.`,
    materials: [
      {
        link: {
          url: roomUrl,
          title: `Papan Interaktif - ${lesson.title}`
        }
      }
    ],
    state: 'PUBLISHED'
  };

  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWorkMaterials`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Failed to publish coursework material: ${res.statusText}`);
  }

  return await res.json();
}
