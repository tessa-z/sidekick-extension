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
