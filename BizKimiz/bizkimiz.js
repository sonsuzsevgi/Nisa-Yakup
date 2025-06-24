// Birliktelik başlangıç tarihi: 18 Ocak 2023, 00:00:00
const startDate = new Date('2023-01-18T00:00:00');

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

// Sayfa içeriği tamamen yüklendiğinde çalışacak olay dinleyicisi
document.addEventListener('DOMContentLoaded', () => {
    startLoveTimer(); 
});