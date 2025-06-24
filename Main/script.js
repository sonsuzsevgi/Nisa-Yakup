const PASSWORD = "1234";
let currentTrack = 1;
const totalTracks = 5; 
const totalPhotos = 23;
// Birliktelik başlangıç tarihi: 05 Mart 2022, 00:00:00
const startDate = new Date('2022-03-05T00:00:00');

/**
 * Giriş şifresini kontrol eder ve doğruysa main.html'e yönlendirir.
 */
function checkPassword() {
    const input = document.getElementById("password-input").value;
    const msg = document.getElementById("login-message");

    if (input === PASSWORD) {
        window.location.href = "main.html"; // Şifre doğruysa main.html'e yönlendir
    } else {
        msg.textContent = "Şifre yanlış!";
    }
}

/**
 * Galeri içeriğini dinamik olarak yükler.
 */
function loadGallery() {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    gallery.innerHTML = ''; // Mevcut içeriği temizle

    const fetchPromises = []; // Tüm fetch işlemlerini saklayacak bir dizi

    // Her bir fotoğraf için metin dosyasını çekme işlemini başlat ve promise'ları diziye ekle
    for (let i = 1; i <= totalPhotos; i++) {
        const promise = fetch(`Text/${i}.txt`)
            .then(response => {
                if (!response.ok) {
                    // Dosya bulunamazsa veya okunamazsa uyarı ver
                    console.warn(`Uyarı: Text/${i}.txt dosyası bulunamadı veya okunamadı. HTTP Hata Kodu: ${response.status}. Bu fotoğraf atlanıyor.`);
                    return null; // Null döndürerek hata durumunu işaretle
                }
                return response.text();
            })
            .then(text => {
                // Eğer dosya bulunamadıysa, işlem yapmadan çık
                if (text === null) {
                    return { index: i, title: null, desc: null }; // Hatalı öğeyi işaretle
                }

                const lines = text.split('\n');
                const title = lines[0] || `Fotoğraf ${i} Başlığı`;
                const desc = lines.slice(1).join('<br>') || 'Açıklama mevcut değil.';

                // Her promise tamamlandığında, fotoğrafın indeksini ve verilerini döndür
                return { index: i, title, desc };
            })
            .catch(err => {
                // Metin dosyasını işlerken oluşabilecek diğer hataları yakala
                console.error(`Fotoğraf ${i} metin dosyası işlenirken bir hata oluştu:`, err);
                return { index: i, title: null, desc: null }; // Hatalı öğeyi işaretle
            });
        fetchPromises.push(promise); // Oluşturulan promise'ı diziye ekle
    }

    // Tüm fetch işlemlerinin tamamlanmasını bekle
    Promise.all(fetchPromises)
        .then(results => {
            // Promise.all zaten orijinal sırayı korur, ancak emin olmak için sıralama yapılabilir.
            // Bu örnekte, index'e göre sıralama zaten gerekli olmayabilir çünkü Promise.all sırayı korur.
            // Ama yine de güvenli tarafta olmak için bırakabiliriz.
            results.sort((a, b) => a.index - b.index);

            // Tüm sonuçlar geldikten sonra, bunları doğru sırayla DOM'a ekle
            results.forEach(item => {
                // Eğer metin dosyası bulunamadıysa bu öğeyi atla
                if (item.title === null) return;

                const col = document.createElement("div");
                col.className = "col-md-4 mb-4";

                const card = document.createElement("div");
                card.className = "card h-100 shadow-sm";

                card.innerHTML = `
                    <img src="img/${item.index}.jpg" class="card-img-top" alt="${item.title}">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.desc}</p>
                    </div>
                `;

                col.appendChild(card);
                gallery.appendChild(col);
            });
        })
        .catch(err => {
            // Promise.all'ın kendisinde oluşabilecek hataları yakala
            console.error("Tüm galeri öğeleri yüklenirken bir hata oluştu:", err);
        });
}

/**
 * Müziği yükler ve çalar.
 */
function loadMusic() {
    const audio = document.getElementById("audio");
    const musicIcon = document.getElementById("music-icon"); // Müzik ikonunu yakala

    if (audio) {
        audio.src = `Muzik/${currentTrack}.mp3`;
        audio.play();

        // Müzik çalmaya başladığında dönme sınıfını ekle
        audio.onplay = () => {
            if (musicIcon) {
                musicIcon.classList.add('spinning-music-icon');
            }
        };

        // Müzik durduğunda veya bittiğinde dönme sınıfını kaldır
        audio.onpause = () => {
            if (musicIcon) {
                musicIcon.classList.remove('spinning-music-icon');
            }
        };
        audio.onended = () => { // Şarkı bittiğinde de durdur
            if (musicIcon) {
                musicIcon.classList.remove('spinning-music-icon');
            }
        };
    }
}

/**
 * Bir sonraki müzik parçasını çalar.
 */
function nextTrack() {
    currentTrack++;
    if (currentTrack > totalTracks) currentTrack = 1;
    loadMusic();
}

/**
 * Ses seviyesini ayarlar (şu an HTML'de kullanılmıyor).
 * @param {number} value - 0.0 ile 1.0 arasında ses seviyesi değeri.
 */
function setVolume(value) {
    const audio = document.getElementById("audio");
    if (audio) {
        audio.volume = value;
    }
}

/**
 * Müzik panelinin görünürlüğünü açıp kapatır.
 */
function toggleMusicPanel() {
    const panel = document.getElementById("music-panel");
    if (panel) {
        panel.classList.toggle("hidden");
    }
}

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
    let years = Math.floor(days / 365.25); // Daha hassas yıl hesabı
    
    // Yılları çıkardıktan sonra kalan günleri tekrar hesapla
    days = Math.floor(days - (years * 365.25)); 
    let months = Math.floor(days / 30.44); // Ortalama ay
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
    // Sadece love-timer elementi varsa sayacı başlat
    if (document.getElementById('love-timer')) {
        updateLoveTimer(); // Sayfayı ilk yüklediğinde hemen güncelle
        setInterval(updateLoveTimer, 1000); // Her saniye güncelle
    }
}

// Sayfa içeriği tamamen yüklendiğinde çalışacak olay dinleyicisi
document.addEventListener('DOMContentLoaded', () => {
    // footer'daki sayaçları ve yıl bilgisini başlat
    startLoveTimer(); 
    
    // Sadece 'main.html' sayfasındaysak galeri ve müziği yükle
    const path = window.location.pathname;
    if (path.endsWith('/main.html') || path.endsWith('/main.html')) { 
        loadGallery();
        loadMusic();
    }
});