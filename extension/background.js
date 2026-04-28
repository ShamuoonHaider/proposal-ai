// Proposal AI — Background Service Worker
// Handles API calls and token management for content scripts

const API_BASE_URL_DEFAULT = 'https://proposal-ai-navy.vercel.app';

async function getApiBaseUrl() {
  const result = await chrome.storage.local.get(['apiBaseUrl']);
  return result.apiBaseUrl || API_BASE_URL_DEFAULT;
}

async function getToken() {
  const result = await chrome.storage.local.get(['token']);
  return result.token || null;
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_AUTH') {
    getToken().then((token) => {
      sendResponse({ authenticated: !!token });
    });
    return true; // async response
  }

  if (message.type === 'GENERATE_PROPOSAL') {
    handleGenerateProposal(message.data, sender.tab?.id)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // async response
  }
});

// Generate proposal via SSE streaming
async function handleGenerateProposal(jobData, tabId) {
  const token = await getToken();
  if (!token) {
    return { success: false, error: 'Not authenticated. Please sign in via the extension popup.' };
  }

  const apiBaseUrl = await getApiBaseUrl();

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/generate-proposal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        job_title: jobData.job_title,
        job_details: jobData.job_details,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      let errorMsg = 'Failed to generate proposal';
      if (res.status === 401) {
        errorMsg = 'Authentication failed. Please sign in again.';
        await chrome.storage.local.remove(['token', 'userEmail']);
      } else if (res.status === 422) {
        errorMsg = data.detail
          ? Array.isArray(data.detail)
            ? data.detail.map((d) => d.msg).join(', ')
            : data.detail
          : errorMsg;
      } else if (res.status === 503) {
        errorMsg = 'AI service unavailable. Try again later.';
      } else if (data.message) {
        errorMsg = data.message;
      }
      return { success: false, error: errorMsg };
    }

    // Handle SSE stream
    if (!res.body) {
      return { success: false, error: 'Streaming not supported' };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullProposal = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(':')) continue;

        const dataStr = trimmedLine.startsWith('data: ')
          ? trimmedLine.slice(6)
          : trimmedLine;

        try {
          const event = JSON.parse(dataStr);

          if (event.type === 'token' && event.content) {
            fullProposal += event.content;
            // Send streaming token to the content script
            if (tabId) {
              chrome.tabs.sendMessage(tabId, {
                type: 'PROPOSAL_TOKEN',
                content: event.content,
                fullProposal,
              });
            }
          } else if (event.type === 'complete') {
            if (event.proposal) fullProposal = event.proposal;
            if (tabId) {
              chrome.tabs.sendMessage(tabId, {
                type: 'PROPOSAL_COMPLETE',
                proposal: fullProposal,
              });
            }
            return { success: true, proposal: fullProposal };
          } else if (event.type === 'error') {
            if (tabId) {
              chrome.tabs.sendMessage(tabId, {
                type: 'PROPOSAL_ERROR',
                error: event.message || 'Generation failed',
              });
            }
            return { success: false, error: event.message || 'Generation failed' };
          }
        } catch (e) {
          // skip unparseable lines
        }
      }
    }

    // If stream ended without a complete event
    if (fullProposal) {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          type: 'PROPOSAL_COMPLETE',
          proposal: fullProposal,
        });
      }
      return { success: true, proposal: fullProposal };
    }

    return { success: false, error: 'No proposal received' };
  } catch (err) {
    return {
      success: false,
      error: err.message?.includes('Failed to fetch')
        ? 'Unable to connect to server.'
        : err.message || 'Failed to generate proposal',
    };
  }
}
