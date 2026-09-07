import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { settingsApi } from "../services/api";
import { formatMoney, currencySymbol as symbolFor, setCurrentCurrency } from "../utils/money";

const SettingsContext = createContext(null);

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await settingsApi.getAll();
      const data = res.data || {};
      setSettings(data);
      setCurrentCurrency(data.currency);
    } catch {
      // storefront still works with the default currency
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currency = (settings.currency || "NPR").toUpperCase();
  const money = useCallback((amount) => formatMoney(amount, currency), [currency]);
  const symbol = symbolFor(currency);
  const freeShippingThreshold = Number(settings.free_shipping_threshold) || 0;
  const shippingFee = Number(settings.shipping_fee_standard) || 0;

  return (
    <SettingsContext.Provider
      value={{ settings, currency, symbol, money, freeShippingThreshold, shippingFee, loading, reloadSettings: load }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

function useMoney() {
  return useSettings().money;
}

export { SettingsProvider, useSettings, useMoney };
