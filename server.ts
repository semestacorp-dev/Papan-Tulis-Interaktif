import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with higher limit for audio/image payloads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. Gemini features will return fallback/mock data if unavailable.');
      genAIClient = new GoogleGenAI({ apiKey: 'dummy-key' });
    } else {
      genAIClient = new GoogleGenAI({ apiKey });
    }
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'BGTK Dinas Pendidikan Kota Metro - Papan Tulis Interaktif Backend'
  });
});

// API: Generate Interactive Lesson Materials for Whiteboard
app.post('/api/gemini/generate-materi', async (req, res) => {
  try {
    const { topic, subject, gradeLevel, targetAudience = 'Siswa', additionalInstructions = '' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topik materi wajib diisi' });
    }

    const ai = getGeminiClient();
    const prompt = `Anda adalah Tim Pengembang Kurikulum dan Pembelajaran Interaktif BGTK (Bidang Guru dan Tenaga Kependidikan) Dinas Pendidikan Kota Metro, Lampung.
Buat materi pembelajaran interaktif terstruktur dan lengkap untuk ditampilkan di Papan Tulis Interaktif (Interactive Whiteboard) ruang kelas.

Topik: ${topic}
Mata Pelajaran: ${subject || 'Umum'}
Jenjang/Kelas: ${gradeLevel || 'SMP/SMA'}
Sasaran: ${targetAudience}
Instruksi Tambahan: ${additionalInstructions}

Tanggapi dalam format JSON VALID dengan struktur:
{
  "title": "Judul Materi Menarik",
  "subject": "${subject || 'Umum'}",
  "gradeLevel": "${gradeLevel || 'SMP/SMA'}",
  "competencyStandard": "Capaian Pembelajaran (CP) / Tujuan Pembelajaran",
  "summary": "Ringkasan konsep utama dalam 2-3 kalimat",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Judul Slide",
      "type": "concept" | "formula" | "diagram" | "activity" | "quiz",
      "mainContent": "Penjelasan inti konsep yang padat, jelas, dan ramah siswa",
      "bulletPoints": ["Poin penting 1", "Poin penting 2", "Poin penting 3"],
      "teacherNotes": "Panduan penjelasan bagi Bapak/Ibu Guru di depan kelas",
      "boardDrawings": [
        {
          "type": "text" | "box" | "circle" | "arrow",
          "text": "Label gambar/rumus jika ada",
          "color": "#1e293b",
          "x": 100,
          "y": 100
        }
      ],
      "quickCheckQuestion": "Pertanyaan pemantik interaktif untuk dijawab siswa di papan tulis"
    }
  ],
  "interactiveQuiz": [
    {
      "question": "Soal kuis interaktif 1",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "correctIndex": 0,
      "explanation": "Pembahasan singkat dan memotivasi"
    },
    {
      "question": "Soal kuis interaktif 2",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "correctIndex": 1,
      "explanation": "Pembahasan singkat dan memotivasi"
    }
  ],
  "homeworkOrProject": "Aktivitas tindak lanjut / Proyek Penguatan Profil Pelajar Pancasila yang relevan dengan Kota Metro"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Tidak ada respons dari model AI');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generate materi:', error);
    return res.status(500).json({
      error: error.message || 'Gagal membuat materi pembelajaran',
      fallback: true
    });
  }
});

// API: Search Grounding for Real-Time Educational & Kota Metro Facts
app.post('/api/gemini/search-grounding', async (req, res) => {
  try {
    const { query, context = 'Pendidikan di Kota Metro Lampung' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query wajib diisi' });
    }

    const ai = getGeminiClient();
    const prompt = `Gunakan Google Search untuk mencari informasi faktual, akurat, dan mutakhir tentang:
"${query}"
Konteks Pembelajaran: ${context}

Berikan penjelasan yang ringkas, mudah dipahami siswa, sertakan fakta kunci terkini, data referensi yang valid, dan relevansi untuk materi ajar di kelas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || 'Tidak ada data ditemukan.';
    // Extract grounding search metadata if present
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = searchChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Sumber Terkait',
        uri: chunk.web?.uri
      }));

    return res.json({
      answer: text,
      sources: webSources,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error search grounding:', error);
    return res.status(500).json({ error: error.message || 'Gagal mencari data dengan Google Search Grounding' });
  }
});

// API: Fast Explainer / Low-Latency Assistant for Whiteboard (gemini-2.5-flash)
app.post('/api/gemini/explain-topic', async (req, res) => {
  try {
    const { term, context = 'Papan Tulis Interaktif Kelas' } = req.body;

    const ai = getGeminiClient();
    const prompt = `Jelaskan istilah atau konsep berikut secara sangat ringkas, padat, dan analogi yang visual agar mudah digambar/dituliskan di papan tulis kelas:
"${term}"
Konteks: ${context}.
Batasi maksimal 3 kalimat + 1 analogi visual + 1 contoh nyata. Bahasa Indonesia yang ramah dan inspiratif.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    return res.json({
      explanation: response.text || 'Penjelasan tidak tersedia.',
      term
    });
  } catch (error: any) {
    console.error('Error explain topic:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses penjelasan' });
  }
});

// API: Audio Voice Transcription (Speech-to-Text for Teacher Narration to Board Text)
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const ai = getGeminiClient();
    const prompt = `Dengarkan rekaman suara guru ini dengan teliti.
1. Transkripsikan setiap kata yang diucapkan secara akurat ke teks bahasa Indonesia (atau campuran istilah asing yang tepat).
2. Buat ringkasan poin papan tulis (Bullet Points) dari instruksi atau penjelasan guru tersebut.

Format output JSON:
{
  "transcript": "Teks transkripsi lengkap...",
  "keyPoints": ["Poin ringkas 1", "Poin ringkas 2"],
  "boardAction": "write_note" | "highlight" | "formula" | "none",
  "boardText": "Teks yang disarankan langsung ditempel ke papan tulis"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error('Tidak dapat mentranskripsi audio');

    const result = JSON.parse(text);
    return res.json(result);
  } catch (error: any) {
    console.error('Error transcribe:', error);
    return res.status(500).json({ error: error.message || 'Gagal mentranskripsi suara' });
  }
});

// API: Multi-turn Chat AI Copilot for Teachers & Students
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages = [], systemRole = 'guru_pembina', currentBoardContext = '' } = req.body;

    const ai = getGeminiClient();

    let systemInstruction = `Anda adalah "Asisten Pintar BGTK Dinas Pendidikan Kota Metro", asisten AI pedagogis cerdas yang mendampingi guru dan siswa saat menggunakan Papan Tulis Interaktif di ruang kelas.
Karakter Anda:
- Ramah, sopan, mendidik, solutif, dan menguasai Kurikulum Merdeka.
- Memberikan penjelasan yang memantik rasa ingin tahu dan mendorong keterlibatan aktif siswa.
- Jika diminta menggambar atau menulis di papan, berikan struktur poin-poin yang rapi, rumus, atau visualisasi ASCII/diagram sederhana.
- Wilayah pengabdian: Kota Metro, Provinsi Lampung (Bumi Sai Wawai).`;

    if (systemRole === 'tutor_sains') {
      systemInstruction += `\nSpesialisasi Anda: Tutor Sains (Fisika, Biologi, Kimia) interaktif, fokus pada percobaan sederhana, rumus mudah dipahami, dan fenomena sehari-hari.`;
    } else if (systemRole === 'tutor_matematika') {
      systemInstruction += `\nSpesialisasi Anda: Tutor Matematika interaktif, menjabarkan langkah per langkah penyelesaian soal kalkulasi dan logika dengan rapi.`;
    } else if (systemRole === 'tutor_bahasa') {
      systemInstruction += `\nSpesialisasi Anda: Tutor Bahasa Indonesia, Bahasa Lampung, dan Bahasa Inggris komunikatif.`;
    }

    if (currentBoardContext) {
      systemInstruction += `\nKonteks materi yang sedang tampil di Papan Tulis saat ini: "${currentBoardContext}"`;
    }

    // Format chat contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({
      reply: response.text || 'Maaf, saya tidak dapat memproses jawaban saat ini.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error chat:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses pesan percakapan' });
  }
});

// API: Generate Instant Interactive Quiz for Whiteboard
app.post('/api/gemini/generate-quiz', async (req, res) => {
  try {
    const { topic, count = 3, gradeLevel = 'SMP' } = req.body;

    const ai = getGeminiClient();
    const prompt = `Buatkan ${count} soal kuis pilihan ganda interaktif untuk sesi tanya jawab langsung di papan tulis kelas.
Topik: ${topic}
Tingkat: ${gradeLevel}

Output format JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Teks soal yang jelas...",
      "options": ["A. Opsi 1", "B. Opsi 2", "C. Opsi 3", "D. Opsi 4"],
      "correctAnswer": 0,
      "explanation": "Penjelasan kunci jawaban",
      "points": 100
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      }
    });

    const text = response.text;
    if (!text) throw new Error('Tidak ada respon kuis dari model');
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error generate quiz:', error);
    return res.status(500).json({ error: error.message || 'Gagal membuat kuis' });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BGTK Kota Metro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
