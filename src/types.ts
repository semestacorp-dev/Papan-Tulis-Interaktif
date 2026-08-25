export type UserRole = 'teacher' | 'student' | 'bgtk_admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  schoolName: string;
  nip?: string;
  accessToken?: string; // Google OAuth token for Google Drive
}

export type ToolType = 
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'laser'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'arrow'
  | 'line'
  | 'sticky'
  | 'formula';

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: ToolType;
  points?: Point[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fillColor?: string;
  authorId?: string;
  authorName?: string;
  createdAt: number;
  slideIndex?: number;
}

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  type: 'concept' | 'formula' | 'diagram' | 'activity' | 'quiz' | 'drive_slide';
  mainContent: string;
  bulletPoints?: string[];
  teacherNotes?: string;
  quickCheckQuestion?: string;
  imageUrl?: string;
  driveEmbedUrl?: string;
  backgroundColor?: string;
}

export interface LessonMaterial {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  competencyStandard?: string;
  summary: string;
  slides: SlideItem[];
  interactiveQuiz?: QuizQuestion[];
  homeworkOrProject?: string;
  driveFileId?: string;
  driveFileName?: string;
  driveMimeType?: string;
  authorName?: string;
  schoolName?: string;
  createdAt: number;
  updatedAt?: number;
  tags?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points?: number;
}

export interface QuizSubmission {
  studentName: string;
  studentId?: string;
  school?: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timestamp: number;
}

export interface ClassroomParticipant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  school?: string;
  lastActive: number;
  color: string;
  cursor?: { x: number; y: number };
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface VoiceTranscriptionResult {
  transcript: string;
  keyPoints: string[];
  boardAction: 'write_note' | 'highlight' | 'formula' | 'none';
  boardText: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  alternateLink?: string;
}

export interface ClassroomAnnouncement {
  id: string;
  text: string;
  alternateLink?: string;
  creationTime?: string;
}

export interface ClassroomCourseWork {
  id: string;
  title: string;
  description?: string;
  alternateLink?: string;
  creationTime?: string;
}
