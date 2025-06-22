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
    'pinterest': 'pinterest.svg'
};

/**
 * hesaplar.txt dosyasını okur ve kişi verilerini ayrıştırır.
 * @returns {Promise<Array<Object>>} Kişi verilerinin bir dizisi.
 */
async function loadContactData() {
    try {
        const response = await fetch('./hesaplar.txt'); // Aynı klasördeki hesaplar.txt
        if (!response.ok) {
            throw new Error(`Hesaplar.txt yüklenirken hata: ${response.status}`);
        }
        const text = await response.text();
        const peopleData = text.split('---').map(personBlock => personBlock.trim()).filter(Boolean); // Her kişiyi '---' ile ayır

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
                if (parts.length < 2) continue; // Geçersiz satırları atla

                const key = parts[0].toLowerCase(); // Anahtarı küçük harfe çevir
                const value = parts.slice(1).join('->').trim(); // Değeri al

                // Boş değerleri veya sadece anahtarı olanları atla
                if (value === '') continue;

                if (key === 'foto') {
                    person.photo = value;
                } else if (socialMediaIcons[key]) { // Eğer anahtar bir sosyal medya ikonuna karşılık geliyorsa
                    person.social.push({ type: key, link: value });
                } else {
                    // Diğer bilgiler (telefon, adres gibi)
                    if (person.info[key]) { // Eğer aynı anahtar daha önce eklenmişse (örn: birden fazla gmail)
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

    container.innerHTML = ''; // İçeriği temizle

    for (const person of contacts) {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 mb-4 d-flex align-items-stretch'; // Yan yana ve aynı yükseklikte olmaları için

        const cardDiv = document.createElement('div');
        cardDiv.className = 'person-card';

        const profilePhotoPath = person.photo ? `./img/${person.photo}` : 'https://via.placeholder.com/150'; // Placeholder eğer fotoğraf yoksa

        cardDiv.innerHTML = `
            <img src="${profilePhotoPath}" class="profile-img" alt="${person.name} Profil Resmi">
            <h3>${person.name}</h3>
        `;

        // Telefon, adres gibi bilgileri ekle
        if (person.info.telefon) {
            cardDiv.innerHTML += `<p class="contact-info-item"><strong>Telefon:</strong> ${person.info.telefon}</p>`;
        }
        if (person.info.adres) {
            cardDiv.innerHTML += `<p class="contact-info-item"><strong>Adres:</strong> ${person.info.adres}</p>`;
        }
        
        // Gmail adreslerini döngü ile ekle
        if (person.info.gmail) {
            const gmails = Array.isArray(person.info.gmail) ? person.info.gmail : [person.info.gmail];
            for (const gmail of gmails) {
                cardDiv.innerHTML += `<p class="contact-info-item gmail-link"><a href="mailto:${gmail}"><strong>Gmail:</strong> ${gmail}</a></p>`;
            }
        }

        // Sosyal medya linklerini ekle
        let socialLinksHtml = '<div class="social-links">';
        for (const social of person.social) {
            const iconFileName = socialMediaIcons[social.type];
            if (iconFileName) {
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
        displayContacts(contacts);
    }
});