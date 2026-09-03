import type { Repository } from '@/types/security';

const STORAGE_KEY = 'secureflow_repositories';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

let memoryRepositories: Repository[] = [];

export class RepositoryStore {
  static async getAll(): Promise<Repository[]> {
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
    return [...memoryRepositories];
  }

  static async getById(id: string): Promise<Repository | null> {
    const list = await this.getAll();
    return list.find(r => r._id === id || r.id === id) || null;
  }

  static async save(repository: Repository): Promise<Repository> {
    const list = await this.getAll();
    const id = repository._id || repository.id || crypto.randomUUID();
    const item: Repository = {
      ...repository,
      _id: id,
      id,
      _updatedDate: new Date().toISOString(),
      _createdDate: repository._createdDate || new Date().toISOString(),
    };

    const index = list.findIndex(r => r._id === id || r.id === id);
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
    const filtered = list.filter(r => r._id !== id && r.id !== id);
    this.persist(filtered);
  }

  private static persist(list: Repository[]): void {
    memoryRepositories = list;
    if (isBrowser()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (err) {
        console.warn('Failed to persist repositories to localStorage:', err);
      }
    }
  }
}