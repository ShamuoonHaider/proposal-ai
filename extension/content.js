// Proposal AI — Content Script
// Injects UI into Upwork pages for job scanning and proposal generation

(function () {
  'use strict';

  // Prevent double injection
  if (window.__proposalAIInjected) return;
  window.__proposalAIInjected = true;

  let resultPanel = null;
  let isGenerating = false;

  // =====================================
  // PAGE DETECTION
  // =====================================

  function isJobSearchPage() {
    const url = window.location.href;
    return (
      url.includes('/nx/find-work') ||
      url.includes('/nx/search/jobs') ||
      url.includes('/nx/jobs/search') ||
      url.includes('/search/jobs')
    );
  }

  function isJobDetailPage() {
    const url = window.location.href;
    return (
      url.includes('/nx/proposals/job/') ||
      url.includes('/freelancers/proposals/') ||
      url.includes('/jobs/~') ||
      url.includes('/nx/apply/') ||
      (url.includes('/ab/proposals/job/') && true)
    );
  }

  // =====================================
  // JOB DATA EXTRACTION
  // =====================================

  function extractJobsFromSearchPage() {
    const jobs = [];
    // Upwork job card selectors
    const jobCards = document.querySelectorAll(
      '[data-test="job-tile-list"] article, ' +
      '.job-tile, ' +
      '[data-ev-label="search_results_impression"], ' +
      'section.air3-card-section'
    );

    jobCards.forEach((card) => {
      const titleEl =
        card.querySelector('h2 a, h3 a, .job-tile-title a, [data-test="job-tile-title-link"], a.up-n-link') ||
        card.querySelector('h2, h3');
      const title = titleEl ? titleEl.textContent.trim() : 'Untitled';
      jobs.push(title);
    });

    return jobs;
  }

  function extractJobFromDetailPage() {
    // Job Title
    const titleEl =
      document.querySelector('[data-test="job-details-header"] h2') ||
      document.querySelector('h1.m-0-bottom, header h1, h1, .job-details-header h2') ||
      document.querySelector('[class*="jobTitle"], [class*="job-title"]') ||
      document.querySelector('h2');

    // Job Description
    const descEl =
      document.querySelector('[data-test="job-description-text"]') ||
      document.querySelector('.job-description, [class*="description"], .text-body-sm') ||
      document.querySelector('[data-cy="job-description"]') ||
      document.querySelector('.break.mt-2');

    // Job Type (Fixed/Hourly)
    const typeEl =
      document.querySelector('[data-test="job-type"]') ||
      document.querySelector('[class*="job-type"], .cfe-ui-budget-type') ||
      document.querySelector('small[data-cy="fixed-price"], small[data-cy="hourly"]');

    // Fallback: look for typical keywords
    let jobType = 'Not specified';
    if (typeEl) {
      jobType = typeEl.textContent.trim();
    } else {
      const pageText = document.body.innerText.toLowerCase();
      if (pageText.includes('fixed-price') || pageText.includes('fixed price')) {
        jobType = 'Fixed-price';
      } else if (pageText.includes('hourly')) {
        jobType = 'Hourly';
      }
    }

    const title = titleEl ? titleEl.textContent.trim() : '';
    const description = descEl ? descEl.textContent.trim() : '';

    return { title, description, jobType };
  }

  // =====================================
  // UI INJECTION — FLOATING BUTTONS
  // =====================================

  function createFloatingButton(text, icon, onClick) {
    const btn = document.createElement('button');
    btn.className = 'proposalai-fab';
    btn.innerHTML = `<span class="proposalai-fab-icon">${icon}</span> ${text}`;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function removeExistingButtons() {
    document.querySelectorAll('.proposalai-fab').forEach((el) => el.remove());
  }

  function injectSearchPageButton() {
    removeExistingButtons();
    const btn = createFloatingButton('Scan Jobs', '📋', () => {
      const jobs = extractJobsFromSearchPage();
      if (jobs.length === 0) {
        showToast('No jobs found on this page. Try scrolling to load more.', 'warning');
        return;
      }
      showToast(`Found ${jobs.length} job(s) on this page`, 'success');
    });
    document.body.appendChild(btn);
  }

  function injectDetailPageButton() {
    removeExistingButtons();
    const btn = createFloatingButton('Write Proposal', '✨', async () => {
      if (isGenerating) return;

      // Check auth first
      const authResult = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, resolve);
      });

      if (!authResult?.authenticated) {
        showToast('Please sign in via the Proposal AI extension popup first.', 'error');
        return;
      }

      const jobData = extractJobFromDetailPage();

      if (!jobData.title && !jobData.description) {
        showToast('Could not detect job details on this page. Try refreshing.', 'error');
        return;
      }

      // Show result panel and start generating
      showResultPanel(jobData);
      isGenerating = true;
      updatePanelState('generating');

      chrome.runtime.sendMessage(
        {
          type: 'GENERATE_PROPOSAL',
          data: {
            job_title: jobData.title,
            job_details: `${jobData.description}\n\nJob Type: ${jobData.jobType}`,
          },
        },
        (response) => {
          if (!response?.success && response?.error) {
            updatePanelState('error', response.error);
          }
          isGenerating = false;
        }
      );
    });
    document.body.appendChild(btn);
  }

  // =====================================
  // RESULT PANEL
  // =====================================

  function showResultPanel(jobData) {
    // Remove existing panel
    if (resultPanel) resultPanel.remove();

    resultPanel = document.createElement('div');
    resultPanel.className = 'proposalai-panel';
    resultPanel.innerHTML = `
      <div class="proposalai-panel-header">
        <div class="proposalai-panel-title">
          <span class="proposalai-panel-icon">⚡</span>
          Proposal AI
        </div>
        <button class="proposalai-panel-close" id="proposalai-close">✕</button>
      </div>
      <div class="proposalai-panel-job">
        <div class="proposalai-panel-job-label">GENERATING FOR</div>
        <div class="proposalai-panel-job-title">${escapeHtml(jobData.title || 'Job Detail')}</div>
        <div class="proposalai-panel-job-type">${escapeHtml(jobData.jobType)}</div>
      </div>
      <div class="proposalai-panel-content" id="proposalai-content">
        <div class="proposalai-panel-loading">
          <div class="proposalai-spinner"></div>
          <span>Generating your proposal...</span>
        </div>
      </div>
      <div class="proposalai-panel-actions" id="proposalai-actions" style="display:none;">
        <button class="proposalai-btn proposalai-btn-copy" id="proposalai-copy">
          📋 Copy to Clipboard
        </button>
        <button class="proposalai-btn proposalai-btn-fill" id="proposalai-fill">
          📝 Auto-fill Upwork
        </button>
      </div>
    `;

    document.body.appendChild(resultPanel);

    // Close button
    resultPanel.querySelector('#proposalai-close').addEventListener('click', () => {
      resultPanel.remove();
      resultPanel = null;
    });
  }

  function updatePanelState(state, data) {
    if (!resultPanel) return;
    const content = resultPanel.querySelector('#proposalai-content');
    const actions = resultPanel.querySelector('#proposalai-actions');

    if (state === 'generating') {
      content.innerHTML = `
        <div class="proposalai-panel-loading">
          <div class="proposalai-spinner"></div>
          <span>Generating your proposal...</span>
        </div>
      `;
      actions.style.display = 'none';
    }

    if (state === 'streaming') {
      content.innerHTML = `<div class="proposalai-panel-text">${escapeHtml(data)}<span class="proposalai-cursor">|</span></div>`;
      actions.style.display = 'none';
    }

    if (state === 'complete') {
      content.innerHTML = `<div class="proposalai-panel-text">${escapeHtml(data)}</div>`;
      actions.style.display = 'flex';
      bindPanelActions(data);
    }

    if (state === 'error') {
      content.innerHTML = `
        <div class="proposalai-panel-error">
          <span>❌</span>
          <span>${escapeHtml(data)}</span>
        </div>
      `;
      actions.style.display = 'none';
    }
  }

  function bindPanelActions(proposalText) {
    if (!resultPanel) return;

    const copyBtn = resultPanel.querySelector('#proposalai-copy');
    const fillBtn = resultPanel.querySelector('#proposalai-fill');

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(proposalText).then(() => {
        copyBtn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '📋 Copy to Clipboard';
        }, 2000);
      });
    });

    fillBtn.addEventListener('click', () => {
      // Try to find the Upwork proposal textarea and fill it
      const textarea =
        document.querySelector('[data-test="textarea-proposal"]') ||
        document.querySelector('textarea[name="coverLetter"]') ||
        document.querySelector('.up-textarea textarea') ||
        document.querySelector('textarea.cover-letter-area') ||
        document.querySelector('textarea');

      if (textarea) {
        // Use native input setter to trigger React/Angular change detection
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeInputValueSetter.call(textarea, proposalText);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        showToast('Proposal auto-filled!', 'success');
      } else {
        showToast('Could not find the proposal textarea. Please paste manually.', 'warning');
      }
    });
  }

  // =====================================
  // LISTEN FOR STREAMING MESSAGES FROM BACKGROUND
  // =====================================

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PROPOSAL_TOKEN') {
      updatePanelState('streaming', message.fullProposal);
    }
    if (message.type === 'PROPOSAL_COMPLETE') {
      updatePanelState('complete', message.proposal);
      isGenerating = false;
    }
    if (message.type === 'PROPOSAL_ERROR') {
      updatePanelState('error', message.error);
      isGenerating = false;
    }
  });

  // =====================================
  // TOAST NOTIFICATIONS
  // =====================================

  function showToast(message, type = 'info') {
    const existing = document.querySelector('.proposalai-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `proposalai-toast proposalai-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('proposalai-toast-visible'), 50);
    setTimeout(() => {
      toast.classList.remove('proposalai-toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =====================================
  // UTILITIES
  // =====================================

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // =====================================
  // INITIALIZATION + URL CHANGE DETECTION
  // =====================================

  function init() {
    // Small delay to let the page render
    setTimeout(() => {
      if (isJobSearchPage()) {
        injectSearchPageButton();
      } else if (isJobDetailPage()) {
        injectDetailPageButton();
      }
    }, 1500);
  }

  // Watch for SPA navigation (Upwork uses client-side routing)
  let lastUrl = window.location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      // Re-initialize on route change
      setTimeout(init, 1000);
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });

  // Initial run
  init();
})();
