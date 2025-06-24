const PASSWORD = "1234"; // Şifrenizi buraya girin

/**
 * Giriş şifresini kontrol eder ve doğruysa main.html'e yönlendirir.
 */
function checkPassword() {
    const input = document.getElementById("password-input").value;
    const msg = document.getElementById("login-message");

    if (input === PASSWORD) {
        window.location.href = "main/main.html"; // Şifre doğruysa main/main.html'e yönlendir
    } else {
        msg.textContent = "Şifre yanlış!";
    }
}