import type { Finding } from '@/types/security';

const STORAGE_KEY = 'secureflow_findings';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

let memoryFindings: Finding[] = [];

export class FindingStore {
  static async getAll(filter?: {
    repositoryName?: string;
    severity?: string;
    status?: string;
    scanner?: string;
  }): Promise<Finding[]> {
    let list: Finding[] = [];

    if (isBrowser()) {
      try {
        const data = window.localStorage.getItem(STORAGE_KEY);
        if (data !== null) {
          list = JSON.parse(data);
        }
      } catch {
        list = [...memoryFindings];
      }
    } else {
      list = [...memoryFindings];
    }

    if (!filter) return list;

    return list.filter(item => {
      if (filter.repositoryName && item.repositoryName !== filter.repositoryName) return false;
      if (filter.severity && item.severity !== filter.severity) return false;
      if (filter.status && item.status !== filter.status && item.remediationStatus !== filter.status)
        return false;
      if (filter.scanner && item.scanner !== filter.scanner) return false;
      return true;
    });
  }

  static async getById(id: string): Promise<Finding | null> {
    const list = await this.getAll();
    return list.find(f => f._id === id || f.id === id) || null;
  }

  static async save(finding: Finding): Promise<Finding> {
    const list = await this.getAll();
    const id = finding._id || finding.id || crypto.randomUUID();
    const item: Finding = {
      ...finding,
      _id: id,
      id,
    };

    const index = list.findIndex(f => f._id === id || f.id === id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }

    this.persist(list);
    return item;
  }

  static async saveMany(findings: Finding[]): Promise<void> {
    const list = await this.getAll();
    for (const f of findings) {
      const id = f._id || f.id || crypto.randomUUID();
      const item: Finding = { ...f, _id: id, id };
      const index = list.findIndex(existing => existing._id === id || existing.id === id);
      if (index >= 0) {
        list[index] = item;
      } else {
        list.unshift(item);
      }
    }
    this.persist(list);
  }

  static async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter(f => f._id !== id && f.id !== id);
    this.persist(filtered);
  }

  static async deleteByRepository(repositoryName: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter(f => f.repositoryName !== repositoryName);
    this.persist(filtered);
  }

  private static persist(list: Finding[]): void {
    memoryFindings = list;
    if (isBrowser()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (err) {
        console.warn('Failed to persist findings to localStorage:', err);
      }
    }
  }
}