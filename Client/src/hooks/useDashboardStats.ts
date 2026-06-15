import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

export type OverviewStats = {
  totalLeads: number;
  activeDeals: number;
  totalRevenue: number;
  conversionRate: number;
  tasksDueToday: number;
  newContacts: number;
};

const POLL_MS = 30000;

export default function useDashboardStats(pollInterval = POLL_MS) {
  const [data, setData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoad = useRef(true);

  const fetchStats = useCallback(async () => {
    if (initialLoad.current) setLoading(true);
    try {
      const res = await axios.get<OverviewStats>("/api/public/overview");
      setData(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load overview");
    } finally {
      if (initialLoad.current) {
        setLoading(false);
        initialLoad.current = false;
      }
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = window.setInterval(fetchStats, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStats, pollInterval]);

  return { data, loading, error, refetch: fetchStats };
}
