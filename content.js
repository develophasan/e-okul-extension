// Loading göstergesi için stil ekle
const style = document.createElement('style');
style.textContent = `
  .gemini-loading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .gemini-loading .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Loading göstergesini oluştur ve yönet
function showLoading() {
  const loading = document.createElement('div');
  loading.className = 'gemini-loading';
  loading.innerHTML = `
    <div class="spinner"></div>
    <div>Metin oluşturuluyor...</div>
  `;
  document.body.appendChild(loading);
  return loading;
}

function hideLoading(loadingElement) {
  if (loadingElement && loadingElement.parentNode) {
    loadingElement.parentNode.removeChild(loadingElement);
  }
}

// Background script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateContent") {
    // Seçili input elementini bul
    const targetInput = document.activeElement;
    if (!targetInput) return;

    // Beceri türünü tespit et
    const beceriTuru = getBeceriTuru();
    if (!beceriTuru) {
      alert("Lütfen önce beceri türünü seçin!");
      return;
    }

    // Gemini API'den içerik üret
    generateContent(beceriTuru, targetInput);
  }
});

// Seçili beceri türünü al
function getBeceriTuru() {
  const beceriSelect = document.getElementById("cmbBeceriler");
  if (!beceriSelect) return null;

  const selectedOption = beceriSelect.options[beceriSelect.selectedIndex];
  if (selectedOption.value === "-1") return null;

  return selectedOption.text;
}

// Gemini API ile içerik üret
async function generateContent(beceriTuru, targetInput) {
  const loadingElement = showLoading();
  
  try {
    // API anahtarını storage'dan al
    const { apiKey } = await chrome.storage.sync.get("apiKey");
    if (!apiKey) {
      hideLoading(loadingElement);
      alert("Lütfen önce Gemini API anahtarınızı girin!");
      return;
    }

    // Beceri alanına göre örnek cümleleri belirle
    let ornekCumleler = "";
    if (beceriTuru.includes("Alan")) {
      ornekCumleler = "Gün akışındaki eylem ve etkinlikleri oluş sırasına göre sıralayabiliyor. Görsel ve işitsel materyaller hakkında tahminde bulunup tahminiyle materyalin benzerlik ve farklılıkları karşılaştırabiliyor. Merak ettiği konulara yönelik incelemeler yapıp sorular sorabiliyor.";
    } else if (beceriTuru.includes("Sosyal")) {
      ornekCumleler = "Yeni ya da değişen durumlara uyum gösterebiliyor. Dinleme, anlatma, etkileşim gibi iletişim becerilerini gösterebiliyor. Zor durumlarla karşılaştığında çözüm için farklı seçenekler deneyebiliyor.";
    } else if (beceriTuru.includes("Kavramsal")) {
      ornekCumleler = "Problem durumlarında gözlemleme becerisi gösterebiliyor. Gözlemleri ile mevcut bilgileri arasında ilişki kurabiliyor. Birden fazla nesne, durum ya da olayı birbiriyle karşılaştırabiliyor.";
    } else if (beceriTuru.includes("Okuryazarlık")) {
      ornekCumleler = "Bilgiyi çözümleme, sınıflandırma ve yorumlama becerileri gösterebiliyor. Farklı kültürler arasında benzerlik ve farklılıklar olduğunu biliyor. Bilgi türlerini ve bilgiye ihtiyaç duyduğunu fark edebiliyor.";
    } else if (beceriTuru.includes("Değerler")) {
      ornekCumleler = "Sabır gerektiren durumları bilir ve sabırla beklemeye çalışabiliyor. Çevresini korumak ve güzelleştirmek için elinden geleni yapıyor. Hata yaptığında özür dilemenin erdemli bir davranış olduğunu bilip uygulayabiliyor.";
    } else if (beceriTuru.includes("Eğilimler")) {
      ornekCumleler = "Merak ettiği konularda sorular sormaktan çekinmiyor. Sınıf içi ve sınıf dışı etkinliklerde özgüven sahibi davranışlar sergiliyor. Etkinliklerde azim ve kararlılık göstererek etkinliğini tamamlayabiliyor.";
    }

    // Gemini API'ye istek gönder
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Okul öncesi eğitimde ${beceriTuru} alanında bir öğrenci için değerlendirme metni yaz. Metin şu kurallara uygun olmalı:

1. Başlık veya öğrenci ismi OLMADAN direkt cümlelerle başla
2. Her cümle öğrencinin bir becerisini veya yeteneğini olumlu şekilde ifade etmeli
3. Her kelime küçük harfle başlamalı, sadece cümle başları büyük harfle başlamalı
4. Cümleler "-ebiliyor", "-abiliyor", "yapıyor", "biliyor" gibi yetenek ve eylem bildiren eklerle bitmeli
5. Her cümlenin sonuna mutlaka nokta (.) işareti konmalı
6. Cümleler arasında tek boşluk olmalı, paragraf boşluğu olmamalı
7. Yıldız, tire, madde işareti gibi simgeler kullanılmamalı
8. Her cümle öğrencinin farklı bir becerisine odaklanmalı
9. Cümleler arasında anlam bütünlüğü olmalı
10. Virgül gerektiren durumlarda virgül (,) kullanılmalı

Bu beceri alanı için örnek cümleler:
${ornekCumleler}
Okul öncesi düzeyine uygun olacak değerlendirmeler. Okul öncesi dönem çocuklarının yapabildiği kazanımlara uygun.
Lütfen bu örneklerdeki gibi, seçilen beceri alanına uygun 4-5 cümle oluştur.`
          }]
        }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      // Üretilen metni temizle ve düzenle
      let text = data.candidates[0].content.parts[0].text;
      
      // Fazla boşlukları ve satır sonlarını temizle
      text = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Simgeleri temizle
      text = text.replace(/[*\-★]/g, '');
      
      // Nokta işaretinden sonra bir boşluk olduğundan emin ol
      text = text.replace(/\./g, '. ').replace(/\s+/g, ' ').trim();
      
      // Üretilen içeriği input'a yerleştir
      targetInput.value = text;
      
      // Input'ta değişiklik event'ini tetikle
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      throw new Error("API yanıtı geçersiz");
    }

  } catch (error) {
    console.error("İçerik üretme hatası:", error);
    alert("İçerik üretilirken bir hata oluştu. Lütfen tekrar deneyin.");
  } finally {
    hideLoading(loadingElement);
  }
} 