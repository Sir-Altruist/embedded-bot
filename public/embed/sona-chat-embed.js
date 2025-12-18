// // (function() {
// //   'use strict';

// //   // Namespace to avoid conflicts
// //   window.SonaChatEmbed = window.SonaChatEmbed || {};

// //   // Configuration
// //   const CONFIG = {
// //     containerId: 'sona-chat-embed',
// //     iframeId: 'sona-chat-iframe'
// //   };

// //   /**
// //    * Initialize the Sona Chat embed
// //    * @param {Object} options - Configuration options
// //    * @param {string} options.url - URL of the chat embed page (optional)
// //    * @param {string} options.containerId - ID of the container element (optional)
// //    */
// //   window.SonaChatEmbed.init = function(options) {
// //     options = options || {};
    
// //     const containerId = options.containerId || CONFIG.defaultId;

// //     // Create or get container
// //     let container = document.getElementById(containerId);
// //     if (!container) {
// //       container = document.createElement('div');
// //       container.id = containerId;
// //       document.body.appendChild(container);
// //     }

// //     // Create iframe
// //     const iframe = document.createElement('iframe');
// //     iframe.id = CONFIG.iframeId;
// //     iframe.style.cssText = `
// //       position: fixed;
// //       bottom: 0;
// //       right: 0;
// //       width: 100%;
// //       height: 100%;
// //       border: none;
// //       z-index: 999999;
// //       pointer-events: none;
// //       background: transparent;
// //     `;
    
// //     // Allow clicks to pass through except on chat widget
// //     iframe.setAttribute('allow', 'autoplay; camera; microphone');
// //     iframe.setAttribute('scrolling', 'no');

// //     // Make chat elements interactive while keeping rest transparent
// //     iframe.addEventListener('load', function() {
// //       // The iframe content will handle its own pointer events
// //       iframe.contentWindow.postMessage({ 
// //         type: 'SONA_CHAT_READY',
// //         origin: window.location.origin 
// //       }, '*');
// //     });

// //     // Inject styles for the iframe container
// //     const style = document.createElement('style');
// //     style.textContent = `
// //       #${containerId} {
// //         position: fixed;
// //         bottom: 0;
// //         right: 0;
// //         width: 100%;
// //         height: 100%;
// //         pointer-events: none;
// //         z-index: 999999;
// //       }
// //       #${CONFIG.iframeId} * {
// //         pointer-events: auto;
// //       }
// //     `;
// //     document.head.appendChild(style);

// //     // Clear container and add iframe
// //     container.innerHTML = '';
// //     container.appendChild(iframe);

// //     console.log('✅ Sona Chat embedded successfully');
    
// //     return {
// //       iframe: iframe,
// //       container: container,
// //       destroy: function() {
// //         if (container && container.parentNode) {
// //           container.parentNode.removeChild(container);
// //         }
// //         console.log('🗑️ Sona Chat embed removed');
// //       }
// //     };
// //   };

// //   // Auto-initialize if data attribute is present
// //   document.addEventListener('DOMContentLoaded', function() {
// //     const autoInit = document.querySelector('[data-sona-chat-embed]');
// //     if (autoInit) {
// //       const url = autoInit.getAttribute('data-sona-chat-url');
// //       window.SonaChatEmbed.init({ url: url });
// //     }
// //   });

// // })();

// (function () {
//   // Prevent loading twice
//   if (window.__sonaChatLoaded) return;
//   window.__sonaChatLoaded = true;

//   console.log('[Sona] Loading chat embed');

//   function init() {
//     // Avoid duplicate containers
//     if (document.getElementById('sona-chat-embed')) return;

//     const container = document.createElement('div');
//     container.id = 'sona-chat-embed';

//     container.style.cssText = `
//       position: fixed;
//       inset: 0;
//       width: 100%;
//       height: 100%;
//       pointer-events: none;
//       z-index: 999999;
//     `;

//     const iframe = document.createElement('iframe');
//     iframe.src = 'https://sona-bot.netlify.app/embed/chat';
//     // iframe.src = 'https://tricky-groups-run.loca.lt/embed/chat';
//     iframe.title = 'Sona AI Chat';

//     iframe.style.cssText = `
//       width: 100%;
//       height: 100%;
//       border: none;
//       background: transparent;
//       pointer-events: auto;
//     `;

//     iframe.setAttribute('allow', 'autoplay; camera; microphone');

//     iframe.onload = () => {
//       console.log('[Sona] Chat iframe loaded');
//     };

//     container.appendChild(iframe);
//     document.body.appendChild(container);
//   }

//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', init);
//   } else {
//     init();
//   }
// })();


// public/embed/sona-chat-embed.js
(function () {
  // Prevent multiple injections
  if (window.__sonaEmbedLoaded) return;
  window.__sonaEmbedLoaded = true;

  // Create container for button + iframe
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "999999";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "flex-end";
  container.style.gap = "10px";
  container.style.fontFamily = "sans-serif";

  // Create chat toggle button
  // const button = document.createElement("button");
  // button.innerText = "💬";
  // button.style.width = "64px";
  // button.style.height = "64px";
  // button.style.borderRadius = "50%";
  // button.style.border = "none";
  // button.style.cursor = "pointer";
  // button.style.background = "#5F3DF4";
  // button.style.color = "#fff";
  // button.style.fontSize = "28px";
  // button.style.boxShadow = "0 4px 12px rgba(95,61,244,0.3)";
  // button.style.transition = "all 0.3s ease";

  // Hover effect
  // button.onmouseover = () => {
  //   button.style.transform = "scale(1.1)";
  //   button.style.boxShadow = "0 6px 16px rgba(95,61,244,0.4)";
  // };
  // button.onmouseout = () => {
  //   button.style.transform = "scale(1)";
  //   button.style.boxShadow = "0 4px 12px rgba(95,61,244,0.3)";
  // };

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = "https://sona-bot.netlify.app/embed/chat"; // your Next.js chat page
  iframe.style.width = "400px";
  iframe.style.height = "520px";
  // iframe.style.border = "none";
  // iframe.style.borderRadius = "12px";
  iframe.style.display = "block"; // initially hidden
  // iframe.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
  // iframe.style.background = "transparent";

  // Toggle iframe on button click
  // button.onclick = () => {
  //   iframe.style.display = iframe.style.display === "none" ? "block" : "none";
  // };

  // Append elements
  container.appendChild(button);
  container.appendChild(iframe);
  document.body.appendChild(container);
})();

