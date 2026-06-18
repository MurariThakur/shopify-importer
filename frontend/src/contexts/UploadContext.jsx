import { createContext, useCallback, useContext, useState } from 'react';
import api from '../lib/axios';

const UploadContext = createContext(null);

export function UploadProvider({ children }) {
  const [uploads, setUploads] = useState([]);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [products, setProducts] = useState([]);
  const [liveStatus, setLiveStatus] = useState(null);
  const [pagination, setPagination] = useState({});
  const [productPagination, setProductPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUploads = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/uploads?page=${page}`);
      setUploads(data.data);
      if (data.meta) setPagination(data.meta);
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUpload = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/uploads/${id}`);
      setCurrentUpload(data.data);
      return data.data;
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/uploads/${id}/status`);
      setLiveStatus(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchProducts = useCallback(async (id, { status, page } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status) params.status = status;
      if (page) params.page = page;
      const { data } = await api.get(`/uploads/${id}/products`, { params });
      setProducts(data.data);
      if (data.meta) setProductPagination(data.meta);
      return data.data;
    } catch (err) {
      setError(err.displayMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitUpload = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch (err) {
      setError(err.displayMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <UploadContext.Provider value={{
      uploads, currentUpload, products, liveStatus,
      pagination, productPagination, loading, error,
      fetchUploads, fetchUpload, fetchStatus, fetchProducts,
      submitUpload, clearError,
    }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used within UploadProvider');
  return ctx;
}
