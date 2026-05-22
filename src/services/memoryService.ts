import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, Timestamp, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Memory } from '../types';
import { MOCK_MEMORIES } from './mockMemories';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'memories';
const USERS_COLLECTION = 'users';
const SAVED_COLLECTION = 'savedMemories';

export const memoryService = {
  getMemories: async (): Promise<Memory[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const dbMemories = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert timestamp to string if it's a Firestore Timestamp
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp
        } as Memory;
      });
      // Combine Firestore memories with the mock memories to keep map populated and active
      return [...dbMemories, ...MOCK_MEMORIES];
    } catch (error) {
      console.warn('Firestore fetch failed, falling back to mock memories only:', error);
      return MOCK_MEMORIES;
    }
  },

  saveMemory: async (memoryData: Omit<Memory, 'id'>): Promise<Memory> => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(memoryData).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...cleanData,
        timestamp: serverTimestamp(),
        authorId: auth.currentUser?.uid || 'anonymous',
        isUnlocked: true
      });
      
      return {
        id: docRef.id,
        ...cleanData,
        timestamp: new Date().toISOString(),
        authorId: auth.currentUser?.uid || 'anonymous',
        isUnlocked: true
      } as Memory;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
      throw error;
    }
  },

  saveToCollection: async (memoryId: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('Must be signed in to save memories');
    const path = `${USERS_COLLECTION}/${auth.currentUser.uid}/${SAVED_COLLECTION}/${memoryId}`;
    try {
      await setDoc(doc(db, USERS_COLLECTION, auth.currentUser.uid, SAVED_COLLECTION, memoryId), {
        memoryId,
        savedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  removeFromCollection: async (memoryId: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('Must be signed in to remove saved memories');
    const path = `${USERS_COLLECTION}/${auth.currentUser.uid}/${SAVED_COLLECTION}/${memoryId}`;
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, auth.currentUser.uid, SAVED_COLLECTION, memoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  getSavedMemoryIds: async (): Promise<string[]> => {
    if (!auth.currentUser) return [];
    const path = `${USERS_COLLECTION}/${auth.currentUser.uid}/${SAVED_COLLECTION}`;
    try {
      const snapshot = await getDocs(collection(db, USERS_COLLECTION, auth.currentUser.uid, SAVED_COLLECTION));
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  getSavedMemories: async (): Promise<Memory[]> => {
    if (!auth.currentUser) return [];
    try {
      const savedIds = await memoryService.getSavedMemoryIds();
      if (savedIds.length === 0) return [];

      // Fetch the actual memory documents
      // Note: Firestore 'in' query is limited to 30 items. For a robust app we might need multiple queries.
      // But for this purpose we'll stick to a simple fetch for now or individual gets if many.
      const memories: Memory[] = [];
      for (const id of savedIds) {
        const memoryDoc = await getDoc(doc(db, COLLECTION_NAME, id));
        if (memoryDoc.exists()) {
          const data = memoryDoc.data();
          memories.push({
            id: memoryDoc.id,
            ...data,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp
          } as Memory);
        }
      }
      return memories;
    } catch (error) {
       // Error handled in getSavedMemoryIds or individual getDoc calls
       return [];
    }
  }
};
