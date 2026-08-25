import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Search, 
  FileText, 
  Presentation, 
  FileCheck, 
  ExternalLink, 
  Download, 
  X, 
  RefreshCw, 
  CheckCircle,
  LogIn,
  Layers,
  Sparkles
} from 'lucide-react';
import { DriveFileItem, LessonMaterial, UserProfile } from '../types';
import { fetchGoogleDriveFiles, convertDriveFileToLesson, SAMPLE_BGTK_DRIVE_FILES } from '../lib/driveService';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSelectDriveLesson: (lesson: LessonMaterial) => void;
  onLoginGoogle: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onSelectDriveLesson,
  onLoginGoogle
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);

  const loadFiles = async (query = '') => {
    setIsLoading(true);
    try {
      const results = await fetchGoogleDriveFiles(user?.accessToken, query);
      setFiles(results);
    } catch (err) {
      console.error(err);
      setFiles(SAMPLE_BGTK_DRIVE_FILES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles(searchQuery);
    }
  }, [isOpen, user?.accessToken]);

  if (!isOpen) return null;

  const handleApplyToBoard = (file: DriveFileItem) => {
    const lesson = convertDriveFileToLesson(file);
    onSelectDriveLesson(lesson);
    onClose();
  };

  const handleOpenGooglePicker = () => {
    if (!user?.accessToken) return;
    
    const gapi = (window as any).gapi;
    if (!gapi) {
      alert("gapi library belum sepenuhnya dimuat. Silakan tunggu beberapa saat.");
      return;
    }

    gapi.load('picker', {
      callback: () => {
        try {
          const google = (window as any).google;
          const pickerOrigin =
            window.location.ancestorOrigins &&
            window.location.ancestorOrigins.length > 0
              ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
              : window.location.origin;

          const picker = new google.picker.PickerBuilder()
            .addView(google.picker.ViewId.DOCS)
            .setOAuthToken(user.accessToken)
            .setCallback((data: any) => {
              if (data.action === google.picker.Action.PICKED) {
                const docFile = data.docs[0];
                const pickedFile: DriveFileItem = {
                  id: docFile.id,
                  name: docFile.name,
                  mimeType: docFile.mimeType,
                  webViewLink: docFile.url,
                  size: docFile.sizeBytes ? `${(docFile.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : undefined
                };
                handleApplyToBoard(pickedFile);
              }
            })
            .setOrigin(pickerOrigin)
            .build();
          picker.setVisible(true);
        } catch (err) {
          console.error("Error creating Google Picker:", err);
        }
      }
    });
  };

  return (
    <div id="drive-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="drive-modal-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-500/20">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Integrasi Google Drive Pembelajaran</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih presentasi Google Slides, PDF materi ajar, atau Modul RPP BGTK Kota Metro untuk dimuat ke Papan Tulis Interaktif
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

        {/* Search & Account Status Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadFiles(e.target.value);
              }}
              placeholder="Cari file materi pembelajaran, presentasi, atau modul di Drive..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadFiles(searchQuery)}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Segarkan Berkas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {user?.accessToken ? (
              <button
                onClick={handleOpenGooglePicker}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Pilih lewat Google Picker 🚀</span>
              </button>
            ) : (
              <button
                onClick={onLoginGoogle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Hubungkan Google Drive Guru</span>
              </button>
            )}
          </div>
        </div>

        {/* File List / Grid View */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/40">
          {isLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-sm">Memuat materi ajar dari Google Drive...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Tidak ada file Google Drive ditemukan</p>
              <p className="text-xs mt-1">Coba kata kunci lain atau unggah slide pembelajaran ke Google Drive</p>
            </div>
          ) : (
            files.map((file) => {
              const isSelected = selectedFile?.id === file.id;
              const isGSlides = file.mimeType.includes('presentation');
              const isPdf = file.mimeType.includes('pdf');

              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 ring-2 ring-sky-400' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${
                      isGSlides 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                        : isPdf 
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                        : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    }`}>
                      {isGSlides ? <Presentation className="w-6 h-6" /> : isPdf ? <FileText className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 text-slate-900 dark:text-slate-100">
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                          {isGSlides ? 'Google Slides' : isPdf ? 'Dokumen PDF' : 'Google Drive'}
                        </span>
                        {file.size && <span>{file.size}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this file */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Siap Dipresentasikan
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyToBoard(file);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tampilkan di Papan</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Terhubung ke Repositori Bahan Ajar BGTK Kota Metro & Google Drive</span>
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
