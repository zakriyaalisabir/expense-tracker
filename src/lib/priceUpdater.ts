// Mock price updater for investments
import { useAppStore } from "./store";

export class PriceUpdater {
  private static instance: PriceUpdater;
  private updateInterval: NodeJS.Timeout | null = null;

  static getInstance(): PriceUpdater {
    if (!PriceUpdater.instance) {
      PriceUpdater.instance = new PriceUpdater();
    }
    return PriceUpdater.instance;
  }

  startAutoUpdate() {
    // Update prices every 5 minutes
    this.updateInterval = setInterval(() => {
      this.updateInvestmentPrices();
    }, 5 * 60 * 1000);
  }

  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateInvestmentPrices() {
    const { investments, updateInvestment } = useAppStore.getState();
    
    for (const investment of investments.filter(i => i.is_active)) {
      // Mock price changes (-5% to +5%)
      const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5%
      const currentPrice = investment.current_price || investment.purchase_price;
      const newPrice = currentPrice * (1 + changePercent);
      
      await updateInvestment({
        ...investment,
        current_price: Math.round(newPrice * 100) / 100 // Round to 2 decimals
      });
    }
  }

  // Manual price update for specific investment
  async updateSinglePrice(investmentId: string, newPrice: number) {
    const { investments, updateInvestment } = useAppStore.getState();
    const investment = investments.find(i => i.id === investmentId);
    
    if (investment) {
      await updateInvestment({
        ...investment,
        current_price: newPrice
      });
    }
  }
}

// Hook for components
export function usePriceUpdater() {
  const priceUpdater = PriceUpdater.getInstance();
  
  return {
    startAutoUpdate: () => priceUpdater.startAutoUpdate(),
    stopAutoUpdate: () => priceUpdater.stopAutoUpdate(),
    updatePrice: (id: string, price: number) => priceUpdater.updateSinglePrice(id, price)
  };
}