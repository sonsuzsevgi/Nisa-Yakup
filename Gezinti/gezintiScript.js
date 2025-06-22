// Gezilen konumların sayısını belirtin.
// Bu değeri, Konum klasöründeki 1konum.txt, 2konum.txt ... dosyalarınızın sayısına göre güncelleyin!
const totalLocations = 2; // Örn: Eğer 1konum.txt ve 2konum.txt varsa, bu 2 olmalı.

/**
 * Belirli bir konumun resimlerini dinamik olarak kontrol edip URL'lerini döndürür.
 * @param {number} locationId - Konumun ID'si (örneğin 1, 2, 3)
 * @returns {Promise<string[]>} Resim URL'lerinin bir dizisi.
 */
async function getLocationImageUrls(locationId) {
    const imageUrls = [];
    let imgCount = 1;
    const maxImagesPerLocation = 15; // Bir konum için maksimum arama yapılacak resim sayısı

    // Resimlerin yolu artık Gezinti/img/ klasöründe olduğundan,
    // gezintiScript.js'den bu klasöre göreceli yolu ayarlıyoruz.
    const imageBaseUrl = `./img/${locationId}.`; // Örn: ./img/1.

    while (imgCount <= maxImagesPerLocation) {
        const imgUrl = `${imageBaseUrl}${imgCount}.jpg`; // Örn: ./img/1.1.jpg

        try {
            // Resmi gerçekten indirmeden sadece başlığını (metadata) kontrol et
            const response = await fetch(imgUrl, { method: 'HEAD' });
            if (response.ok) {
                imageUrls.push(imgUrl);
            } else {
                // Resim bulunamazsa (404) veya başka bir HTTP hatası olursa döngüyü kır
                break;
            }
        } catch (error) {
            // Ağ hatası veya CORS sorunu durumunda
            console.warn(`Resim (${imgUrl}) kontrol edilirken hata:`, error);
            break; // Hata durumunda da döngüyü kır
        }
        imgCount++;
    }
    return imageUrls;
}


/**
 * Gezinti sayfasındaki tüm konumları dinamik olarak yükler.
 */
async function loadTravelLocations() {
    const container = document.getElementById('travel-locations-container');
    if (!container) return; 

    container.innerHTML = ''; // İçeriği yüklemeden önce temizle

    for (let i = 1; i <= totalLocations; i++) {
        // Dosya yolları artık Gezinti klasörü içindeki Konum, Text, img klasörlerine göre ayarlandı.
        const mapLinkPath = `./Konum/${i}konum.txt`;    // Örn: ./Konum/1konum.txt
        const textPath = `./Text/${i}.txt`;              // Örn: ./Text/1.txt
        
        try {
            // 1. Konum metnini (başlık ve açıklama) oku
            const textResponse = await fetch(textPath);
            if (!textResponse.ok) throw new Error(`Metin (${textPath}) yüklenirken hata: ${textResponse.status}`);
            const textContent = await textResponse.text();
            const textLines = textContent.split('\n');
            const title = textLines[0].trim();
            const description = textLines.slice(1).join('<br>').trim();

            // 2. Harita iframe linkini oku
            const mapResponse = await fetch(mapLinkPath);
            if (!mapResponse.ok) throw new Error(`Harita linki (${mapLinkPath}) yüklenirken hata: ${mapResponse.status}`);
            const mapIframeLink = await mapResponse.text();

            // 3. İlgili konuma ait tüm resimleri getir
            const imageUrls = await getLocationImageUrls(i);

            // 4. İçerik için HTML yapısını oluştur
            const locationDiv = document.createElement('div');
            locationDiv.className = 'location-card'; 

            let imagesHtml = '';
            if (imageUrls.length > 0) {
                imagesHtml = `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 location-images mt-4">`; // Resimler için ızgara
                imageUrls.forEach(url => {
                    imagesHtml += `
                        <div class="col">
                            <div class="card h-100 border-0">
                                <img src="${url}" class="card-img-top rounded" alt="${title} Fotoğrafı">
                            </div>
                        </div>
                    `;
                });
                imagesHtml += `</div>`;
            } else {
                imagesHtml = '<p class="text-muted text-center mt-4">Bu konum için henüz fotoğraf yok.</p>';
            }

            locationDiv.innerHTML = `
                <h3 class="location-title">${title}</h3>
                <div class="row">
                    <div class="col-md-6 order-md-2"> <div class="map-container">
                            <iframe src="${mapIframeLink.trim()}" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </div>
                    <div class="col-md-6 order-md-1"> <p class="location-description">${description}</p>
                    </div>
                </div>
                ${imagesHtml}
                <hr class="my-4"> 
            `;

            container.appendChild(locationDiv);

        } catch (error) {
            console.error(`Konum ${i} yüklenirken hata:`, error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning text-center mt-4';
            errorDiv.textContent = `Konum ${i} içeriği yüklenemedi. Detaylar için konsola bakın.`;
            container.appendChild(errorDiv);
        }
    }
}

// Sayfa yüklendiğinde gezinti konumlarını yükle
document.addEventListener('DOMContentLoaded', () => {
    // Sadece gezinti sayfası yüklendiğinde loadTravelLocations fonksiyonunu çalıştır
    // Gezinti/gezinti.html sayfasında olduğumuzu kontrol etmenin en güvenli yolu URL kontrolüdür.
    const path = window.location.pathname;
    if (path.includes('/Gezinti/gezinti.html') || path.includes('/gezinti/gezinti.html')) {
        loadTravelLocations();
    }
});