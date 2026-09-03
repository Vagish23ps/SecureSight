/**
 * Standalone Storage Layer for SecureFlow
 * Provides direct Store access and unified BaseCrudService abstraction.
 */

import { RepositoryStore } from './repository-store';
import { ScanStore } from './scan-store';
import { FindingStore } from './finding-store';
import { PipelineStore, ReportStore } from './pipeline-store';

export { RepositoryStore, ScanStore, FindingStore, PipelineStore, ReportStore };

export interface PaginationOptions {
  limit?: number;
  skip?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
  currentPage: number;
  pageSize: number;
  nextSkip: number | null;
}

/**
 * Unified CRUD Service mapping to our real stores
 */
export class BaseCrudService {
  static async getAll<T>(
    collectionId: string,
    filter: Record<string, any> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const col = collectionId.toLowerCase();
    let rawItems: any[] = [];

    if (col === 'repositories') {
      rawItems = await RepositoryStore.getAll();
    } else if (col === 'scanhistory' || col === 'scans') {
      rawItems = await ScanStore.getAll();
    } else if (col === 'securityfindings' || col === 'findings') {
      rawItems = await FindingStore.getAll(filter);
    } else if (col === 'pipelines') {
      rawItems = await PipelineStore.getAll();
    } else if (col === 'reports') {
      rawItems = await ReportStore.getAll();
    }

    if (filter && Object.keys(filter).length > 0 && col !== 'securityfindings') {
      rawItems = rawItems.filter((item: any) => {
        return Object.entries(filter).every(([key, value]) => {
          if (value === undefined || value === '') return true;
          return item[key] === value;
        });
      });
    }

    const totalCount = rawItems.length;
    const skip = options.skip || 0;
    const limit = options.limit || 100;
    const pagedItems = rawItems.slice(skip, skip + limit) as T[];
    const hasNext = skip + limit < totalCount;
    const currentPage = Math.floor(skip / limit);
    const nextSkip = hasNext ? skip + limit : null;

    return {
      items: pagedItems,
      totalCount,
      hasNext,
      currentPage,
      pageSize: limit,
      nextSkip,
    };
  }

  static async getById<T>(collectionId: string, id: string): Promise<T | null> {
    const col = collectionId.toLowerCase();
    if (col === 'repositories') {
      return (await RepositoryStore.getById(id)) as T | null;
    }
    if (col === 'scanhistory' || col === 'scans') {
      return (await ScanStore.getById(id)) as T | null;
    }
    if (col === 'securityfindings' || col === 'findings') {
      return (await FindingStore.getById(id)) as T | null;
    }
    if (col === 'pipelines') {
      return (await PipelineStore.getById(id)) as T | null;
    }
    if (col === 'reports') {
      return (await ReportStore.getById(id)) as T | null;
    }
    return null;
  }

  static async create<T>(
    collectionId: string,
    itemData: Partial<T> | Record<string, any>
  ): Promise<T> {
    const col = collectionId.toLowerCase();
    if (col === 'repositories') {
      return (await RepositoryStore.save(itemData as any)) as T;
    }
    if (col === 'scanhistory' || col === 'scans') {
      return (await ScanStore.save(itemData as any)) as T;
    }
    if (col === 'securityfindings' || col === 'findings') {
      return (await FindingStore.save(itemData as any)) as T;
    }
    if (col === 'pipelines') {
      return (await PipelineStore.save(itemData as any)) as T;
    }
    if (col === 'reports') {
      return (await ReportStore.save(itemData as any)) as T;
    }
    return itemData as T;
  }

  static async update<T>(
    collectionId: string,
    itemData: Partial<T> | Record<string, any>
  ): Promise<T> {
    return this.create<T>(collectionId, itemData);
  }

  static async delete(collectionId: string, id: string): Promise<void> {
    const col = collectionId.toLowerCase();
    if (col === 'repositories') await RepositoryStore.delete(id);
    else if (col === 'scanhistory' || col === 'scans') await ScanStore.delete(id);
    else if (col === 'securityfindings' || col === 'findings') await FindingStore.delete(id);
    else if (col === 'pipelines') await PipelineStore.delete(id);
  }
}