import React from 'react';
import { 
  Presentation, 
  Sparkles, 
  FolderOpen, 
  HelpCircle, 
  Mic, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Users, 
  Share2, 
  LogIn, 
  LogOut,
  GraduationCap,
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: 'board' | 'library' | 'drive' | 'quiz' | 'ai';
  setActiveTab: (tab: 'board' | 'library' | 'drive' | 'quiz' | 'ai') => void;
  roomCode: string;
  onOpenDrive: () => void;
  onOpenAI: () => void;
  onOpenVoice: () => void;
  onOpenQuiz: () => void;
  onOpenShare: () => void;
  onLogin: () => void;
  onLogout: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onlineParticipantsCount: number;
  onOpenClassroom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  roomCode,
  onOpenDrive,
  onOpenAI,
  onOpenVoice,
  onOpenQuiz,
  onOpenShare,
  onLogin,
  onLogout,
  isFullscreen,
  onToggleFullscreen,
  onlineParticipantsCount,
  onOpenClassroom
}) => {
  return (
    <header id="main-header" className="bg-slate-900 text-white border-b border-slate-800 px-3 py-2.5 sm:px-5 flex items-center justify-between flex-wrap gap-2 select-none shadow-md z-30">
      {/* Brand & Kota Metro Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
              BGTK Kota Metro
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
                Papan Interaktif
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Dinas Pendidikan dan Kebudayaan Kota Metro • Bumi Sai Wawai
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs sm:text-sm">
        <button
          id="nav-tab-board"
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'board'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Papan Tulis</span>
        </button>

        <button
          id="nav-tab-drive"
          onClick={onOpenDrive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
          title="Buka Berkas dari Google Drive"
        >
          <FolderOpen className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Google Drive</span>
        </button>

        <button
          id="nav-tab-library"
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'library'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Materi Metro</span>
        </button>

        <button
          id="nav-btn-ai-assistant"
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all"
        >
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-semibold">AI Asisten</span>
        </button>

        <button
          id="nav-btn-voice-stt"
          onClick={onOpenVoice}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-rose-300 hover:text-white hover:bg-rose-600/30 transition-all"
          title="Transkripsi Suara Guru ke Papan Tulis"
        >
          <Mic className="w-4 h-4 text-rose-400" />
          <span className="hidden lg:inline">Suara Guru</span>
        </button>

        <button
          id="nav-btn-quiz"
          onClick={onOpenQuiz}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-amber-300 hover:text-white hover:bg-amber-600/30 transition-all"
          title="Kuis Interaktif Langsung Siswa"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="hidden lg:inline">Kuis Interaktif</span>
        </button>

        <button
          id="nav-btn-classroom"
          onClick={onOpenClassroom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-emerald-300 hover:text-white hover:bg-emerald-600/30 transition-all"
          title="Integrasi Google Classroom"
        >
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>Classroom</span>
        </button>
      </nav>

      {/* Right Controls: Room Code, Participants, User Auth, Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Room Code Badge */}
        <button
          id="btn-room-share"
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs transition-colors"
          title="Bagikan Kode Kelas ke Siswa"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="font-mono font-bold tracking-wider">{roomCode}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
        </button>

        {/* Live Participants Indicator */}
        <div 
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs"
          title={`${onlineParticipantsCount} Siswa & Guru Aktif di Kelas`}
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>{onlineParticipantsCount}</span>
        </div>

        {/* Fullscreen Button for Classroom Big Screen */}
        <button
          id="btn-toggle-fullscreen"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh Papan Tulis'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* User Account / Google Login */}
        {user ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex items-center gap-2 bg-slate-800 py-1 px-2 rounded-lg border border-slate-700">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Guru'} 
                  className="w-6 h-6 rounded-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  {(user.displayName || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden xl:block text-left text-xs">
                <p className="font-medium text-slate-200 truncate max-w-[120px]">{user.displayName || 'Guru BGTK'}</p>
                <p className="text-[10px] text-slate-400">{user.schoolName}</p>
              </div>
            </div>
            <button
              id="btn-logout"
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="btn-google-login"
            onClick={onLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs shadow-sm transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk Guru / Siswa</span>
          </button>
        )}
      </div>
    </header>
  );
};
