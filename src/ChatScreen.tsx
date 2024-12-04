import React, { useState, useEffect, useCallback } from "react";
import { useActiveTabUrl } from "./hooks/useActiveUrl";
import TextField from "@mui/material/TextField";
import { Box, Button, Grid2, Icon, Stack } from "@mui/material";
import ReactMarkdown from "react-markdown";

interface SummarizerResult {
  summary: string | null;
  loading: boolean;
  error: string | null;
}

type SummarizeFunction = (text: string) => Promise<void>;

const useChromeSummarizer = (): [SummarizerResult, SummarizeFunction] => {
  const [state, setState] = useState<SummarizerResult>({
    summary: null,
    loading: false,
    error: null,
  });

  const summarizeText: SummarizeFunction = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
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
  }, []);

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

  return [state, summarizeText];
};

function ChatScreen() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tab_url = useActiveTabUrl();
  const [prompt, setPrompt] = useState<string>(
    "Hello! Quote a line from content you just read."
  );
  const [{ summary, loading: summaryLoading, error: summaryError }, summarize] = useChromeSummarizer();

  // Register service worker on component mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('ServiceWorker registration successful'))
        .catch(err => console.log('ServiceWorker registration failed: ', err));
    }
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const handleClick = async () => {
    if (content) {
      await summarize(content);
    }
    alert('clicked');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("tab_url: " + tab_url);
        const response = await fetch(tab_url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const text = await response.text();

        if (text) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/html");
          const bodyText = doc.body.textContent || "";

          setContent(bodyText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tab_url]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid2>
      <Stack padding={2}>
        Gemini for Chrome+
        <Box padding={2} width={3 / 4}>
          {summaryLoading && <div>Summarizing...</div>}
          {summaryError && <div>Error: {summaryError}</div>}
          {summary && <ReactMarkdown>{summary}</ReactMarkdown>}
        </Box>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <TextField
            id="input-box"
            variant="outlined"
            multiline
            maxRows={4}
            onChange={handleChange}
            value={prompt}
          />
          <Button 
            variant="contained" 
            onClick={handleClick}
            disabled={summaryLoading}
          >
            ?
          </Button>
        </Stack>
      </Stack>
    </Grid2>
  );
}

export default ChatScreen;