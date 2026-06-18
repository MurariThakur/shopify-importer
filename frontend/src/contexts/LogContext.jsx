import { createContext, useCallback, useContext, useState } from 'react';
import api from '../lib/axios';

const LogContext = createContext(null);

export function LogProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ level: '', uploadId: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async ({ level, page } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (level) params.level = level;
      if (page) params.page = page;
      const { data } = await api.get('/logs', { params });
      setLogs(data.data);
      if (data.meta) setPagination(data.meta);
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUploadLogs = useCallback(async (uploadId, { level, page } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (level) params.level = level;
      if (page) params.page = page;
      const { data } = await api.get(`/uploads/${uploadId}/logs`, { params });
      setLogs(data.data);
      if (data.meta) setPagination(data.meta);
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ level: '', uploadId: null });
  }, []);

  return (
    <LogContext.Provider value={{
      logs, pagination, filters, loading, error,
      fetchLogs, fetchUploadLogs, setFilter, clearFilters,
    }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error('useLogs must be used within LogProvider');
  return ctx;
}
