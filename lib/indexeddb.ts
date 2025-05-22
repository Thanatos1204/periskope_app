import { Chat, Message, User, ChatMember, Label, ChatLabel } from './types';

const DB_NAME = 'periskope_chat_db';
const DB_VERSION = 1;

// Database initialization
export async function initIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores (tables)
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('phone', 'phone', { unique: true });
      }

      if (!db.objectStoreNames.contains('chats')) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
        chatStore.createIndex('updated_at', 'updated_at', { unique: false });
      }

      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('chat_id', 'chat_id', { unique: false });
        messageStore.createIndex('created_at', 'created_at', { unique: false });
      }

      if (!db.objectStoreNames.contains('chat_members')) {
        const chatMemberStore = db.createObjectStore('chat_members', { keyPath: 'id' });
        chatMemberStore.createIndex('chat_id', 'chat_id', { unique: false });
        chatMemberStore.createIndex('user_id', 'user_id', { unique: false });
      }

      if (!db.objectStoreNames.contains('labels')) {
        const labelStore = db.createObjectStore('labels', { keyPath: 'id' });
        labelStore.createIndex('name', 'name', { unique: true });
      }

      if (!db.objectStoreNames.contains('chat_labels')) {
        const chatLabelStore = db.createObjectStore('chat_labels', { keyPath: 'id' });
        chatLabelStore.createIndex('chat_id', 'chat_id', { unique: false });
        chatLabelStore.createIndex('label_id', 'label_id', { unique: false });
      }
    };
  });
}

// Generic function to add an item to a store
export async function addItem<T>(storeName: string, item: T): Promise<T> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    request.onerror = (event) => {
      console.error(`Error adding item to ${storeName}:`, event);
      reject(`Error adding item to ${storeName}`);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Generic function to update an item in a store
export async function updateItem<T>(storeName: string, item: T): Promise<T> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    request.onerror = (event) => {
      console.error(`Error updating item in ${storeName}:`, event);
      reject(`Error updating item in ${storeName}`);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Generic function to get an item from a store by key
export async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting item from ${storeName}:`, event);
      reject(`Error getting item from ${storeName}`);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Generic function to get all items from a store
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      console.error(`Error getting all items from ${storeName}:`, event);
      reject(`Error getting all items from ${storeName}`);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Get all messages for a specific chat
export async function getMessagesByChat(chatId: string): Promise<Message[]> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('messages', 'readonly');
    const store = transaction.objectStore('messages');
    const index = store.index('chat_id');
    const request = index.getAll(chatId);
    
    request.onsuccess = () => {
      // Sort messages by created_at
      const messages = request.result || [];
      messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      resolve(messages);
    };
    
    request.onerror = (event) => {
      console.error('Error getting messages by chat:', event);
      reject('Error getting messages by chat');
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Get all members for a specific chat
export async function getMembersByChat(chatId: string): Promise<ChatMember[]> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chat_members', 'readonly');
    const store = transaction.objectStore('chat_members');
    const index = store.index('chat_id');
    const request = index.getAll(chatId);
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      console.error('Error getting members by chat:', event);
      reject('Error getting members by chat');
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Get all labels for a specific chat
export async function getLabelsByChat(chatId: string): Promise<ChatLabel[]> {
  const db = await initIndexedDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chat_labels', 'readonly');
    const store = transaction.objectStore('chat_labels');
    const index = store.index('chat_id');
    const request = index.getAll(chatId);
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      console.error('Error getting labels by chat:', event);
      reject('Error getting labels by chat');
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Sync IndexedDB with Supabase data
export async function syncChats(chats: Chat[]): Promise<void> {
  for (const chat of chats) {
    await updateItem('chats', chat);
  }
}

export async function syncMessages(messages: Message[]): Promise<void> {
  for (const message of messages) {
    await updateItem('messages', message);
  }
}

export async function syncUsers(users: User[]): Promise<void> {
  for (const user of users) {
    await updateItem('users', user);
  }
}

export async function syncChatMembers(members: ChatMember[]): Promise<void> {
  for (const member of members) {
    await updateItem('chat_members', member);
  }
}

export async function syncLabels(labels: Label[]): Promise<void> {
  for (const label of labels) {
    await updateItem('labels', label);
  }
}

export async function syncChatLabels(chatLabels: ChatLabel[]): Promise<void> {
  for (const chatLabel of chatLabels) {
    await updateItem('chat_labels', chatLabel);
  }
}