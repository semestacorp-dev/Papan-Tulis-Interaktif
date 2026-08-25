import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  QrCode, 
  X, 
  Smartphone, 
  Laptop, 
  School,
  ExternalLink
} from 'lucide-react';
import { ClassroomParticipant } from '../types';

interface StudentConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  participants: ClassroomParticipant[];
  onJoinAsStudent: (studentName: string, school: string) => void;
}

export const StudentConnectModal: React.FC<StudentConnectModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  participants,
  onJoinAsStudent
}) => {
  const [copied, setCopied] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState('SMPN 1 Kota Metro');

  if (!isOpen) return null;

  const appUrl = window.location.href;
  const shareUrl = `${appUrl.split('?')[0]}?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    onJoinAsStudent(studentName.trim(), studentSchool);
    onClose();
  };

  return (
    <div id="student-connect-backdrop" className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="student-connect-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Hubungkan Siswa ke Papan Tulis Kelas</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Siswa dapat melihat materi dan menjawab kuis secara real-time dari gawai masing-masing
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

        {/* Room Code & Sharing Card */}
        <div className="p-6 space-y-5">
          {/* Big Room Code Display */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center shadow-lg border border-indigo-900/50 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
              Kode Kelas Papan Tulis
            </span>
            <div className="text-4xl font-black font-mono tracking-widest text-emerald-400">
              {roomCode}
            </div>
            <p className="text-xs text-slate-400">
              Siswa cukup memasukkan kode ini atau membuka tautan kelas
            </p>
          </div>

          {/* Copy Share Link */}
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 font-mono text-slate-600 dark:text-slate-300"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          {/* Student Join Form directly from this device */}
          <form onSubmit={handleJoin} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Masuk Sebagai Siswa di Sesi Ini:
            </h4>
            <div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nama Siswa (misal: Muhammad Rizky)"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <input
                type="text"
                value={studentSchool}
                onChange={(e) => setStudentSchool(e.target.value)}
                placeholder="Nama Sekolah di Kota Metro"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={!studentName.trim()}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all disabled:opacity-40"
            >
              Gabung Sebagai Peserta Siswa
            </button>
          </form>

          {/* Online Participants List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Peserta Terhubung ({participants.length})</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {participants.map((p) => (
                <div key={p.id} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
                    <span className="text-[10px] text-slate-400">({p.school || 'Kota Metro'})</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {p.role === 'teacher' ? 'Guru Pengajar' : 'Siswa'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
