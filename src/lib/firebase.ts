import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc as fSetDoc, 
  getDoc as fGetDoc, 
  getDocs as fGetDocs, 
  onSnapshot as fOnSnapshot, 
  updateDoc as fUpdateDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Firestore,
  getDocFromServer,
  DocumentReference,
  DocumentData,
  SetOptions
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Provider with Google Drive & Google Classroom scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.announcements');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.courseworkmaterials');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.me');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore with specific database ID if configured
const databaseId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-bgtkdinaspendidi-46d83f31-5a08-4648-a4fb-2cae7ded7148';
let dbInstance: Firestore;

try {
  dbInstance = getFirestore(app, databaseId);
} catch (e) {
  console.warn('Could not initialize with custom database ID, falling back to default db:', e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;

// Error Handlers and Operations mapping according to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Wrapped safe Firestore methods
export async function setDoc<AppModelType, DbModelType extends DocumentData>(
  reference: DocumentReference<AppModelType, DbModelType>,
  data: any,
  options?: SetOptions
) {
  try {
    return await fSetDoc(reference, data, options as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, reference.path);
  }
}

export async function getDoc(reference: DocumentReference<any, any>) {
  try {
    return await fGetDoc(reference);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, reference.path);
  }
}

export async function getDocs(q: any) {
  try {
    return await fGetDocs(q);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, q.path || 'query');
  }
}

export async function updateDoc(reference: DocumentReference<any, any>, data: any) {
  try {
    return await fUpdateDoc(reference, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, reference.path);
  }
}

export function onSnapshot(
  ref: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
) {
  return fOnSnapshot(
    ref,
    onNext,
    (error) => {
      if (onError) {
        try {
          onError(error);
        } catch (e) {
          handleFirestoreError(error, OperationType.GET, ref.path || 'query_snapshot');
        }
      } else {
        handleFirestoreError(error, OperationType.GET, ref.path || 'query_snapshot');
      }
    }
  );
}

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export { collection, doc, query, orderBy, limit, serverTimestamp, signInWithPopup, signOut, onAuthStateChanged };
export type { User };

