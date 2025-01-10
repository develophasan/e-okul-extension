document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveButton');
    const statusDiv = document.getElementById('status');

    // Kaydedilmiş API anahtarını yükle
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    if (apiKey) {
        apiKeyInput.value = apiKey;
    }

    // Kaydet butonuna tıklandığında
    saveButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('API anahtarı boş olamaz!', 'error');
            return;
        }

        try {
            // API anahtarını test et
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Test mesajı'
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('API anahtarı geçersiz');
            }

            // API anahtarını kaydet
            await chrome.storage.sync.set({ apiKey });
            showStatus('API anahtarı başarıyla kaydedildi!', 'success');

        } catch (error) {
            showStatus('API anahtarı geçersiz!', 'error');
        }
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        setTimeout(() => {
            statusDiv.className = 'status';
        }, 3000);
    }
}); 