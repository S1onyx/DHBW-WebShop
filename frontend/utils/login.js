const identifier = new inputObject("username-email", "username-email", "Please enter username or E-Mail!", "username-email-error", isElementEmpty);
const password = new inputObject("password", "password-wrapper", "Please enter password!", "password-error", isElementEmpty);

window.onload = function() {
    const savedIdentifier = sessionStorage.getItem("identifier");
    if(savedIdentifier) {
        identifier.getElement().value = savedIdentifier;
    }
}

window.onload = function() {
    const savedIdentifier = sessionStorage.getItem("identifier");
    const savedPassword = sessionStorage.getItem("password");
    if(savedIdentifier) {
        identifier.getElement().value = savedIdentifier;
    }
    if(savedPassword) {
        password.getElement().value = savedPassword;
    }
}

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();

    if(!identifier.validate() || !password.validate()) {
        return;
    }

    
})

document.getElementById("to-signup").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);

    const passwordContent = password.getValue();
    sessionStorage.setItem("password", passwordContent);

    window.location.href = "signup.html";
})

document.getElementById("forgot-password-link").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);

    window.location.href = "reset-password.html";
})

document.getElementById("toggle-password").addEventListener("click", function (event) {
    const passwordInput = password.getElement();
    const toggleButton = document.getElementById("toggle-password");

    togglePassword(toggleButton, passwordInput);
})