import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const API_BASE = import.meta.env.DEV ? "http://localhost:5000" : "";

type PreviewRecord = {
  id: string;
  label: string;
  status?: string;
  stage?: string;
  role?: string;
  due?: string;
  createdAt?: string;
};

type ActivityResponse = {
  leads: PreviewRecord[];
  deals: PreviewRecord[];
  tasks: PreviewRecord[];
  contacts: PreviewRecord[];
  tasksDueToday: number;
  contactsThisMonth: number;
};

export default function useLiveActivity(refreshMs = 30000) {
  const [leads, setLeads] = useState<PreviewRecord[] | null>(null);
  const [deals, setDeals] = useState<PreviewRecord[] | null>(null);
  const [tasks, setTasks] = useState<PreviewRecord[] | null>(null);
  const [contacts, setContacts] = useState<PreviewRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tasksDueToday, setTasksDueToday] = useState(0);
  const [contactsThisMonth, setContactsThisMonth] = useState(0);

  function idToDate(id: string) {
    try {
      const ts = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(ts);
    } catch (e) {
      return new Date();
    }
  }

  const timeAgo = (date?: string | Date | null, id?: string) => {
    try {
      const d = date ? new Date(date) : id ? idToDate(id) : new Date();
      return formatDistanceToNow(d, { addSuffix: true });
    } catch (e) {
      return "just now";
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get<ActivityResponse>(`${API_BASE}/api/public/activity`);
      const data = res.data;

      setLeads(data.leads);
      setDeals(data.deals);
      setTasks(data.tasks);
      setContacts(data.contacts);
      setTasksDueToday(data.tasksDueToday);
      setContactsThisMonth(data.contactsThisMonth);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    try {
      const socket = io(API_BASE || "http://localhost:5000");
      socketRef.current = socket;

      socket.on("connect", () => {
        fetchAll();
      });

      socket.on("dashboardUpdated", () => fetchAll());
      socket.on("tasksUpdated", () => fetchAll());

      const fallback = setTimeout(() => {
        if (!socket.connected) {
          pollRef.current = window.setInterval(fetchAll, refreshMs);
        }
      }, 1500);

      return () => {
        clearTimeout(fallback);
        if (pollRef.current) clearInterval(pollRef.current);
        try { socket.disconnect(); } catch (e) {}
      };
    } catch (e) {
      pollRef.current = window.setInterval(fetchAll, refreshMs);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
  }, []);

  return {
    leads,
    deals,
    tasks,
    contacts,
    loading,
    error,
    refetch: fetchAll,
    timeAgo,
    lastUpdated,
    tasksDueToday,
    contactsThisMonth,
  };
}
