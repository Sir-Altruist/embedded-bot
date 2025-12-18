(function() {
  'use strict';

  // Namespace to avoid conflicts
  window.SonaChatEmbed = window.SonaChatEmbed || {};

  // Configuration
  const CONFIG = {
    containerId: 'sona-chat-embed',
    iframeId: 'sona-chat-iframe'
  };

  /**
   * Initialize the Sona Chat embed
   * @param {Object} options - Configuration options
   * @param {string} options.url - URL of the chat embed page (optional)
   * @param {string} options.containerId - ID of the container element (optional)
   */
  window.SonaChatEmbed.init = function(options) {
    options = options || {};
    
    const containerId = options.containerId || CONFIG.defaultId;

    // Create or get container
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = CONFIG.iframeId;
    iframe.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 999999;
      pointer-events: none;
      background: transparent;
    `;
    
    // Allow clicks to pass through except on chat widget
    iframe.setAttribute('allow', 'autoplay; camera; microphone');
    iframe.setAttribute('scrolling', 'no');

    // Make chat elements interactive while keeping rest transparent
    iframe.addEventListener('load', function() {
      // The iframe content will handle its own pointer events
      iframe.contentWindow.postMessage({ 
        type: 'SONA_CHAT_READY',
        origin: window.location.origin 
      }, '*');
    });

    // Inject styles for the iframe container
    const style = document.createElement('style');
    style.textContent = `
      #${containerId} {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
      }
      #${CONFIG.iframeId} * {
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);

    // Clear container and add iframe
    container.innerHTML = '';
    container.appendChild(iframe);

    console.log('✅ Sona Chat embedded successfully');
    
    return {
      iframe: iframe,
      container: container,
      destroy: function() {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
        console.log('🗑️ Sona Chat embed removed');
      }
    };
  };

  // Auto-initialize if data attribute is present
  document.addEventListener('DOMContentLoaded', function() {
    const autoInit = document.querySelector('[data-sona-chat-embed]');
    if (autoInit) {
      const url = autoInit.getAttribute('data-sona-chat-url');
      window.SonaChatEmbed.init({ url: url });
    }
  });

})();