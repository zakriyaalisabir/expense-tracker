"use client";
import { useAppStore } from "./store";

export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupEventListeners();
      this.startSyncInterval();
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline() {
    this.isOnline = true;
    useAppStore.getState().setOfflineMode(false);
    this.syncOfflineData();
  }

  private handleOffline() {
    this.isOnline = false;
    useAppStore.getState().setOfflineMode(true);
  }

  private startSyncInterval() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncOfflineData();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  private async syncOfflineData() {
    try {
      await useAppStore.getState().syncOfflineData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
  }
}

// Hook for using offline manager in components
export function useOfflineManager() {
  const offlineManager = OfflineManager.getInstance();
  const { isOffline, syncOfflineData } = useAppStore();

  return {
    isOffline,
    isOnline: !isOffline,
    syncData: syncOfflineData,
    offlineManager
  };
}