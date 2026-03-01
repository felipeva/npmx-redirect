import { storage } from 'wxt/utils/storage';

export interface ExcludedSite {
  id: string;
  hostname: string;
}

export const enabledItem = storage.defineItem<boolean>('local:enabled', {
  fallback: true,
});

export const DEFAULT_EXCLUDED: ExcludedSite[] = [{ id: 'npmjs', hostname: 'npmjs.com' }];

export const excludedSitesItem = storage.defineItem<ExcludedSite[]>('local:excludedSites', {
  fallback: DEFAULT_EXCLUDED,
});
