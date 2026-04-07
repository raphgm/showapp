import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Video } from '../types';

const db = getFirestore();

/**
 * Saves video metadata to Firestore under the user's collection.
 * @param uid User ID
 * @param video Video metadata
 */
export async function saveVideoMetadata(uid: string, video: Video): Promise<void> {
  const videosCol = collection(db, 'users', uid, 'videos');
  await addDoc(videosCol, {
    ...video,
    createdAt: serverTimestamp(),
  });
}
