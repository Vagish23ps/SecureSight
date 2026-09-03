import type { Pipeline, ReportItem } from '@/types/security';

const PIPELINES_KEY = 'secureflow_pipelines';
const REPORTS_KEY = 'secureflow_reports';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

let memoryPipelines: Pipeline[] = [];
let memoryReports: ReportItem[] = [];

export class PipelineStore {
  static async getAll(): Promise<Pipeline[]> {
    if (isBrowser()) {
      try {
        const data = window.localStorage.getItem(PIPELINES_KEY);
        if (data !== null) return JSON.parse(data);
      } catch {}
    }
    return [...memoryPipelines];
  }

  static async getById(id: string): Promise<Pipeline | null> {
    const list = await this.getAll();
    return list.find(p => p._id === id || p.id === id) || null;
  }

  static async save(item: Pipeline): Promise<Pipeline> {
    const list = await this.getAll();
    const id = item._id || item.id || crypto.randomUUID();
    const record = { ...item, _id: id, id };
    const index = list.findIndex(p => p._id === id || p.id === id);
    if (index >= 0) list[index] = record;
    else list.unshift(record);
    memoryPipelines = list;
    if (isBrowser()) {
      try { window.localStorage.setItem(PIPELINES_KEY, JSON.stringify(list)); } catch {}
    }
    return record;
  }

  static async delete(id: string): Promise<void> {
    const list = (await this.getAll()).filter(p => p._id !== id && p.id !== id);
    memoryPipelines = list;
    if (isBrowser()) {
      try { window.localStorage.setItem(PIPELINES_KEY, JSON.stringify(list)); } catch {}
    }
  }
}

export class ReportStore {
  static async getAll(): Promise<ReportItem[]> {
    if (isBrowser()) {
      try {
        const data = window.localStorage.getItem(REPORTS_KEY);
        if (data !== null) return JSON.parse(data);
      } catch {}
    }
    return [...memoryReports];
  }

  static async getById(id: string): Promise<ReportItem | null> {
    const list = await this.getAll();
    return list.find(r => r._id === id || r.id === id) || null;
  }

  static async save(item: ReportItem): Promise<ReportItem> {
    const list = await this.getAll();
    const id = item._id || item.id || crypto.randomUUID();
    const record = { ...item, _id: id, id };
    const index = list.findIndex(r => r._id === id || r.id === id);
    if (index >= 0) list[index] = record;
    else list.unshift(record);
    memoryReports = list;
    if (isBrowser()) {
      try { window.localStorage.setItem(REPORTS_KEY, JSON.stringify(list)); } catch {}
    }
    return record;
  }
}