import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

export type PreviewRecord = {
  id: string;
  label: string;
  status?: string;
  stage?: string;
  role?: string;
  due?: string;
  createdAt?: string;
};

export type ActivityData = {
  leads: PreviewRecord[];
  deals: PreviewRecord[];
  tasks: PreviewRecord[];
  contacts: PreviewRecord[];
};

const POLL_MS = 30000;

export default function useLiveActivity(refreshMs = POLL_MS) {
  const [leads, setLeads] = useState<PreviewRecord[]>([]);
  const [deals, setDeals] = useState<PreviewRecord[]>([]);
  const [tasks, setTasks] = useState<PreviewRecord[]>([]);
  const [contacts, setContacts] = useState<PreviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoad = useRef(true);

  function idToDate(id: string) {
    try {
      return new Date(parseInt(id.substring(0, 8), 16) * 1000);
    } catch {
      return new Date();
    }
  }

  const timeAgo = (date?: string | Date | null, id?: string) => {
    try {
      const d = date ? new Date(date) : id ? idToDate(id) : new Date();
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  const fetchAll = useCallback(async () => {
    if (initialLoad.current) setLoading(true);
    try {
      const res = await axios.get<ActivityData>("/api/public/activity");
      setLeads(res.data.leads || []);
      setDeals(res.data.deals || []);
      setTasks(res.data.tasks || []);
      setContacts(res.data.contacts || []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load activity");
    } finally {
      if (initialLoad.current) {
        setLoading(false);
        initialLoad.current = false;
      }
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = window.setInterval(fetchAll, refreshMs);
    return () => clearInterval(interval);
  }, [fetchAll, refreshMs]);

  return {
    leads,
    deals,
    tasks,
    contacts,
    loading,
    error,
    refetch: fetchAll,
    timeAgo,
  };
}
