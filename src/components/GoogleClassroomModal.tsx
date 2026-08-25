import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Users, 
  Megaphone, 
  FileText, 
  Share2, 
  LogIn, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  PlusCircle,
  GraduationCap,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { UserProfile, ClassroomCourse, ClassroomAnnouncement, ClassroomCourseWork, LessonMaterial } from '../types';
import { 
  fetchClassroomCourses, 
  fetchClassroomAnnouncements, 
  fetchClassroomCourseWork, 
  createClassroomAnnouncement, 
  createClassroomCourseWorkMaterial 
} from '../lib/classroomService';

interface GoogleClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  activeLesson: LessonMaterial | null;
  roomCode: string;
  onLoginGoogle: () => void;
}

export const GoogleClassroomModal: React.FC<GoogleClassroomModalProps> = ({
  isOpen,
  onClose,
  user,
  activeLesson,
  roomCode,
  onLoginGoogle
}) => {
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [courseWork, setCourseWork] = useState<ClassroomCourseWork[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'announcements' | 'coursework'>('announcements');
  const [announcementText, setAnnouncementText] = useState('Mari bergabung di Papan Tulis Interaktif BGTK Kota Metro untuk pembelajaran hari ini!');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchClassroomCourses(user?.accessToken);
      setCourses(fetched);
      if (fetched.length > 0) {
        setSelectedCourse(fetched[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourseDetails = async (courseId: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const [annList, cwList] = await Promise.all([
        fetchClassroomAnnouncements(courseId, user?.accessToken),
        fetchClassroomCourseWork(courseId, user?.accessToken)
      ]);
      setAnnouncements(annList);
      setCourseWork(cwList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen, user?.accessToken]);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseDetails(selectedCourse.id);
    }
  }, [selectedCourse]);

  if (!isOpen) return null;

  const currentRoomUrl = window.location.href;

  const handleShareSessionCode = async () => {
    if (!selectedCourse) return;
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      await createClassroomAnnouncement(
        selectedCourse.id,
        announcementText,
        currentRoomUrl,
        user?.accessToken
      );
      setStatusMessage({
        type: 'success',
        text: 'Sesi papan tulis interaktif berhasil dibagikan sebagai pengumuman di Google Classroom!'
      });
      // reload
      loadCourseDetails(selectedCourse.id);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal membagikan sesi ke Google Classroom.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishLessonMaterial = async () => {
    if (!selectedCourse || !activeLesson) return;
    
    const confirmPublish = window.confirm(
      `Apakah Anda yakin ingin menerbitkan materi "${activeLesson.title}" ke kelas "${selectedCourse.name}" Google Classroom?`
    );
    if (!confirmPublish) return;

    setIsPublishing(true);
    setStatusMessage(null);
    try {
      await createClassroomCourseWorkMaterial(
        selectedCourse.id,
        activeLesson,
        currentRoomUrl,
        user?.accessToken
      );
      setStatusMessage({
        type: 'success',
        text: `Materi "${activeLesson.title}" berhasil dipublikasikan sebagai bahan ajar di Google Classroom!`
      });
      loadCourseDetails(selectedCourse.id);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menerbitkan bahan ajar.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div id="classroom-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="classroom-modal-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Integrasi Google Classroom BGTK Metro</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan papan tulis interaktif dengan kelas digital Anda, bagikan room link, dan distribusikan bahan ajar real-time
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

        {/* Not Logged In View */}
        {!user?.accessToken ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-950/30">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4 border border-indigo-500/20">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Google Classroom Belum Terkoneksi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Untuk mengintegrasikan pengumuman, membagikan kode ruang, dan mendistribusikan materi ajar ke Google Classroom, harap sambungkan akun guru Anda terlebih dahulu.
            </p>
            <button
              onClick={onLoginGoogle}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 transition-all text-sm"
            >
              <LogIn className="w-5 h-5" />
              <span>Hubungkan Google Classroom</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Course List */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/40 dark:bg-slate-950/20">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daftar Kelas Aktif</span>
                <button 
                  onClick={loadCourses}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {courses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                        isSelected 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-900 dark:text-emerald-100' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <h4 className="font-bold text-sm line-clamp-1">{course.name}</h4>
                      {course.section && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{course.section}</p>
                      )}
                      {course.descriptionHeading && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{course.descriptionHeading}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Section: Course Detail & Sharing Features */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
              {selectedCourse ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Selected Course Header */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedCourse.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {selectedCourse.section && <span>{selectedCourse.section}</span>}
                        {selectedCourse.alternateLink && (
                          <a 
                            href={selectedCourse.alternateLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <span>Buka Classroom</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sharing / Publishing Control Panel */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Panel 1: Share Whiteboard Room */}
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                          <Share2 className="w-4 h-4 text-sky-500" />
                          Undang Siswa Gabung Papan Tulis
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Kirim pengumuman otomatis berisi link papan tulis aktif agar siswa dapat bergabung dan mencorat-coret secara real-time.
                        </p>
                        <textarea
                          value={announcementText}
                          onChange={(e) => setAnnouncementText(e.target.value)}
                          className="w-full mt-3 p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          rows={3}
                          placeholder="Tulis pesan pengumuman..."
                        />
                      </div>
                      <button
                        onClick={handleShareSessionCode}
                        disabled={isPublishing}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/10 transition-all"
                      >
                        {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
                        <span>Kirim Undangan Kelas</span>
                      </button>
                    </div>

                    {/* Panel 2: Publish Active Lesson */}
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                          <PlusCircle className="w-4 h-4 text-emerald-500" />
                          Terbitkan Bahan Ajar Aktif
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Publikasikan materi ajar interaktif atau slide presentasi Google Drive yang sedang terbuka saat ini sebagai tugas/bahan belajar resmi.
                        </p>
                        
                        {activeLesson ? (
                          <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                            <div className="p-2 rounded bg-emerald-500/10 text-emerald-500 mt-0.5">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{activeLesson.title}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">Subyek: {activeLesson.subject}</p>
                              <p className="text-[10px] text-slate-400">Total: {activeLesson.slides.length} Slide Pembelajaran</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 flex items-start gap-2 text-xs">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Tidak ada materi ajar yang aktif di papan tulis saat ini. Buka materi atau slide terlebih dahulu.</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handlePublishLessonMaterial}
                        disabled={isPublishing || !activeLesson}
                        className={`w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-white shadow-md transition-all ${
                          activeLesson 
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10' 
                            : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 shadow-none'
                        }`}
                      >
                        {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                        <span>Terbitkan sebagai Bahan Ajar</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Toast Banner inside modal */}
                  {statusMessage && (
                    <div className={`mx-5 mt-4 p-3 rounded-xl flex items-center gap-2 text-xs ${
                      statusMessage.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{statusMessage.text}</span>
                    </div>
                  )}

                  {/* Class Stream Feed Tabs (Announcements / Assignments) */}
                  <div className="flex-1 flex flex-col overflow-hidden px-5 py-4">
                    <div className="flex items-center border-b border-slate-100 dark:border-slate-800 gap-4 mb-3">
                      <button
                        onClick={() => setActiveTab('announcements')}
                        className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                          activeTab === 'announcements' 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Pengumuman Kelas ({announcements.length})</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('coursework')}
                        className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                          activeTab === 'coursework' 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tugas & Bahan Ajar ({courseWork.length})</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                          <span className="text-xs">Memuat linimasa Google Classroom...</span>
                        </div>
                      ) : activeTab === 'announcements' ? (
                        announcements.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            Tidak ada pengumuman kelas ditemukan.
                          </div>
                        ) : (
                          announcements.map((ann) => (
                            <div key={ann.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{ann.text}</p>
                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100/60 dark:border-slate-800/60 text-[10px] text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{ann.creationTime ? new Date(ann.creationTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}</span>
                                </div>
                                {ann.alternateLink && (
                                  <a href={ann.alternateLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                                    <span>Detail Post</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
                        )
                      ) : (
                        courseWork.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            Tidak ada tugas atau bahan ajar ditemukan.
                          </div>
                        ) : (
                          courseWork.map((cw) => (
                            <div key={cw.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{cw.title}</h4>
                                {cw.description && (
                                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{cw.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{cw.creationTime ? new Date(cw.creationTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}</span>
                                  </div>
                                  {cw.alternateLink && (
                                    <a href={cw.alternateLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 hover:underline">
                                      <span>Buka Tugas</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Tidak ada kelas Google Classroom ditemukan.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Terhubung ke Layanan Google Classroom API - Dinas Pendidikan Kota Metro</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
