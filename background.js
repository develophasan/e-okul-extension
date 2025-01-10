// Context menu oluştur
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateWithGemini",
    title: "Gemini ile Üret",
    contexts: ["editable"]
  });
});

// Context menu tıklamasını dinle
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateWithGemini") {
    // Content script'e mesaj gönder
    chrome.tabs.sendMessage(tab.id, {
      action: "generateContent",
      targetElementId: info.targetElementId
    });
  }
}); 