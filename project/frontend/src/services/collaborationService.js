/**
 * Collaboration Service
 * 
 * Provides real-time collaboration capabilities for multi-user protocol development
 * using Firebase Realtime Database.
 */

import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  update, 
  push,
  serverTimestamp,
  onDisconnect,
  get,
  child,
  remove
} from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

// Firebase configuration - in production, this would be environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD_jxR5KgDB8eW6jfHVsojMRbbyP-S11g0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "protocol-collaboration.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://protocol-collaboration-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "protocol-collaboration",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "protocol-collaboration.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "463617142698",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:463617142698:web:5f3ea3e4af3ac9d3b4f4d9"
};

// Initialize Firebase (will be lazily initialized when needed)
let app;
let database;
let currentUser = null;
let currentProtocolId = null;
let listeners = {};

/**
 * Initialize the collaboration service
 * @param {string} userName - Display name of the current user
 * @returns {Object} Current user object
 */
export const initCollaboration = (userName) => {
  // Initialize Firebase if not already initialized
  if (!app) {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  }
  
  // Generate a unique user ID if not already set
  if (!currentUser) {
    const userId = uuidv4();
    currentUser = {
      id: userId,
      name: userName || `User ${userId.substring(0, 6)}`,
      color: getRandomColor(),
      timestamp: serverTimestamp()
    };
  } else {
    currentUser.name = userName || currentUser.name;
  }
  
  return currentUser;
};

/**
 * Join a collaborative protocol editing session
 * @param {string} protocolId - The unique ID of the protocol
 * @returns {Promise<boolean>} Success status
 */
export const joinProtocolSession = async (protocolId) => {
  if (!database || !currentUser) {
    throw new Error('Collaboration service not initialized. Call initCollaboration first.');
  }
  
  try {
    currentProtocolId = protocolId;
    
    // Add user to active users list
    const userStatusRef = ref(database, `protocols/${protocolId}/users/${currentUser.id}`);
    await set(userStatusRef, {
      ...currentUser,
      status: 'online',
      lastActive: serverTimestamp()
    });
    
    // Handle user disconnect
    onDisconnect(userStatusRef).update({
      status: 'offline',
      lastActive: serverTimestamp()
    });
    
    // Subscribe to active users
    subscribeToActiveUsers(protocolId);
    
    // Subscribe to protocol changes
    subscribeToProtocolChanges(protocolId);
    
    return true;
  } catch (error) {
    console.error('Error joining protocol session:', error);
    return false;
  }
};

/**
 * Create a new collaborative protocol
 * @param {Object} protocolData - Initial protocol data
 * @returns {Promise<string>} The ID of the created protocol
 */
export const createCollaborativeProtocol = async (protocolData) => {
  if (!database || !currentUser) {
    throw new Error('Collaboration service not initialized. Call initCollaboration first.');
  }
  
  try {
    // Generate a new protocol ID
    const protocolId = uuidv4();
    
    // Create the protocol
    const protocolRef = ref(database, `protocols/${protocolId}`);
    await set(protocolRef, {
      metadata: {
        id: protocolId,
        createdBy: currentUser.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        title: protocolData.title || 'Untitled Protocol',
        version: '1.0'
      },
      data: protocolData,
      users: {
        [currentUser.id]: {
          ...currentUser,
          status: 'online',
          isOwner: true,
          lastActive: serverTimestamp()
        }
      },
      history: [{
        type: 'create',
        user: currentUser.id,
        timestamp: serverTimestamp(),
        data: protocolData
      }]
    });
    
    // Join the session
    await joinProtocolSession(protocolId);
    
    return protocolId;
  } catch (error) {
    console.error('Error creating collaborative protocol:', error);
    throw error;
  }
};

/**
 * Update a part of the protocol with new data
 * @param {string} section - The section of the protocol to update
 * @param {Object} data - The new data for the section
 * @returns {Promise<boolean>} Success status
 */
export const updateProtocolSection = async (section, data) => {
  if (!database || !currentUser || !currentProtocolId) {
    throw new Error('Not connected to a protocol session.');
  }
  
  try {
    // Update the protocol data
    const updates = {};
    updates[`protocols/${currentProtocolId}/data/${section}`] = data;
    updates[`protocols/${currentProtocolId}/metadata/updatedAt`] = serverTimestamp();
    
    // Add to history
    const historyRef = ref(database, `protocols/${currentProtocolId}/history`);
    const newHistoryRef = push(historyRef);
    updates[newHistoryRef.key] = {
      type: 'update',
      section,
      user: currentUser.id,
      timestamp: serverTimestamp(),
      data
    };
    
    // Perform the updates
    await update(ref(database), updates);
    
    return true;
  } catch (error) {
    console.error('Error updating protocol section:', error);
    return false;
  }
};

/**
 * Add a comment to a protocol section
 * @param {string} section - The section to comment on
 * @param {string} comment - The comment text
 * @returns {Promise<boolean>} Success status
 */
export const addComment = async (section, comment) => {
  if (!database || !currentUser || !currentProtocolId) {
    throw new Error('Not connected to a protocol session.');
  }
  
  try {
    const commentsRef = ref(database, `protocols/${currentProtocolId}/comments/${section}`);
    const newCommentRef = push(commentsRef);
    
    await set(newCommentRef, {
      id: newCommentRef.key,
      text: comment,
      user: currentUser.id,
      userName: currentUser.name,
      timestamp: serverTimestamp(),
      resolved: false
    });
    
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

/**
 * Delete a comment
 * @param {string} section - The section containing the comment
 * @param {string} commentId - The ID of the comment to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteComment = async (section, commentId) => {
  if (!database || !currentUser || !currentProtocolId) {
    throw new Error('Not connected to a protocol session.');
  }
  
  try {
    const commentRef = ref(database, `protocols/${currentProtocolId}/comments/${section}/${commentId}`);
    await remove(commentRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

/**
 * Subscribe to changes in protocol data
 * @param {string} protocolId - The protocol ID
 * @param {Function} callback - Callback function for data changes
 */
export const subscribeToProtocolChanges = (protocolId, callback) => {
  if (!database) {
    throw new Error('Collaboration service not initialized.');
  }
  
  const protocolRef = ref(database, `protocols/${protocolId}/data`);
  
  // Remove existing listener for this protocol if it exists
  if (listeners[`protocol-${protocolId}`]) {
    listeners[`protocol-${protocolId}`]();
  }
  
  // Set up new listener
  const unsubscribe = onValue(protocolRef, (snapshot) => {
    const data = snapshot.val();
    
    if (callback && typeof callback === 'function') {
      callback(data);
    }
    
    // Dispatch a custom event for components to listen to
    const event = new CustomEvent('protocolDataChanged', { detail: { data } });
    window.dispatchEvent(event);
  });
  
  listeners[`protocol-${protocolId}`] = unsubscribe;
  return unsubscribe;
};

/**
 * Subscribe to active users in a protocol session
 * @param {string} protocolId - The protocol ID
 * @param {Function} callback - Callback function for user changes
 */
export const subscribeToActiveUsers = (protocolId, callback) => {
  if (!database) {
    throw new Error('Collaboration service not initialized.');
  }
  
  const usersRef = ref(database, `protocols/${protocolId}/users`);
  
  // Remove existing listener for this protocol if it exists
  if (listeners[`users-${protocolId}`]) {
    listeners[`users-${protocolId}`]();
  }
  
  // Set up new listener
  const unsubscribe = onValue(usersRef, (snapshot) => {
    const users = snapshot.val() || {};
    
    if (callback && typeof callback === 'function') {
      callback(users);
    }
    
    // Dispatch a custom event for components to listen to
    const event = new CustomEvent('activeUsersChanged', { detail: { users } });
    window.dispatchEvent(event);
  });
  
  listeners[`users-${protocolId}`] = unsubscribe;
  return unsubscribe;
};

/**
 * Subscribe to comments for a protocol section
 * @param {string} protocolId - The protocol ID
 * @param {string} section - The section to subscribe to comments for
 * @param {Function} callback - Callback function for comment changes
 */
export const subscribeToComments = (protocolId, section, callback) => {
  if (!database) {
    throw new Error('Collaboration service not initialized.');
  }
  
  const commentsRef = ref(database, `protocols/${protocolId}/comments/${section}`);
  
  // Remove existing listener for this section if it exists
  if (listeners[`comments-${protocolId}-${section}`]) {
    listeners[`comments-${protocolId}-${section}`]();
  }
  
  // Set up new listener
  const unsubscribe = onValue(commentsRef, (snapshot) => {
    const comments = snapshot.val() || {};
    
    if (callback && typeof callback === 'function') {
      callback(comments);
    }
    
    // Dispatch a custom event for components to listen to
    const event = new CustomEvent('commentsChanged', { 
      detail: { comments, section } 
    });
    window.dispatchEvent(event);
  });
  
  listeners[`comments-${protocolId}-${section}`] = unsubscribe;
  return unsubscribe;
};

/**
 * Leave the protocol session
 * @returns {Promise<boolean>} Success status
 */
export const leaveProtocolSession = async () => {
  if (!database || !currentUser || !currentProtocolId) {
    return true; // Already disconnected
  }
  
  try {
    // Update user status to offline
    const userRef = ref(database, `protocols/${currentProtocolId}/users/${currentUser.id}`);
    await update(userRef, {
      status: 'offline',
      lastActive: serverTimestamp()
    });
    
    // Remove all listeners
    Object.keys(listeners).forEach(key => {
      if (listeners[key] && typeof listeners[key] === 'function') {
        listeners[key]();
      }
    });
    
    // Reset state
    listeners = {};
    currentProtocolId = null;
    
    return true;
  } catch (error) {
    console.error('Error leaving protocol session:', error);
    return false;
  }
};

/**
 * Get the current user information
 * @returns {Object} Current user object or null if not initialized
 */
export const getCurrentUser = () => {
  return currentUser;
};

/**
 * Get the current protocol ID
 * @returns {string} Current protocol ID or null if not in a session
 */
export const getCurrentProtocolId = () => {
  return currentProtocolId;
};

/**
 * Generate a random color for user identification
 * @returns {string} Random color in hex format
 */
const getRandomColor = () => {
  const colors = [
    '#4caf50', // green
    '#2196f3', // blue
    '#f44336', // red
    '#ff9800', // orange
    '#9c27b0', // purple
    '#00bcd4', // cyan
    '#795548', // brown
    '#607d8b', // blue-grey
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

export default {
  initCollaboration,
  joinProtocolSession,
  createCollaborativeProtocol,
  updateProtocolSection,
  addComment,
  deleteComment,
  subscribeToProtocolChanges,
  subscribeToActiveUsers,
  subscribeToComments,
  leaveProtocolSession,
  getCurrentUser,
  getCurrentProtocolId
}; 