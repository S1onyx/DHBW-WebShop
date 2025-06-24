const identifier = new inputObject("username-email", "username-email", "Please enter username or E-Mail!", "username-email-error", isElementNotEmpty);

window.onload = function() {
    const savedIdentifier = sessionStorage.getItem("identifier");
    if(savedIdentifier) {
        identifier.getElement().value = savedIdentifier;
    }
}

document.getElementById("reset-password-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!identifier.validate()) {
        return;
    }

    const identifierContent = identifier.getValue();


    const body = identifierContent.includes('@')
        ? { email: identifierContent}
        : { username: identifierContent};

    const requestSuccess = document.getElementById("request-success");
    const requestError = document.getElementById("request-error");

    try {
        const res = await fetch('http://localhost:3000/api/auth/request-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (json.success) {
            requestSuccess.textContent = 'E-Mail to reset password sent.';
            requestSuccess.style.display = "block";
        } else {
            requestError.textContent = json.error || 'Username/E-Mail is wrong.';
            requestError.style.display = "block";
        }
    } catch (err) {
        requestError.textContent = 'Serverfehler while requesting reset.';
        requestError.style.display = "block";
    }
})

document.getElementById("back-to-login").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);

    window.location.href = "login";
})