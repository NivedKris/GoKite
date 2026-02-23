import { useState, useCallback } from 'react';

/**
 * Generic async data-fetching hook.
 * @param {Function} fetchFn  – async function that returns data
 * @returns {{ data, loading, error, execute }}
 */
export function useApi(fetchFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'Unknown error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchFn]
  );

  return { data, loading, error, execute };
}
