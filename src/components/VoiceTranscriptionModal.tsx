import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Check, 
  Plus, 
  StickyNote, 
  Loader2,
  Volume2
} from 'lucide-react';
import { AudioRecorder } from '../lib/audioService';
import { transcribeVoiceAudio } from '../lib/geminiApi';
import { VoiceTranscriptionResult, WhiteboardElement } from '../types';

interface VoiceTranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStickyNote: (text: string) => void;
}

export const VoiceTranscriptionModal: React.FC<VoiceTranscriptionModalProps> = ({
  isOpen,
  onClose,
  onAddStickyNote
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<VoiceTranscriptionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    setErrorMessage(null);
    try {
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      setErrorMessage('Akses mikrofon ditolak atau tidak didukung di perangkat ini.');
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const audioData = await recorderRef.current.stop();
      const result = await transcribeVoiceAudio(audioData.base64, audioData.mimeType);
      setTranscriptionResult(result);
    } catch (err: any) {
      setErrorMessage(`Gagal memproses suara: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToBoard = () => {
    if (!transcriptionResult) return;
    const noteText = transcriptionResult.boardText || transcriptionResult.transcript;
    onAddStickyNote(`Catatan Guru:\n${noteText}`);
    onClose();
  };

  return (
    <div id="voice-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="voice-modal-card" 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Transkripsi Suara Guru ke Papan Tulis</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ucapkan materi atau instruksi, Gemini AI akan merangkum dan menuliskannya di papan
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

        {/* Recording Visualizer Body */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-5">
          {/* Big Record Button */}
          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
            )}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl transition-transform transform active:scale-95 ${
                isRecording 
                  ? 'bg-rose-600 text-white ring-4 ring-rose-400 animate-pulse' 
                  : 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white hover:opacity-95'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                {isRecording ? 'Berhenti' : 'Bicara'}
              </span>
            </button>
          </div>

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isRecording 
              ? 'Mendengarkan suara guru... Tekan tombol lagi setelah selesai.' 
              : isProcessing 
              ? 'Gemini AI sedang mentranskripsikan suara Anda...' 
              : 'Sentuh mikrofon di atas dan jelaskan poin materi untuk siswa.'}
          </p>

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses intisari ucapan guru...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Transcription Results Preview */}
          {transcriptionResult && (
            <div className="w-full text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Transkripsi Lengkap:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 italic">
                  "{transcriptionResult.transcript}"
                </p>
              </div>

              {transcriptionResult.keyPoints && transcriptionResult.keyPoints.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Poin Kunci Papan Tulis:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {transcriptionResult.keyPoints.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-1.5 font-medium">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleApplyToBoard}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <StickyNote className="w-4 h-4" />
                <span>Tempelkan Catatan ke Papan Tulis</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
