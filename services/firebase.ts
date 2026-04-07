
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  onValue,
  off,
  update,
  remove,
  type DatabaseReference,
} from 'firebase/database';

// ─── Firebase Configuration (public client-side keys) ─────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDfIi3wcbXKNzdMiR7Wvbu0o2vF_I984Iw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'showapp-8ead7.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://showapp-8ead7-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'showapp-8ead7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'showapp-8ead7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '183755746588',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:183755746588:web:b29c4b83233830ba6b5ed9',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-80141PD5NT',
};

import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// ─── Providers ────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

const githubProvider = new GithubAuthProvider();

// ─── Auth Functions ───────────────────────────────────────────────────

/** Sign in with Google popup */
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

/** Sign in with GitHub popup */
export const signInWithGitHub = () => signInWithPopup(auth, githubProvider);

/** Sign in with email & password */
export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

/** Create account with email & password, then set display name */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
};

/** Sign out */
export const signOut = () => firebaseSignOut(auth);

/** Subscribe to auth state changes */
export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// ─── Realtime Room Sync ───────────────────────────────────────────────

export interface RoomState {
  liveSceneId: string;
  sceneOverlayDismissed: string | null;
  isBroadcasting: boolean;
  isRecording: boolean;
  breakMessage: string;
  breakSubtitle: string;
  studioTitle: string;
  scenes: Array<{ id: string; name: string; type: string }>;
  hostId: string;
  updatedAt: number;
}

/** Create or update room state (host only) */
export const setRoomState = (roomId: string, state: Partial<RoomState>) => {
  const roomRef = ref(database, `rooms/${roomId}`);
  return update(roomRef, { ...state, updatedAt: Date.now() });
};

/** Subscribe to room state changes (participants) */
export const subscribeToRoom = (
  roomId: string,
  callback: (state: RoomState | null) => void
): (() => void) => {
  const roomRef = ref(database, `rooms/${roomId}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe;
};

/** Delete room (on end call) */
export const deleteRoom = (roomId: string) => {
  const roomRef = ref(database, `rooms/${roomId}`);
  return remove(roomRef);
};

// ─── Chat Messages (Q&A Style) ────────────────────────────────────────

export interface ChatMessageData {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isFromHost: boolean;
  recipientId?: string; // If set, only this user + host can see it
}

/** Send a chat message */
export const sendChatMessage = (roomId: string, message: ChatMessageData) => {
  const messagesRef = ref(database, `rooms/${roomId}/messages/${message.id}`);
  return set(messagesRef, message);
};

/** Subscribe to chat messages */
export const subscribeToChatMessages = (
  roomId: string,
  callback: (messages: ChatMessageData[]) => void
): (() => void) => {
  const messagesRef = ref(database, `rooms/${roomId}/messages`);
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const messages = Object.values(data) as ChatMessageData[];
    // Sort by id (timestamp-based)
    messages.sort((a, b) => a.id.localeCompare(b.id));
    callback(messages);
  });
  return unsubscribe;
};

// ─── Join Requests (Guest Approval) ───────────────────────────────────

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  timestamp: number;
  wantsRecording?: boolean;
}

/** Guest sends a join request */
export const sendJoinRequest = (roomId: string, request: JoinRequest) => {
  const requestRef = ref(database, `rooms/${roomId}/joinRequests/${request.id}`);
  return set(requestRef, request);
};

/** Subscribe to join requests (host only) */
export const subscribeToJoinRequests = (
  roomId: string,
  callback: (requests: JoinRequest[]) => void
): (() => void) => {
  const requestsRef = ref(database, `rooms/${roomId}/joinRequests`);
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const requests = Object.values(data) as JoinRequest[];
    // Sort by timestamp
    requests.sort((a, b) => a.timestamp - b.timestamp);
    callback(requests);
  });
  return unsubscribe;
};

/** Remove a join request (after accept/deny) */
export const removeJoinRequest = (roomId: string, requestId: string) => {
  const requestRef = ref(database, `rooms/${roomId}/joinRequests/${requestId}`);
  return remove(requestRef);
};

/** Set guest approval status (host sets this when accepting/denying) */
export const setGuestApprovalStatus = (roomId: string, requestId: string, approved: boolean) => {
  const statusRef = ref(database, `rooms/${roomId}/approvalStatus/${requestId}`);
  return set(statusRef, { approved, timestamp: Date.now() });
};

/** Subscribe to guest's own approval status */
export const subscribeToApprovalStatus = (
  roomId: string,
  requestId: string,
  callback: (approved: boolean | null) => void
): (() => void) => {
  const statusRef = ref(database, `rooms/${roomId}/approvalStatus/${requestId}`);
  const unsubscribe = onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data && data.approved !== undefined ? data.approved : null);
  });
  return unsubscribe;
};

// ─── Participant Sync ────────────────────────────────────────────────
export interface ParticipantData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isMuted: boolean;
  isCamOff: boolean;
  canScreenShare?: boolean;
  updatedAt: number;
}

/** Update or add a participant */
export const syncParticipant = (roomId: string, participant: ParticipantData) => {
  const pRef = ref(database, `rooms/${roomId}/participants/${participant.id}`);
  return update(pRef, { ...participant, updatedAt: Date.now() });
};

/** Subscribe to participants */
export const subscribeToParticipants = (
  roomId: string,
  callback: (participants: ParticipantData[]) => void
): (() => void) => {
  const pRef = ref(database, `rooms/${roomId}/participants`);
  const unsubscribe = onValue(pRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const participants = Object.values(data) as ParticipantData[];
    callback(participants);
  });
  return unsubscribe;
};

/** Remove a participant (on leave/end) */
export const removeParticipant = (roomId: string, participantId: string) => {
  const pRef = ref(database, `rooms/${roomId}/participants/${participantId}`);
  return remove(pRef);
};

// ─── Workspace Chat ──────────────────────────────────────────────────

export interface WorkspaceChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  type: 'workspace' | 'ai';
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface TeamSet {
  id: string;
  name: string;
  workspaceId: string;
  createdBy: string;
  createdAt: number;
  memberIds: string[];
}

export interface TeamSetMessage {
  id: string;
  setId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
}

/** Send a message to workspace chat */
export const sendWorkspaceMessage = (workspaceId: string, message: WorkspaceChatMessage) => {
  const messageRef = ref(database, `workspaces/${workspaceId}/chat/${message.id}`);
  return set(messageRef, message);
};

/** Subscribe to workspace chat messages */
export const subscribeToWorkspaceMessages = (
  workspaceId: string,
  callback: (messages: WorkspaceChatMessage[]) => void
): (() => void) => {
  const chatRef = ref(database, `workspaces/${workspaceId}/chat`);
  const unsubscribe = onValue(chatRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const messages = Object.values(data) as WorkspaceChatMessage[];
    messages.sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
  return unsubscribe;
};

/** Send a direct message */
export const sendDirectMessage = (message: DirectMessage) => {
  const conversationId = [message.senderId, message.recipientId].sort().join('_');
  const messageRef = ref(database, `directMessages/${conversationId}/${message.id}`);
  return set(messageRef, message);
};

/** Subscribe to direct messages for a user */
export const subscribeToDirectMessages = (
  userId: string,
  callback: (conversations: Map<string, DirectMessage[]>) => void
): (() => void) => {
  const dmRef = ref(database, `directMessages`);
  const unsubscribe = onValue(dmRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback(new Map());
      return;
    }

    const conversations = new Map<string, DirectMessage[]>();

    // Filter conversations that include this user
    Object.entries(data).forEach(([conversationId, messages]: [string, any]) => {
      if (conversationId.includes(userId)) {
        const messageArray = Object.values(messages) as DirectMessage[];
        messageArray.sort((a, b) => a.timestamp - b.timestamp);
        conversations.set(conversationId, messageArray);
      }
    });

    callback(conversations);
  });
  return unsubscribe;
};

/** Create a new team set */
export const createTeamSet = (workspaceId: string, setData: TeamSet) => {
  const setRef = ref(database, `workspaces/${workspaceId}/sets/${setData.id}`);
  return set(setRef, setData);
};

/** Subscribe to team sets */
export const subscribeToTeamSets = (
  workspaceId: string,
  callback: (sets: TeamSet[]) => void
): (() => void) => {
  const setsRef = ref(database, `workspaces/${workspaceId}/sets`);
  const unsubscribe = onValue(setsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const sets = Object.values(data) as TeamSet[];
    sets.sort((a, b) => a.createdAt - b.createdAt);
    callback(sets);
  });
  return unsubscribe;
};

/** Send a message to a team set */
export const sendTeamSetMessage = (workspaceId: string, message: TeamSetMessage) => {
  const messageRef = ref(database, `workspaces/${workspaceId}/setMessages/${message.setId}/${message.id}`);
  return set(messageRef, message);
};

/** Subscribe to team set messages */
export const subscribeToTeamSetMessages = (
  workspaceId: string,
  setId: string,
  callback: (messages: TeamSetMessage[]) => void
): (() => void) => {
  const messagesRef = ref(database, `workspaces/${workspaceId}/setMessages/${setId}`);
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const messages = Object.values(data) as TeamSetMessage[];
    messages.sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
  return unsubscribe;
};

// ─── Workspace Members ───────────────────────────────────────────────

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  online: boolean;
  lastSeen: number;
  workspaceId: string;
}

/** Add or update a workspace member */
export const syncWorkspaceMember = (workspaceId: string, member: WorkspaceMember) => {
  const memberRef = ref(database, `workspaces/${workspaceId}/members/${member.id}`);
  return set(memberRef, { ...member, lastSeen: Date.now() });
};

/** Set user online/offline status */
export const setUserPresence = (workspaceId: string, userId: string, online: boolean) => {
  const presenceRef = ref(database, `workspaces/${workspaceId}/members/${userId}/online`);
  const lastSeenRef = ref(database, `workspaces/${workspaceId}/members/${userId}/lastSeen`);

  return Promise.all([
    set(presenceRef, online),
    set(lastSeenRef, Date.now())
  ]);
};

/** Subscribe to workspace members */
export const subscribeToWorkspaceMembers = (
  workspaceId: string,
  callback: (members: WorkspaceMember[]) => void
): (() => void) => {
  const membersRef = ref(database, `workspaces/${workspaceId}/members`);
  const unsubscribe = onValue(membersRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const members = Object.values(data) as WorkspaceMember[];
    callback(members);
  });
  return unsubscribe;
};

/** Invite a new member to workspace */
export const inviteWorkspaceMember = (workspaceId: string, email: string, role: string = 'Viewer') => {
  const inviteId = `invite_${Date.now()}`;
  const inviteRef = ref(database, `workspaces/${workspaceId}/invites/${inviteId}`);
  return set(inviteRef, {
    id: inviteId,
    email,
    role,
    invitedAt: Date.now(),
    status: 'pending'
  });
};

export type { User };
