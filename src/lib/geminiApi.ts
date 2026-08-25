import { LessonMaterial, QuizQuestion, VoiceTranscriptionResult, GroundingSource } from '../types';

export async function generateMateriAI(params: {
  topic: string;
  subject?: string;
  gradeLevel?: string;
  targetAudience?: string;
  additionalInstructions?: string;
}): Promise<LessonMaterial> {
  const res = await fetch('/api/gemini/generate-materi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal menghasilkan materi dari AI');
  }

  const data = await res.json();
  
  // Format slides into SlideItem format with unique IDs
  const slides = (data.slides || []).map((s: any, idx: number) => ({
    id: `ai-slide-${Date.now()}-${idx + 1}`,
    slideNumber: s.slideNumber || idx + 1,
    title: s.title || `Slide ${idx + 1}`,
    type: s.type || 'concept',
    mainContent: s.mainContent || '',
    bulletPoints: s.bulletPoints || [],
    teacherNotes: s.teacherNotes || '',
    quickCheckQuestion: s.quickCheckQuestion || ''
  }));

  const interactiveQuiz: QuizQuestion[] = (data.interactiveQuiz || []).map((q: any, idx: number) => ({
    id: `ai-q-${Date.now()}-${idx}`,
    question: q.question,
    options: q.options || [],
    correctAnswer: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
    explanation: q.explanation || '',
    points: 100
  }));

  return {
    id: `ai-materi-${Date.now()}`,
    title: data.title || params.topic,
    subject: data.subject || params.subject || 'Umum',
    gradeLevel: data.gradeLevel || params.gradeLevel || 'SMP/SMA',
    competencyStandard: data.competencyStandard || '',
    summary: data.summary || '',
    slides: slides.length > 0 ? slides : [
      {
        id: `slide-1`,
        slideNumber: 1,
        title: data.title || params.topic,
        type: 'concept',
        mainContent: data.summary || 'Penjelasan materi interaktif.',
        bulletPoints: ['Poin utama pembelajaran'],
      }
    ],
    interactiveQuiz,
    homeworkOrProject: data.homeworkOrProject || '',
    authorName: 'AI Asisten BGTK Kota Metro',
    schoolName: 'Dinas Pendidikan Kota Metro',
    createdAt: Date.now(),
    tags: [data.subject || 'Umum', 'AI-Generated', 'Kota Metro', 'Papan Interaktif']
  };
}

export async function searchGroundingAI(query: string, context = 'Pendidikan di Kota Metro Lampung'): Promise<{ answer: string; sources: GroundingSource[] }> {
  const res = await fetch('/api/gemini/search-grounding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal mencari dengan Google Search Grounding');
  }

  return await res.json();
}

export async function explainTopicFast(term: string, context?: string): Promise<{ explanation: string; term: string }> {
  const res = await fetch('/api/gemini/explain-topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ term, context }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal memproses ringkasan konsep');
  }

  return await res.json();
}

export async function transcribeVoiceAudio(audioBase64: string, mimeType = 'audio/webm'): Promise<VoiceTranscriptionResult> {
  const res = await fetch('/api/gemini/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal mentranskripsi suara guru');
  }

  return await res.json();
}

export async function chatWithCopilot(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  systemRole?: string;
  currentBoardContext?: string;
}): Promise<{ reply: string }> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal berkomunikasi dengan asisten AI');
  }

  return await res.json();
}

export async function generateInteractiveQuizAI(topic: string, count = 3, gradeLevel = 'SMP'): Promise<QuizQuestion[]> {
  const res = await fetch('/api/gemini/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, count, gradeLevel }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal membuat soal kuis');
  }

  const data = await res.json();
  return data.questions || [];
}
