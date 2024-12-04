// Capture the url of current active tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getActiveTabUrl") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || '';
        sendResponse({ url });
      });
      return true; // Will respond asynchronously
    }
  });

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

self.addEventListener('message', async (event) => {
  if (event.data.type === 'SUMMARIZE_REQUEST') {
    try {
      const summary = await chromeAISummarizeText(event.data.text);
      
      // Send result back to the client
      event.source?.postMessage({
        type: 'SUMMARIZE_RESULT',
        summary: summary,
      });
    } catch (error) {
      event.source?.postMessage({
        type: 'SUMMARIZE_ERROR',
        error: error.message,
      });
    }
  }
});

// Modify your existing function to return the summary
async function chromeAISummarizeText(textToSummarize) {
  if (!textToSummarize) return null;

  try {
    const summarizer = await ai.summarizer.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
        });
      }
    });

    const summarizerCapabilities = await summarizer.capabilities();
    if (summarizerCapabilities.available === 'no') {
      throw new Error('Text Summarizer API available in this browser.');
    }

    const keyPointsSummarizer = await summarizer.create({ 
      type: 'key-points', 
      format: 'mark-down' 
    });
    
    const summary = await keyPointsSummarizer.summarize(textToSummarize);
    console.log(summary)
    return summary;
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
}