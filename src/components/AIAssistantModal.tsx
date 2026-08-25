import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Zap, 
  Send, 
  X, 
  Check, 
  ExternalLink, 
  Loader2, 
  Layers, 
  Plus, 
  HelpCircle,
  Brain,
  GraduationCap
} from 'lucide-react';
import { LessonMaterial, SlideItem, GroundingSource } from '../types';
import { generateMateriAI, searchGroundingAI, explainTopicFast, chatWithCopilot } from '../lib/geminiApi';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlide: SlideItem | null;
  onApplyNewLesson: (lesson: LessonMaterial) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentSlide,
  onApplyNewLesson
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'search' | 'explainer' | 'chat'>('generator');

  // Generator State
  const [topicInput, setTopicInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('IPA (Fisika)');
  const [gradeInput, setGradeInput] = useState('SMP Kelas VIII');
  const [instructionsInput, setInstructionsInput] = useState('Sertakan studi kasus relevan dengan Kota Metro Lampung');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMaterial, setGeneratedMaterial] = useState<LessonMaterial | null>(null);

  // Search Grounding State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ answer: string; sources: GroundingSource[] } | null>(null);

  // Explainer State
  const [explainTerm, setExplainTerm] = useState(currentSlide ? currentSlide.title : '');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainResult, setExplainResult] = useState<string | null>(null);

  // Chat Copilot State
  const [chatRole, setChatRole] = useState<'guru_pembina' | 'tutor_sains' | 'tutor_matematika' | 'tutor_bahasa'>('guru_pembina');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Halo Bapak/Ibu Guru dan siswa Kota Metro! Saya Asisten AI BGTK Dinas Pendidikan. Ada topik pembelajaran atau rumus yang ingin kita bahas bersama di papan tulis interaktif hari ini?'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Lesson Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsGenerating(true);
    try {
      const lesson = await generateMateriAI({
        topic: topicInput,
        subject: subjectInput,
        gradeLevel: gradeInput,
        additionalInstructions: instructionsInput
      });
      setGeneratedMaterial(lesson);
    } catch (err: any) {
      alert(`Gagal membuat materi: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Search Grounding
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await searchGroundingAI(searchQuery, 'Pendidikan Kota Metro Lampung Kurikulum Merdeka');
      setSearchResult(result);
    } catch (err: any) {
      alert(`Gagal mencari data: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Fast Explainer
  const handleExplain = async () => {
    if (!explainTerm.trim()) return;
    setIsExplaining(true);
    try {
      const res = await explainTopicFast(explainTerm, currentSlide?.title);
      setExplainResult(res.explanation);
    } catch (err: any) {
      alert(`Gagal menjelaskan konsep: ${err.message}`);
    } finally {
      setIsExplaining(false);
    }
  };

  // Handle Chat Copilot
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await chatWithCopilot({
        messages: newMessages,
        systemRole: chatRole,
        currentBoardContext: currentSlide ? `${currentSlide.title}: ${currentSlide.mainContent}` : ''
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Maaf, terjadi kendala teknis: ${err.message}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div id="ai-assistant-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="ai-assistant-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-900/10 via-sky-900/10 to-indigo-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Asisten Cerdas BGTK Dinas Pendidikan
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold border border-purple-500/30">
                  Gemini AI
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyusun materi pembelajaran interaktif, pencarian fakta tervalidasi Google Search, dan asisten pedagogis kelas
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

        {/* Feature Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1 gap-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold transition-all ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Pembuat Materi Slide</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Grounding</span>
          </button>

          <button
            onClick={() => setActiveTab('explainer')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold transition-all ${
              activeTab === 'explainer'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Kupas Konsep Cepat</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Co-Pilot</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: AI LESSON GENERATOR */}
          {activeTab === 'generator' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <form onSubmit={handleGenerate} className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Topik Materi Pembelajaran
                  </label>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Contoh: Hukum Archimedes & Penerapan Kapal Selam di Lampung"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                      <option value="IPA (Fisika / Biologi / Kimia)">IPA (Sains)</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Bahasa Inggris">Bahasa Inggris</option>
                      <option value="IPS & Sejarah Lokal">IPS / Sejarah Kota Metro</option>
                      <option value="Pendidikan Pancasila & PPKn">Pendidikan Pancasila</option>
                      <option value="Seni Budaya & Prakarya">Seni Budaya Lampung</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Tingkat / Fase Kelas
                    </label>
                    <select
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    >
                      <option value="SD Kelas IV-VI (Fase B/C)">SD Kelas 4 - 6</option>
                      <option value="SMP Kelas VII-IX (Fase D)">SMP Kelas 7 - 9</option>
                      <option value="SMA/SMK Kelas X-XII (Fase E/F)">SMA / SMK Kelas 10 - 12</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Instruksi Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={instructionsInput}
                    onChange={(e) => setInstructionsInput(e.target.value)}
                    placeholder="Contoh: Tambahkan analogi visual untuk papan tulis dan soal kuis 2 butir"
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !topicInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menyusun Slide Pembelajaran Interaktif...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Buat Materi Slide untuk Papan Tulis</span>
                    </>
                  )}
                </button>
              </form>

              {/* Generated Material Preview */}
              {generatedMaterial && (
                <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Materi Siap Pakai
                      </span>
                      <h3 className="text-lg font-bold">{generatedMaterial.title}</h3>
                    </div>
                    <button
                      onClick={() => {
                        onApplyNewLesson(generatedMaterial);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Tampilkan di Papan Tulis Sekarang</span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300">{generatedMaterial.summary}</p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Slide ({generatedMaterial.slides.length} Slide):</h4>
                    {generatedMaterial.slides.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-bold text-purple-600 dark:text-purple-400 mr-2">Slide {s.slideNumber}:</span>
                        <span className="font-semibold">{s.title}</span>
                        <p className="text-slate-500 mt-1 line-clamp-1">{s.mainContent}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE SEARCH GROUNDING */}
          {activeTab === 'search' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cari Fakta Sains, Kurikulum, & Informasi Terkini (Google Search Grounding)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Contoh: Penemuan terbaru energi terbarukan 2026 atau Profil Pendidikan Kota Metro"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Cari</span>
                  </button>
                </div>
              </form>

              {searchResult && (
                <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 space-y-4">
                  <h3 className="text-sm font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Hasil Terverifikasi Google Search:
                  </h3>
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
                    {searchResult.answer}
                  </div>

                  {searchResult.sources && searchResult.sources.length > 0 && (
                    <div className="pt-3 border-t border-sky-200/50 dark:border-sky-900/50">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sumber Referensi:</p>
                      <div className="flex flex-wrap gap-2">
                        {searchResult.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAST EXPLAINER */}
          {activeTab === 'explainer' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Istilah / Konsep untuk Dijelaskan Cepat di Papan Tulis
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={explainTerm}
                    onChange={(e) => setExplainTerm(e.target.value)}
                    placeholder="Contoh: Fotosintesis, Teorema Pythagoras, Efek Doppler, Piil Pesenggiri"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleExplain}
                    disabled={isExplaining || !explainTerm.trim()}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>Kupas Cepat</span>
                  </button>
                </div>
              </div>

              {explainResult && (
                <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Analogi & Penjelasan Papan Tulis:
                  </span>
                  <p className="text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                    {explainResult}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHAT COPILOT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[420px] max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Persona Selector Bar */}
              <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" />
                  Peran Tutor:
                </span>
                <select
                  value={chatRole}
                  onChange={(e) => setChatRole(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                >
                  <option value="guru_pembina">Guru Pembina BGTK Metro</option>
                  <option value="tutor_sains">Tutor Interaktif Sains (IPA)</option>
                  <option value="tutor_matematika">Tutor Matematika & Logika</option>
                  <option value="tutor_bahasa">Tutor Bahasa & Budaya Lampung</option>
                </select>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Sedang mengetik penjelasan...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tanyakan rumus, ide papan tulis, atau pertanyaan kelas..."
                  className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
