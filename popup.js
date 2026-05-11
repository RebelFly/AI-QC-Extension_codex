document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['apiKey', 'apiUrl', 'modelName'], (data) => {
    if(data.apiKey) document.getElementById('apiKey').value = data.apiKey;
    if(data.apiUrl) document.getElementById('apiUrl').value = data.apiUrl;
    if(data.modelName) document.getElementById('modelName').value = data.modelName;
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const apiUrl = document.getElementById('apiUrl').value;
    const modelName = document.getElementById('modelName').value;
    chrome.storage.local.set({ apiKey, apiUrl, modelName }, () => {
      const status = document.getElementById('status');
      status.style.display = 'block';
      setTimeout(() => status.style.display = 'none', 2000);
    });
  });
});