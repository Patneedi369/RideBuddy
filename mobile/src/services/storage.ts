// Memory storage map for web/Expo Go when native module is null
const memoryStorage = new Map<string, string>();

function getNativeAsyncStorage(): any {
  try {
    const mod = require('@react-native-async-storage/async-storage');
    return mod?.default || mod;
  } catch (e) {
    return null;
  }
}

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const storage = getNativeAsyncStorage();
      if (storage) {
        const val = await storage.getItem(key);
        if (val !== undefined && val !== null) return val;
      }
    } catch (error) {
      // Ignore native module null error and fall back
    }
    return memoryStorage.get(key) || null;
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryStorage.set(key, value);
    try {
      const storage = getNativeAsyncStorage();
      if (storage) {
        await storage.setItem(key, value);
      }
    } catch (error) {
      // Ignore native module null error
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryStorage.delete(key);
    try {
      const storage = getNativeAsyncStorage();
      if (storage) {
        await storage.removeItem(key);
      }
    } catch (error) {
      // Ignore native module null error
    }
  },
};
