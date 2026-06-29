import { AsyncLocalStorage } from 'async_hooks';

export interface AppStore {
  appId: string;
}

export const appStorage = new AsyncLocalStorage<AppStore>();
