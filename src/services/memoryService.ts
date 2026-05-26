import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, Timestamp, doc, setDoc, deleteDoc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Memory, Comment } from '../types';
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
        let coords = data.coordinates;
        
        if (coords && coords.length === 2) {
          const lat = coords[0];
          let lng = coords[1];
          let inLake = false;
          if (lat > 42.02 && lng > -87.665) inLake = true;
          else if (lat > 41.97 && lng > -87.65) inLake = true;
          else if (lat > 41.91 && lng > -87.635) inLake = true;
          else if (lat > 41.87 && lng > -87.61) inLake = true;
          else if (lat > 41.81 && lng > -87.59) inLake = true;
          else if (lat > 41.76 && lng > -87.55) inLake = true;
          else if (lat <= 41.76 && lng > -87.53) inLake = true;
          else if (lat >= 41.87 && lat <= 41.90 && lng > -87.61) inLake = true;

          if (inLake) {
             coords = [lat, lng - 0.05];
          }
        }

        return {
          id: doc.id,
          ...data,
          coordinates: coords,
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
  },

  addComment: async (memoryId: string, text: string): Promise<Comment> => {
    if (!auth.currentUser) throw new Error('Must be signed in to comment');

    // Create a new comment object
    const newComment: Comment = {
      id: Date.now().toString(),
      authorId: auth.currentUser.uid,
      authorName: auth.currentUser.displayName || 'Anonymous',
      text,
      timestamp: new Date().toISOString()
    };

    const path = `${COLLECTION_NAME}/${memoryId}`;
    try {
      // Find out if this is a mock memory (starts with 'mock-')
      if (memoryId.startsWith('mock_')) {
        // Find it in MOCK_MEMORIES and update it directly just for the UI
        const mockMemory = MOCK_MEMORIES.find(m => m.id === memoryId);
        if (mockMemory) {
           mockMemory.comments = [...(mockMemory.comments || []), newComment];
        }
        return newComment;
      }

      await updateDoc(doc(db, COLLECTION_NAME, memoryId), {
        comments: arrayUnion(newComment)
      });
      return newComment;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  likeMemory: async (memoryId: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('Must be signed in to like');

    const path = `${COLLECTION_NAME}/${memoryId}`;
    try {
      if (memoryId.startsWith('mock_')) {
        const mockMemory = MOCK_MEMORIES.find(m => m.id === memoryId);
        if (mockMemory) {
           mockMemory.reactions = (mockMemory.reactions || 0) + 1;
        }
        return;
      }

      await updateDoc(doc(db, COLLECTION_NAME, memoryId), {
        reactions: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  }
};
