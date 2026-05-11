chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callAI") {
    chrome.storage.local.get(['apiKey', 'apiUrl', 'modelName'], (config) => {
      if (!config.apiKey) {
        sendResponse({ error: "请先点击浏览器右上角插件图标配置 API Key" });
        return;
      }

      fetch(config.apiUrl || "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.modelName || "qwen-vl-max",
          messages: request.payload,
          response_format: { type: "json_object" }
        })
      })
      .then(res => res.json())
      .then(data => sendResponse({ result: data }))
      .catch(err => sendResponse({ error: err.toString() }));
    });
    return true; // 保持异步响应
  }
});