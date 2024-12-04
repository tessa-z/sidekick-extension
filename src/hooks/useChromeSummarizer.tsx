import { useState, useEffect, useCallback } from 'react';

interface SummarizerResult {
  summary: string | null;
  loading: boolean;
  error: string | null;
}

export const useChromeSummarizer = (): [
  SummarizerResult,
  (text: string) => Promise<void>
] => {
  const [state, setState] = useState<SummarizerResult>({
    summary: null,
    loading: false,
    error: null,
  });

  // Set up message listener when component mounts
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SUMMARIZE_RESULT') {
        setState({
          summary: event.data.summary,
          loading: false,
          error: null,
        });
      } else if (event.data.type === 'SUMMARIZE_ERROR') {
        setState({
          summary: null,
          loading: false,
          error: event.data.error,
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Function to trigger summarization
  const summarizeText = useCallback(async (text: string) => {
    setState({ ...state, loading: true, error: null });

    try {
      // Ensure service worker is ready
      const registration = await navigator.serviceWorker.ready;
      
      // Send message to service worker
      registration.active?.postMessage({
        type: 'SUMMARIZE_REQUEST',
        text: text,
      });
    } catch (error) {
      setState({
        summary: null,
        loading: false,
        error: 'Failed to communicate with service worker',
      });
    }
  }, [state]);

  return [state, summarizeText];
};