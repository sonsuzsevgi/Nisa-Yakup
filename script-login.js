const PASSWORD = "30haziran2005"; // Şifrenizi buraya girin

/**
 * Giriş şifresini kontrol eder ve doğruysa main.html'e yönlendirir.
 */
function checkPassword() {
    const input = document.getElementById("password-input").value;
    const msg = document.getElementById("login-message");

    if (input === PASSWORD) {
        window.location.href = "Main/main.html"; // Şifre doğruysa main/main.html'e yönlendir
    } else {
        msg.textContent = "Şifre yanlış!";
    }
}