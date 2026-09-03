import type { ScanHistoryItem } from '@/types/security';

const STORAGE_KEY = 'secureflow_scans';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

let memoryScans: ScanHistoryItem[] = [];

export class ScanStore {
  static async getAll(): Promise<ScanHistoryItem[]> {
    if (isBrowser()) {
      try {
        const data = window.localStorage.getItem(STORAGE_KEY);
        if (data !== null) {
          return JSON.parse(data);
        }
      } catch {
        // Fallback to memory
      }
    }
    return [...memoryScans];
  }

  static async getById(id: string): Promise<ScanHistoryItem | null> {
    const list = await this.getAll();
    return list.find(s => s._id === id || s.id === id) || null;
  }

  static async save(scan: ScanHistoryItem): Promise<ScanHistoryItem> {
    const list = await this.getAll();
    const id = scan._id || scan.id || crypto.randomUUID();
    const item: ScanHistoryItem = {
      ...scan,
      _id: id,
      id,
      _createdDate: scan._createdDate || new Date().toISOString(),
    };

    const index = list.findIndex(s => s._id === id || s.id === id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }

    this.persist(list);
    return item;
  }

  static async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter(s => s._id !== id && s.id !== id);
    this.persist(filtered);
  }

  private static persist(list: ScanHistoryItem[]): void {
    memoryScans = list;
    if (isBrowser()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (err) {
        console.warn('Failed to persist scans to localStorage:', err);
      }
    }
  }
}