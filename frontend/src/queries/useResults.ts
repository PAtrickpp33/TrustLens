import { useCallback, useState } from 'react';
import { fetchResultsService, ResultsResponse } from '@/services/results';

export function useResults() {
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchResultsService();
      setData(response);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchResults } as const;
}


