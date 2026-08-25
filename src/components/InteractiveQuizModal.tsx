import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  X, 
  Award, 
  RotateCcw, 
  Loader2,
  Clock,
  ChevronRight,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, SlideItem } from '../types';
import { generateInteractiveQuizAI } from '../lib/geminiApi';

interface InteractiveQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlide: SlideItem | null;
  defaultQuestions?: QuizQuestion[];
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  isOpen,
  onClose,
  currentSlide,
  defaultQuestions
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (defaultQuestions && defaultQuestions.length > 0) {
      setQuestions(defaultQuestions);
    } else if (currentSlide) {
      // Create initial questions from current slide topic
      setQuestions([
        {
          id: 'slide-q1',
          question: `Berdasarkan materi "${currentSlide.title}", manakah kesimpulan yang paling tepat?`,
          options: [
            currentSlide.bulletPoints?.[0] || 'Konsep dasar yang dibahas di slide',
            'Pernyataan yang berlawanan dengan teori',
            'Fakta sekunder yang tidak berhubungan',
            'Hipotesis yang belum teruji'
          ],
          correctAnswer: 0,
          explanation: `Jawaban tepat karena sesuai dengan pokok bahasan: ${currentSlide.mainContent}`
        }
      ]);
    }
  }, [isOpen, defaultQuestions, currentSlide]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 100);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback if canvas is unavailable
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleGenerateAIQuiz = async (topic: string) => {
    setIsGenerating(true);
    try {
      const generated = await generateInteractiveQuizAI(topic || currentSlide?.title || 'Sains Kota Metro', 3);
      if (generated.length > 0) {
        setQuestions(generated);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setQuizFinished(false);
      }
    } catch (err: any) {
      alert(`Gagal membuat kuis: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div id="quiz-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="quiz-modal-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-500/10 dark:bg-amber-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold">Kuis Interaktif Papan Tulis Kelas</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tanya jawab langsung di depan kelas untuk menguji pemahaman siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Quick Quiz Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder={`Topik kuis baru (misal: ${currentSlide?.title || 'Fisika'})`}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <button
            onClick={() => handleGenerateAIQuiz(customTopic)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Buat Soal AI</span>
          </button>
        </div>

        {/* Quiz Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {quizFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto ring-4 ring-amber-500/30">
                <Award className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Kuis Selesai!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Total Skor Kelas: <span className="font-bold text-amber-500 text-lg">{score} Poin</span>
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Kuis</span>
                </button>
                <button
                  onClick={() => handleGenerateAIQuiz(currentSlide?.title || 'Sains')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Soal Baru</span>
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="space-y-6">
              {/* Question Progress & Score */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Soal {currentIndex + 1} dari {questions.length}</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  Skor: {score} Poin
                </span>
              </div>

              {/* Question Title */}
              <h3 className="text-base sm:text-lg font-bold leading-snug text-slate-900 dark:text-slate-100">
                {currentQ.question}
              </h3>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let btnClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400';
                  
                  if (isAnswered) {
                    if (idx === currentQ.correctAnswer) {
                      btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500';
                    } else if (selectedOption === idx) {
                      btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500';
                    } else {
                      btnClass = 'opacity-50 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-xl border text-left font-medium text-xs sm:text-sm flex items-center justify-between transition-all ${btnClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && idx === currentQ.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      )}
                      {isAnswered && selectedOption === idx && idx !== currentQ.correctAnswer && (
                        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon answer */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Pembahasan Guru:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {currentQ.explanation || 'Jawaban telah dikonfirmasi sesuai materi.'}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <span>{currentIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Tidak ada soal aktif.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
