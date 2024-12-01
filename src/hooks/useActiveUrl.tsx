// src/hooks/useActiveTabUrl.ts
import { useState, useEffect } from 'react';

export const useActiveTabUrl = () => {
  const [url, setUrl] = useState<string>('');

  const getActiveTabUrl = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getActiveTabUrl" });
      setUrl(response.url);
      console.log(response.url);
    } catch (error) {
      console.error('Error getting active tab URL:', error);
    }
  };

  useEffect(() => {
    getActiveTabUrl();

    const tabChangeListener = () => {
      getActiveTabUrl();
    };

    // Listen for tab changes and URL updates
    chrome.tabs.onActivated.addListener(tabChangeListener);
    chrome.tabs.onUpdated.addListener(tabChangeListener);

    // Cleanup listeners on unmount
    return () => {
      chrome.tabs.onActivated.removeListener(tabChangeListener);
      chrome.tabs.onUpdated.removeListener(tabChangeListener);
    };
  }, []);

  return url;
};