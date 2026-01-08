
import { VaultItem } from './types';

const DB_NAME = 'LatentCinemaDB';
const STORE_NAME = 'vault_nodes';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveNode = async (item: VaultItem): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const nodeToSave = {
      ...item,
      usageCount: item.usageCount ?? 0,
      neuralPreferenceScore: item.neuralPreferenceScore ?? 50,
      isFavorite: item.isFavorite ?? false,
      vaultDomain: item.vaultDomain ?? 'X'
    };
    tx.objectStore(STORE_NAME).put(nodeToSave);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const toggleFavoriteNode = async (id: string): Promise<boolean> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
      const item = request.result as VaultItem;
      if (item) {
        item.isFavorite = !item.isFavorite;
        // Favoritos ganham boost no score
        item.neuralPreferenceScore = item.isFavorite ? Math.min(100, item.neuralPreferenceScore + 20) : item.neuralPreferenceScore;
        store.put(item);
        resolve(item.isFavorite);
      } else {
        reject("Node not found");
      }
    };
  });
};

export const incrementNodeUsage = async (shortId: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as VaultItem[];
      const item = items.find(i => i.shortId === shortId);
      if (item) {
        item.usageCount = (item.usageCount ?? 0) + 1;
        item.neuralPreferenceScore = Math.min(100, (item.usageCount * 5) + (item.rating * 10) + (item.isFavorite ? 20 : 0));
        store.put(item);
      }
      resolve();
    };
  });
};

export const getAllNodes = async (): Promise<VaultItem[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const deleteNode = async (id: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
};

export const bulkSaveNodes = async (items: VaultItem[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  items.forEach(item => store.put(item));
};
