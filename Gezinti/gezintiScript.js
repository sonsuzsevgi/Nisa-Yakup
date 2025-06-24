// Birliktelik başlangıç tarihi: 05 Mart 2022, 00:00:00
const startDate = new Date('2022-03-05T00:00:00');
const totalLocations = 2; // Konum klasöründeki dosya sayısına göre güncelleyin!
/**
 * Aşk sayacını günceller.
 */
function updateLoveTimer() {
    const now = new Date();
    const diff = now.getTime() - startDate.getTime();

    if (diff < 0) { 
        const timerElement = document.getElementById('love-timer');
        if (timerElement) {
            timerElement.textContent = "Başlangıç bekleniyor...";
        }
        return;
    }

    let seconds = Math.floor(diff / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    let years = Math.floor(days / 365.25);
    
    days = Math.floor(days - (years * 365.25)); 
    let months = Math.floor(days / 30.44); 
    days = Math.floor(days % 30.44);

    hours = hours % 24;
    minutes = minutes % 60;
    seconds = seconds % 60;

    const timerElement = document.getElementById('love-timer');
    const yearElement = document.getElementById('current-year');

    if (timerElement) {
        timerElement.textContent = 
            `${years} yıl, ${months} ay, ${days} gün, ` +
            `${hours.toString().padStart(2, '0')} saat, ` +
            `${minutes.toString().padStart(2, '0')} dakika, ` +
            `${seconds.toString().padStart(2, '0')} saniye`;
    }
    if (yearElement) { 
        yearElement.textContent = now.getFullYear();
    }
}

/**
 * Aşk sayacını başlatır ve her saniye güncellenmesini sağlar.
 */
function startLoveTimer() {
    if (document.getElementById('love-timer')) {
        updateLoveTimer(); 
        setInterval(updateLoveTimer, 1000); 
    }
}

// Gezinti sayfasına özel fonksiyonlar


async function getLocationImageUrls(locationId) {
    const imageUrls = [];
    let imgCount = 1;
    const maxImagesPerLocation = 15;

    const imageBaseUrl = `./img/${locationId}.`; 

    while (imgCount <= maxImagesPerLocation) {
        const imgUrl = `${imageBaseUrl}${imgCount}.jpg`; 
        try {
            const response = await fetch(imgUrl, { method: 'HEAD' });
            if (response.ok) {
                imageUrls.push(imgUrl);
            } else {
                break;
            }
        } catch (error) {
            console.warn(`Resim (${imgUrl}) kontrol edilirken hata:`, error);
            break;
        }
        imgCount++;
    }
    return imageUrls;
}

async function loadTravelLocations() {
    const container = document.getElementById('travel-locations-container');
    if (!container) return; 

    container.innerHTML = '';

    for (let i = 1; i <= totalLocations; i++) {
        const mapLinkPath = `./Konum/${i}konum.txt`;    
        const textPath = `./Text/${i}.txt`;              
        
        try {
            const textResponse = await fetch(textPath);
            if (!textResponse.ok) throw new Error(`Metin (${textPath}) yüklenirken hata: ${textResponse.status}`);
            const textContent = await textResponse.text();
            const textLines = textContent.split('\n');
            const title = textLines[0].trim();
            const description = textLines.slice(1).join('<br>').trim();

            const mapResponse = await fetch(mapLinkPath);
            if (!mapResponse.ok) throw new Error(`Harita linki (${mapLinkPath}) yüklenirken hata: ${mapResponse.status}`);
            const mapIframeLink = await mapResponse.text();

            const imageUrls = await getLocationImageUrls(i);

            const locationDiv = document.createElement('div');
            locationDiv.className = 'location-card'; 

            let imagesHtml = '';
            if (imageUrls.length > 0) {
                imagesHtml = `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 location-images mt-4">`;
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
                    <div class="col-md-6 order-md-2"> 
                        <div class="map-container">
                            <iframe src="${mapIframeLink.trim()}" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </div>
                    <div class="col-md-6 order-md-1"> 
                        <p class="location-description">${description}</p>
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

// Sayfa yüklendiğinde çalışacak olay dinleyicisi
document.addEventListener('DOMContentLoaded', () => {
    // Gezinti sayfasının kendine özgü yükleme fonksiyonlarını çağır
    loadTravelLocations();
    // Love timer'ı başlat
    startLoveTimer(); 
});