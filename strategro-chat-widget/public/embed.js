/**
 * Strategro White-Label Chat Widget
 * Cleaned version of n8nchatui embed.js
 * - Removed watermark
 * - Added footer config support
 */

function renderFooter(footerConfig) {
  const footerWrapper = document.createElement("div");
  footerWrapper.className = "chat-footer";
  footerWrapper.style.textAlign = "center";
  footerWrapper.style.padding = "8px";
  footerWrapper.style.backgroundColor = footerConfig.bgColor || "#cce7ea";
  footerWrapper.style.fontSize = "13px";
  footerWrapper.innerHTML = `
    <a href="${footerConfig.link || "https://strategro.co.uk"}" 
       target="_blank" 
       rel="noopener noreferrer" 
       style="color:${footerConfig.textColor || "#042326"}; 
              text-decoration:none; 
              font-weight:bold;">
      ${footerConfig.text || "Powered by Strategro Ltd"}
    </a>`;
  return footerWrapper;
}

function createChatWindow(config) {
  const container = document.createElement("div");
  container.className = "chat-window";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.width = (config.theme && config.theme.width) || "400px";
  container.style.height = (config.theme && config.theme.height) || "500px";
  container.style.backgroundColor = (config.theme && config.theme.backgroundColor) || "#ffffff";
  container.style.borderRadius = "12px";
  container.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.overflow = "hidden";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.zIndex = "999999";

  // Header
  const header = document.createElement("div");
  header.style.backgroundColor = (config.theme && config.theme.headerBg) || "#0A3A40";
  header.style.color = "#fff";
  header.style.padding = "12px";
  header.style.fontWeight = "bold";
  header.innerText = (config.theme && config.theme.title) || "Strategro";
  container.appendChild(header);

  // Messages area
  const messages = document.createElement("div");
  messages.className = "chat-messages";
  messages.style.flex = "1";
  messages.style.padding = "12px";
  messages.style.overflowY = "auto";
  messages.style.backgroundColor = (config.theme && config.theme.backgroundColor) || "#f9f9f9";
  container.appendChild(messages);

  // Input area
  const inputWrapper = document.createElement("div");
  inputWrapper.style.display = "flex";
  inputWrapper.style.borderTop = "1px solid #ddd";

  const textarea = document.createElement("textarea");
  textarea.placeholder = (config.theme && config.theme.textInput && config.theme.textInput.placeholder) || "Type your query...";
  textarea.style.flex = "1";
  textarea.style.padding = "8px";
  textarea.style.border = "none";
  textarea.style.resize = "none";

  const sendBtn = document.createElement("button");
  sendBtn.innerText = "Send";
  sendBtn.style.backgroundColor = (config.theme && config.theme.textInput && config.theme.textInput.sendButtonColor) || "#0A3A40";
  sendBtn.style.color = "#fff";
  sendBtn.style.border = "none";
  sendBtn.style.padding = "0 16px";
  sendBtn.style.cursor = "pointer";

  inputWrapper.appendChild(textarea);
  inputWrapper.appendChild(sendBtn);
  container.appendChild(inputWrapper);

  // Footer (new configurable version)
  const footer = renderFooter(config.footer || {});
  container.appendChild(footer);

  // Messaging logic
  let sessionId = crypto.randomUUID();

  async function sendMessage(message) {
    const userDiv = document.createElement("div");
    userDiv.textContent = message;
    userDiv.style.background = "#fff6f3";
    userDiv.style.padding = "8px";
    userDiv.style.margin = "4px";
    userDiv.style.alignSelf = "flex-end";
    userDiv.style.borderRadius = "6px";
    messages.appendChild(userDiv);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(config.n8nChatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          sessionId,
          chatInput: message,
          metadata: config.metadata || {}
        })
      });
      const data = await res.json();
      const botDiv = document.createElement("div");
      botDiv.textContent = Array.isArray(data) ? data[0].output : data.output;
      botDiv.style.background = "#0A3A40";
      botDiv.style.color = "#fff";
      botDiv.style.padding = "8px";
      botDiv.style.margin = "4px";
      botDiv.style.alignSelf = "flex-start";
      botDiv.style.borderRadius = "6px";
      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
    } catch (e) {
      console.error("Chatbot error", e);
    }
  }

  sendBtn.addEventListener("click", () => {
    if (textarea.value.trim()) {
      sendMessage(textarea.value.trim());
      textarea.value = "";
    }
  });

  textarea.addEventListener("keypress", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textarea.value.trim()) {
        sendMessage(textarea.value.trim());
        textarea.value = "";
      }
    }
  });

  return container;
}

const Chatbot = {
  init(config) {
    const chat = createChatWindow(config);
    document.body.appendChild(chat);
  }
};

export default Chatbot;
