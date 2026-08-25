/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WhiteboardCanvas } from './components/WhiteboardCanvas';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { VoiceTranscriptionModal } from './components/VoiceTranscriptionModal';
import { InteractiveQuizModal } from './components/InteractiveQuizModal';
import { StudentConnectModal } from './components/StudentConnectModal';
import { CurriculumLibraryModal } from './components/CurriculumLibraryModal';
import { AuthModal } from './components/AuthModal';
import { GoogleClassroomModal } from './components/GoogleClassroomModal';

import { 
  LessonMaterial, 
  SlideItem, 
  UserProfile, 
  WhiteboardElement, 
  ClassroomParticipant 
} from './types';
import { DEFAULT_KOTA_METRO_MATERIALS } from './lib/defaultCurriculum';
import { auth, onAuthStateChanged, signOut, db, doc, setDoc, onSnapshot } from './lib/firebase';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'board' | 'library' | 'drive' | 'quiz' | 'ai'>('board');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active Lesson & Slides
  const [currentLesson, setCurrentLesson] = useState<LessonMaterial>(DEFAULT_KOTA_METRO_MATERIALS[0]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Whiteboard Canvas Elements & Real-Time Sync
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [roomCode, setRoomCode] = useState('METRO-8A');

  // Active Classroom Participants
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([
    {
      id: 'p1',
      name: 'Bapak Ahmad S.Pd (Guru Pengajar)',
      role: 'teacher',
      school: 'SMPN 1 Kota Metro',
      lastActive: Date.now(),
      color: '#0284c7'
    },
    {
      id: 'p2',
      name: 'Aditia Pratama (Siswa)',
      role: 'student',
      school: 'SMPN 1 Kota Metro',
      lastActive: Date.now(),
      color: '#10b981'
    },
    {
      id: 'p3',
      name: 'Siti Rahmawati (Siswa)',
      role: 'student',
      school: 'SMPN 1 Kota Metro',
      lastActive: Date.now(),
      color: '#f59e0b'
    }
  ]);

  // User State (Auth)
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'guru-metro-1',
    email: 'guru.ipa@disdikbud.metrokota.go.id',
    displayName: 'Ahmad Fauzi, S.Pd',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'teacher',
    schoolName: 'SMP Negeri 1 Kota Metro',
    nip: '19880415 201402 1 004'
  });

  // Modal States
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);

  // Track room from URL query param if any
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomCode(roomParam.toUpperCase());
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => ({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || prev?.displayName || 'Guru BGTK Kota Metro',
          photoURL: firebaseUser.photoURL,
          role: prev?.role || 'teacher',
          schoolName: prev?.schoolName || 'Dinas Pendidikan Kota Metro',
          nip: prev?.nip
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to live whiteboard strokes for this room in Firestore
  useEffect(() => {
    try {
      const sessionDocRef = doc(db, 'whiteboard_sessions', roomCode);
      const unsubscribe = onSnapshot(sessionDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.elements)) {
            setElements(data.elements);
          }
          if (data && data.activeLesson) {
            setCurrentLesson(data.activeLesson);
            if (typeof data.currentSlideIndex === 'number') {
              setCurrentSlideIndex(data.currentSlideIndex);
            }
          }
        }
      }, (err) => {
        console.warn('Firestore snapshot listener warning (using local state):', err);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore setup note:', err);
    }
  }, [roomCode]);

  // Sync whiteboard element changes to Firestore
  const handleElementsChange = async (newElements: WhiteboardElement[]) => {
    setElements(newElements);
    try {
      const sessionDocRef = doc(db, 'whiteboard_sessions', roomCode);
      await setDoc(sessionDocRef, {
        elements: newElements,
        roomCode,
        currentSlideIndex,
        activeLesson: currentLesson,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      // Local state fallback if offline
    }
  };

  // Switch Slide
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      const nextIdx = currentSlideIndex - 1;
      setCurrentSlideIndex(nextIdx);
      // Persist slide change
      try {
        setDoc(doc(db, 'whiteboard_sessions', roomCode), { currentSlideIndex: nextIdx }, { merge: true });
      } catch (e) {}
    }
  };

  const handleNextSlide = () => {
    if (currentLesson && currentSlideIndex < currentLesson.slides.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIdx);
      try {
        setDoc(doc(db, 'whiteboard_sessions', roomCode), { currentSlideIndex: nextIdx }, { merge: true });
      } catch (e) {}
    }
  };

  // Fullscreen Handler for Classroom IFP / Smart TV
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Apply new lesson (from Drive, AI, or Library)
  const handleApplyLesson = (lesson: LessonMaterial) => {
    setCurrentLesson(lesson);
    setCurrentSlideIndex(0);
    setActiveTab('board');

    try {
      setDoc(doc(db, 'whiteboard_sessions', roomCode), {
        activeLesson: lesson,
        currentSlideIndex: 0,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {}
  };

  // Add Sticky Note from Voice Transcription
  const handleAddStickyFromVoice = (text: string) => {
    const newSticky: WhiteboardElement = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      x: 120,
      y: 120,
      width: 220,
      height: 160,
      color: '#1e293b',
      strokeWidth: 1,
      text: text,
      createdAt: Date.now(),
      slideIndex: currentSlideIndex
    };
    const updated = [...elements, newSticky];
    handleElementsChange(updated);
  };

  // Join as student
  const handleJoinAsStudent = (name: string, school: string) => {
    const studentUser: UserProfile = {
      uid: `student-${Date.now()}`,
      email: null,
      displayName: name,
      role: 'student',
      schoolName: school
    };
    setUser(studentUser);

    const newParticipant: ClassroomParticipant = {
      id: `p-${Date.now()}`,
      name,
      role: 'student',
      school,
      lastActive: Date.now(),
      color: '#ec4899'
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    setUser(null);
  };

  const currentSlide: SlideItem | null = currentLesson?.slides?.[currentSlideIndex] || null;

  return (
    <div id="bgtk-metro-app" className="flex flex-col h-screen w-screen bg-slate-950 font-sans antialiased overflow-hidden select-none">
      {/* Main Top Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'library') {
            setActiveTab('library');
          } else if (tab === 'drive') {
            setIsDriveOpen(true);
          } else {
            setActiveTab('board');
          }
        }}
        roomCode={roomCode}
        onOpenDrive={() => setIsDriveOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onLogin={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onlineParticipantsCount={participants.length}
        onOpenClassroom={() => setIsClassroomOpen(true)}
      />

      {/* Main View Area */}
      <main id="app-main-viewport" className="flex-1 relative flex flex-col overflow-hidden">
        {/* Interactive Whiteboard Canvas Screen */}
        <WhiteboardCanvas
          currentSlide={currentSlide}
          currentSlideIndex={currentSlideIndex}
          totalSlides={currentLesson?.slides?.length || 1}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
          user={user}
          roomCode={roomCode}
          onOpenAIForCurrentSlide={(slide) => {
            setIsAIOpen(true);
          }}
          onOpenDrive={() => setIsDriveOpen(true)}
          onStartQuiz={() => setIsQuizOpen(true)}
          onElementsChange={handleElementsChange}
          syncedElements={elements}
        />
      </main>

      {/* MODALS */}
      {/* 1. Google Drive Materials Picker */}
      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        user={user}
        onSelectDriveLesson={handleApplyLesson}
        onLoginGoogle={() => {
          setIsDriveOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* 2. AI Assistant (Materi Generator, Search Grounding, Fast Explainer, Chat Copilot) */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        currentSlide={currentSlide}
        onApplyNewLesson={handleApplyLesson}
      />

      {/* 3. Voice Transcription to Whiteboard */}
      <VoiceTranscriptionModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onAddStickyNote={handleAddStickyFromVoice}
      />

      {/* 4. Live Interactive Quiz Modal */}
      <InteractiveQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        currentSlide={currentSlide}
        defaultQuestions={currentLesson?.interactiveQuiz}
      />

      {/* 5. Student Classroom Share / Join */}
      <StudentConnectModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        roomCode={roomCode}
        participants={participants}
        onJoinAsStudent={handleJoinAsStudent}
      />

      {/* 6. Bank Materi Pembelajaran Kurikulum Merdeka Kota Metro */}
      <CurriculumLibraryModal
        isOpen={activeTab === 'library'}
        onClose={() => setActiveTab('board')}
        onSelectLesson={handleApplyLesson}
      />

      {/* 7. Auth Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={(newUser) => setUser(newUser)}
      />

      {/* 8. Google Classroom Integration Modal */}
      <GoogleClassroomModal
        isOpen={isClassroomOpen}
        onClose={() => setIsClassroomOpen(false)}
        user={user}
        activeLesson={currentLesson}
        roomCode={roomCode}
        onLoginGoogle={() => {
          setIsClassroomOpen(false);
          setIsAuthOpen(true);
        }}
      />
    </div>
  );
}
