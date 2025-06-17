const identifier = new inputObject("username-email", "username-email", "Please enter username or E-Mail!", "username-email-error", isElementEmpty);

document.getElementById("reset-password-form").addEventListener("submit", function (event) {
    event.preventDefault();

    if(!identifier.validate()) {
        return;
    }

})

window.onload = function() {
    const savedIdentifier = sessionStorage.getItem("identifier");
    if(savedIdentifier) {
        identifier.getElement().value = savedIdentifier;
    }
}

document.getElementById("back-to-login").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);

    window.location.href = "login.html";
})