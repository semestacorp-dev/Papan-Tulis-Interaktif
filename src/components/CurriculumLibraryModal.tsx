import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  CheckCircle, 
  GraduationCap, 
  Tag, 
  X, 
  Sparkles,
  School
} from 'lucide-react';
import { LessonMaterial } from '../types';
import { DEFAULT_KOTA_METRO_MATERIALS } from '../lib/defaultCurriculum';

interface CurriculumLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (lesson: LessonMaterial) => void;
}

export const CurriculumLibraryModal: React.FC<CurriculumLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectLesson
}) => {
  const [materials, setMaterials] = useState<LessonMaterial[]>(DEFAULT_KOTA_METRO_MATERIALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  if (!isOpen) return null;

  const subjects = ['all', 'IPA (Ilmu Pengetahuan Alam)', 'Matematika', 'IPS / Sejarah & Muatan Lokal'];

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchSubject = selectedSubject === 'all' || m.subject.includes(selectedSubject) || selectedSubject.includes(m.subject);

    return matchSearch && matchSubject;
  });

  return (
    <div id="library-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="library-modal-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bank Materi Pembelajaran BGTK Kota Metro</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Koleksi materi resmi Kurikulum Merdeka dan muatan lokal Kota Metro siap tayang di papan tulis
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

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi pembelajaran, kurikulum, topik..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === sub
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sub === 'all' ? 'Semua Mata Pelajaran' : sub.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Material Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/40">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {mat.subject}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {mat.gradeLevel}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-2">
                  {mat.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {mat.summary}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{mat.schoolName || 'BGTK Disdikbud Kota Metro'}</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {mat.slides.length} Slide Interaktif
                </span>

                <button
                  onClick={() => {
                    onSelectLesson(mat);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>Buka di Papan Tulis</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
