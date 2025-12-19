
(function () {
  // Prevent multiple injections
  if (window.__sonaEmbedLoaded) return;
  window.__sonaEmbedLoaded = true;

  console.log('[Sona] Loading chat embed');

  // Extract apiKey from script src
  const script = document.currentScript;
  if (!script) {
    console.error('[Sona] Unable to locate embed script');
    return;
  }

  const url = new URL(script.src);
  const apiKey = url.searchParams.get("apiKey");

  if (!apiKey) {
    console.error('[Sona] Missing apiKey in embed script URL');
    return;
  }

  // Create container for the iframe only
  const container = document.createElement("div");
  container.id = "sona-chat-embed";
  container.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  z-index: 999999;
  pointer-events: none;
  `;

  // Create iframe - this contains your full chat UI with the button
  const iframe = document.createElement("iframe");
  iframe.src = `https://sona-bot.netlify.app/embed/chat?apiKey=${encodeURIComponent(apiKey)}`;
  iframe.title = "Sona AI Chat";
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    pointer-events: auto;
  `;

  iframe.setAttribute('allow', 'autoplay; camera; microphone');
  iframe.setAttribute('scrolling', 'no');

  iframe.onload = () => {
    console.log('[Sona] Chat iframe loaded');
  };

  // Append only the iframe to container
  container.appendChild(iframe);
  document.body.appendChild(container);

})();