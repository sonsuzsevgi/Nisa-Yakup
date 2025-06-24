// Birliktelik başlangıç tarihi: 05 Mart 2022, 00:00:00
const startDate = new Date('2022-03-05T00:00:00');

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

// Sosyal medya ikonlarının dosya isimleri (küçük harf ve boşluksuz)
const socialMediaIcons = {
    'github': 'github.svg',
    'linkedin': 'linkedin.svg',
    'instagram': 'instagram.svg',
    'x': 'x.svg', // Twitter için 'x' kullandık
    'facebook': 'facebook.svg',
    'youtube': 'youtube.svg',
    'gmail': 'gmail.svg',
    'tiktok': 'tiktok.svg',
    'pinterest': 'pinterest.svg',
    'snapchat': 'snapchat.svg'
};

/**
 * hesaplar.txt dosyasını okur ve kişi verilerini ayrıştırır.
 * @returns {Promise<Array<Object>>} Kişi verilerinin bir dizisi.
 */
async function loadContactData() {
    try {
        // Dosya yolu Iletisim klasörüne göre ayarlandı
        const response = await fetch('./hesaplar.txt'); 
        if (!response.ok) {
            throw new Error(`Hesaplar.txt yüklenirken hata: ${response.status}`);
        }
        const text = await response.text();
        const peopleData = text.split('---').map(personBlock => personBlock.trim()).filter(Boolean); 

        const contacts = [];

        for (const block of peopleData) {
            const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
            if (lines.length === 0) continue;

            const person = {
                name: lines[0],
                info: {},
                social: []
            };

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const parts = line.split('->');
                if (parts.length < 2) continue; 

                const key = parts[0].toLowerCase(); 
                const value = parts.slice(1).join('->').trim(); 

                if (value === '') continue;

                if (key === 'foto') {
                    person.photo = value;
                } else if (socialMediaIcons[key]) { 
                    person.social.push({ type: key, link: value });
                } else {
                    if (person.info[key]) { 
                        if (Array.isArray(person.info[key])) {
                            person.info[key].push(value);
                        } else {
                            person.info[key] = [person.info[key], value];
                        }
                    } else {
                        person.info[key] = value;
                    }
                }
            }
            contacts.push(person);
        }
        return contacts;

    } catch (error) {
        console.error("İletişim verileri yüklenirken hata:", error);
        return [];
    }
}

/**
 * Kişinin bilgilerini ve sosyal medya bağlantılarını HTML'e basar.
 * @param {Array<Object>} contacts - Yüklenen kişi verileri.
 */
async function displayContacts(contacts) {
    const container = document.getElementById('contact-cards-container');
    if (!container) return;

    container.innerHTML = ''; 

    for (const person of contacts) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 mb-4 d-flex align-items-stretch'; 

        const cardDiv = document.createElement('div');
        cardDiv.className = 'person-card';

        // Profil fotoğrafı yolu Iletisim/img klasörüne göre ayarlandı
        const profilePhotoPath = person.photo ? `./img/${person.photo}` : 'https://via.placeholder.com/150'; 

        cardDiv.innerHTML = `
            <img src="${profilePhotoPath}" class="profile-img" alt="${person.name} Profil Resmi">
            <h3>${person.name}</h3>
        `;

        if (person.info.telefon) {
            cardDiv.innerHTML += `<p class="contact-info-item"><strong>Telefon:</strong> ${person.info.telefon}</p>`;
        }
        if (person.info.adres) {
            cardDiv.innerHTML += `<p class="contact-info-item"><strong>Adres:</strong> ${person.info.adres}</p>`;
        }
        
        if (person.info.gmail) {
            const gmails = Array.isArray(person.info.gmail) ? person.info.gmail : [person.info.gmail];
            for (const gmail of gmails) {
                cardDiv.innerHTML += `<p class="contact-info-item gmail-link"><a href="mailto:${gmail}"><strong>Gmail:</strong> ${gmail}</a></p>`;
            }
        }

        let socialLinksHtml = '<div class="social-links">';
        for (const social of person.social) {
            const iconFileName = socialMediaIcons[social.type];
            if (iconFileName) {
                // Sosyal medya ikonları yolu Iletisim/img klasörüne göre ayarlandı
                socialLinksHtml += `
                    <a href="${social.link}" target="_blank" rel="noopener noreferrer" aria-label="${social.type}">
                        <img src="./img/${iconFileName}" alt="${social.type} İkon">
                    </a>
                `;
            }
        }
        socialLinksHtml += '</div>';
        cardDiv.innerHTML += socialLinksHtml;

        colDiv.appendChild(cardDiv);
        container.appendChild(colDiv);
    }
}

// Sayfa yüklendiğinde çalışacak olay dinleyicisi
document.addEventListener('DOMContentLoaded', async () => {
    // Sadece iletişim sayfası yüklendiğinde bu kodu çalıştır.
    const path = window.location.pathname;
    if (path.includes('/Iletisim/iletisim.html') || path.includes('/iletisim/iletisim.html')) {
        const contacts = await loadContactData();
        await displayContacts(contacts); // await ile bekletiyoruz
        startLoveTimer(); // Veriler yüklendikten sonra sayacı başlat
    }
});