const PASSWORD = "1234";
let currentTrack = 1;
const totalTracks = 5; // Toplam parça sayısı (Muzik/1.mp3'ten Muzik/5.mp3'e kadar)

// Birliktelik başlangıç tarihi: 18 Ocak 2023, 00:00:00
const startDate = new Date('2023-01-18T00:00:00');

/**
 * Genel HTML parçalarını (header ve footer) dinamik olarak yükler.
 * Bu fonksiyon, footer yüklendikten sonra sayacı başlatır.
 */
function loadIncludes() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        // Header dosyası proje kök dizininde olduğu için mutlak yol kullanıyoruz.
        fetch('/header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Header yüklenirken HTTP hatası: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                headerPlaceholder.innerHTML = html;
                // Header dinamik olarak yüklendiği için hero stillerini yeniden uygulayabiliriz.
                // Bu özellikle index.html'deki hero bölümü için önemlidir.
                applyHeroStyles();
            })
            .catch(err => console.error('Header yüklenemedi:', err));
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        // Footer dosyası proje kök dizininde olduğu için mutlak yol kullanıyoruz.
        fetch('/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Footer yüklenirken HTTP hatası: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                footerPlaceholder.innerHTML = html;
                // Footer yüklendikten sonra sayacı başlat
                startLoveTimer(); 
            })
            .catch(err => console.error('Footer yüklenemedi:', err));
    }
}

/**
 * Hero bölümü için gerekli stilleri uygular.
 * Bu fonksiyon, header'ın dinamik olarak yüklenmesi durumunda stillerin doğru uygulanmasını sağlar.
 */
function applyHeroStyles() {
    // Sadece <header class="hero"> etiketini seçiyoruz.
    // Çünkü header.html'e navbar ekledik ve .hero sınıfı hala bir <header> etiketi üzerinde.
    const hero = document.querySelector('header.hero'); 
    if (hero) {
        hero.style.background = 'linear-gradient(135deg, #ffd1dc, #ffe4e9)';
        hero.style.height = '100vh';
        hero.style.padding = '0 1rem';
        hero.style.display = 'flex';
        hero.style.flexDirection = 'column';
        hero.style.justifyContent = 'center';
        hero.style.alignItems = 'center';
        hero.style.textAlign = 'center';

        const h1 = hero.querySelector('h1');
        if (h1) {
            h1.style.fontFamily = "'Dancing Script', cursive";
            h1.style.fontSize = '4rem';
            h1.style.color = '#d63384';
            h1.style.marginBottom = '0.5rem';
        }

        const p = hero.querySelector('p');
        if (p) {
            p.style.fontFamily = "'Montserrat', sans-serif";
            p.style.fontSize = '1.5rem';
            p.style.color = '#6c757d';
        }
    }
}

/**
 * Giriş şifresini kontrol eder ve doğruysa main.html'e yönlendirir.
 * Bu fonksiyon SADECE index.html'de çağrılmalıdır.
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
 * Bu fonksiyon SADECE main.html'de çağrılmalıdır.
 */
function loadGallery() {
    const gallery = document.getElementById("gallery");
    if (!gallery) return; // Galeri elementi yoksa fonksiyonu durdur

    gallery.innerHTML = ''; // Her çağrıldığında galeriyi temizle

    for (let i = 1; i <= 4; i++) { // 4 fotoğraf olduğunu varsayıyoruz
        // Text ve img klasörleri ana dizinde olduğundan,
        // main.html ve alt klasörlerdeki sayfalar için '../' kullanıyoruz.
        fetch(`../Text/${i}.txt`) 
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Text dosyası yüklenirken HTTP hatası: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                const lines = text.split('\n');
                const title = lines[0] || `Fotoğraf ${i} Başlığı`; // Başlık yoksa varsayılan
                const desc = lines.slice(1).join('<br>') || 'Açıklama mevcut değil.'; // Açıklama yoksa varsayılan

                const col = document.createElement("div");
                col.className = "col-md-4 mb-4";

                const card = document.createElement("div");
                card.className = "card h-100 shadow-sm";

                card.innerHTML = `
                    <img src="../img/${i}.jpg" class="card-img-top" alt="${title}">
                    <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${desc}</p>
                    </div>
                `;

                col.appendChild(card);
                gallery.appendChild(col);
            })
            .catch(err => console.error(`Fotoğraf ${i}.txt okunamadı veya işlenemedi:`, err));
    }
}

/**
 * Müziği yükler ve çalar.
 * Bu fonksiyon SADECE ilgili sayfada (örneğin main.html) çağrılmalıdır.
 */
function loadMusic() {
    const audio = document.getElementById("audio");
    if (audio) { // Audio elementi varsa devam et
        // Müzik klasörü ana dizinde olduğundan '../' kullanıyoruz.
        audio.src = `../Muzik/${currentTrack}.mp3`; 
        audio.play();
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
    const diff = now.getTime() - startDate.getTime(); // Farkı milisaniye cinsinden al

    if (diff < 0) { // Başlangıç tarihi gelecekteyse
        const timerElement = document.getElementById('love-timer');
        if (timerElement) {
            timerElement.textContent = "Başlangıç bekleniyor...";
        }
        return;
    }

    // Zaman birimlerine çevir
    let seconds = Math.floor(diff / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    let years = Math.floor(days / 365.25); // Artık yılları hesaba katmak için yaklaşık 365.25 gün
    
    // Geri kalanları hesapla
    // Yılları çıkardıktan sonra kalan günleri tam sayı yap
    days = Math.floor(days - (years * 365.25)); 

    hours = hours % 24;
    minutes = minutes % 60;
    seconds = seconds % 60;

    // Ayları yaklaşık olarak hesaplamak için (1 ay = 30.44 gün)
    let months = Math.floor(days / 30.44);
    days = Math.floor(days % 30.44);


    const timerElement = document.getElementById('love-timer');
    if (timerElement) {
        timerElement.textContent = 
            `${years} yıl, ${months} ay, ${days} gün, ` +
            `${hours.toString().padStart(2, '0')} saat, ` +
            `${minutes.toString().padStart(2, '0')} dakika, ` +
            `${seconds.toString().padStart(2, '0')} saniye`;
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
    // Header ve footer'ı her sayfada yüklemeyi dene
    loadIncludes(); // Bu fonksiyon, footer yüklendiğinde sayacı başlatacak.

    // Yalnızca 'main.html' sayfasındaysak galeri ve müziği yükle
    // URL'nin 'main.html' ile bitip bitmediğini kontrol ediyoruz.
    const path = window.location.pathname;
    if (path.endsWith('/main.html') || path === '/main.html') {
        loadGallery();
        loadMusic();
    }
});