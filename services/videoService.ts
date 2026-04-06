import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Video } from '../types';

/**
 * Uploads a video Blob to Firebase Storage and returns the download URL.
 * @param uid User ID
 * @param blob Video Blob
 * @returns Promise<string> Download URL
 */
export async function uploadVideoToStorage(uid: string, blob: Blob): Promise<string> {
  const videoRef = ref(storage, `videos/${uid}/${Date.now()}.webm`);
  await uploadBytes(videoRef, blob);
  return getDownloadURL(videoRef);
}

/**
 * Saves video metadata to Firestore (to be implemented in ShowStudio).
 * @param uid User ID
 * @param video Video metadata
 */
// export async function saveVideoMetadata(uid: string, video: Video): Promise<void> {
//   // To be implemented: Firestore logic
// }
