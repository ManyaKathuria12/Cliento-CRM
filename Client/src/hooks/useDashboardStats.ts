import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

type Stats = {
  totalLeads: number;
  totalDeals: number;
  totalContacts: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  wonDeals: number;
  activeDeals: number;
  revenue: number;
  conversionRate: number;
};

const API_BASE = import.meta.env.DEV ? "http://localhost:5000" : "";

export default function useDashboardStats(pollInterval = 5000) {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollingRef = useRef<number | null>(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/public/stats`);
      setData(res.data as Stats);
      setError(null);
    } catch (err: any) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    try {
      const socket = io(API_BASE || "http://localhost:5000");
      socketRef.current = socket;

      socket.on("connect", () => {
        fetchStats();
      });

      socket.on("dashboardUpdated", () => {
        fetchStats();
      });

      socket.on("tasksUpdated", () => {
        fetchStats();
      });

      const fallback = setTimeout(() => {
        if (!socket.connected) {
          pollingRef.current = window.setInterval(fetchStats, pollInterval);
        }
      }, 1500);

      return () => {
        clearTimeout(fallback);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
        socket.disconnect();
      };
    } catch (e) {
      pollingRef.current = window.setInterval(fetchStats, pollInterval);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, []);

  return { data, loading, error, refetch: fetchStats };
}
