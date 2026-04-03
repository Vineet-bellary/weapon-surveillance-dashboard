import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { dismissAlert, getAlerts } from "../api/alerts";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const seenAlertIdsRef = useRef(new Set());
  const mountedAtRef = useRef(Date.now());
  const REALTIME_WINDOW_MS = 8000;

  const isFreshAlert = (alert) => {
    const createdAtMs = Date.parse(alert.created_at || "");
    if (Number.isNaN(createdAtMs)) {
      return false;
    }
    return createdAtMs >= mountedAtRef.current;
  };

  const refreshAlerts = useCallback(async () => {
    try {
      const data = await getAlerts(20);
      if (!Array.isArray(data)) {
        setAlerts([]);
        return;
      }

      const now = Date.now();
      const freshUnseen = data.filter(
        (alert) =>
          isFreshAlert(alert) &&
          !seenAlertIdsRef.current.has(alert.id) &&
          now - Date.parse(alert.created_at || "") <= REALTIME_WINDOW_MS,
      );

      if (freshUnseen.length === 0) {
        setAlerts([]);
        return;
      }

      // Real-time toast mode: show only the latest unseen alert, do not replay backlog.
      const latest = freshUnseen[0];
      freshUnseen.forEach((alert) => seenAlertIdsRef.current.add(alert.id));
      seenAlertIdsRef.current.delete(latest.id);
      setAlerts([latest]);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    }
  }, []);

  const dismiss = useCallback(async (id) => {
    seenAlertIdsRef.current.add(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));

    try {
      await dismissAlert(id);
    } catch (error) {
      console.error("Failed to dismiss alert", error);
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
    const timer = setInterval(refreshAlerts, 3000);
    return () => clearInterval(timer);
  }, [refreshAlerts]);

  const value = useMemo(
    () => ({
      alerts,
      dismiss,
      refreshAlerts,
    }),
    [alerts, dismiss, refreshAlerts],
  );

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlerts must be used inside AlertProvider");
  }
  return ctx;
}
