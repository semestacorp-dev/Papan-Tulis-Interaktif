import React, { useState } from 'react';
import { 
  LogIn, 
  X, 
  GraduationCap, 
  School, 
  CheckCircle, 
  FolderOpen, 
  User, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin
}) => {
  const [role, setRole] = useState<UserRole>('teacher');
  const [schoolName, setSchoolName] = useState('SMP Negeri 1 Kota Metro');
  const [displayName, setDisplayName] = useState('Bapak/Ibu Guru BGTK');
  const [nip, setNip] = useState('19850612 201001 1 008');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Google Popup Login with Drive Access
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = (result as any)._tokenResponse || {};
      const oauthAccessToken = (result as any).credential?.accessToken || credential.oauthAccessToken;

      const profile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || displayName,
        photoURL: result.user.photoURL,
        role,
        schoolName,
        nip,
        accessToken: oauthAccessToken
      };

      onSuccessLogin(profile);
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in popup closed or restricted, falling back to local session profile:', err);
      // Seamlessly generate local profile with school identity
      const fallbackUser: UserProfile = {
        uid: `local-${Date.now()}`,
        email: 'guru.metro@disdikbud.metrokota.go.id',
        displayName: displayName,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role,
        schoolName,
        nip
      };
      onSuccessLogin(fallbackUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Guest / Quick Demo Login
  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const guestUser: UserProfile = {
      uid: `user-${Date.now()}`,
      email: `${displayName.toLowerCase().replace(/\s+/g, '')}@sekolah.metro.sch.id`,
      displayName: displayName.trim() || (role === 'teacher' ? 'Guru BGTK Kota Metro' : 'Siswa Kota Metro'),
      role,
      schoolName: schoolName.trim() || 'Dinas Pendidikan Kota Metro',
      nip: role === 'teacher' ? nip : undefined
    };
    onSuccessLogin(guestUser);
    onClose();
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="auth-modal-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-600/10 to-indigo-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-600/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Masuk Aplikasi BGTK Metro</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Papan Tulis Interaktif & Pembelajaran Real-time
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

        {/* Body Form */}
        <div className="p-6 space-y-5">
          {/* Primary Google Login Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Akun Google (Drive & Auth)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              atau masuk langsung
            </span>
          </div>

          {/* Quick Profile Form */}
          <form onSubmit={handleQuickLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Peran Pengguna
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    role === 'teacher'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Guru Pengajar
                </button>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    role === 'student'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Siswa di Kelas
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Contoh: Dra. Nurhayati, M.Pd"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Asal Sekolah / Satuan Pendidikan Kota Metro
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SMPN 1 Metro / SMAN 1 Metro"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80"
              />
            </div>

            {role === 'teacher' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  NIP / NUPTK (Opsional)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mulai Sesi Papan Tulis</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
