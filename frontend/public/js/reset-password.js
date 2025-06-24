const identifier = new inputObject("username-email", "username-email", "Please enter username or E-Mail!", "username-email-error", isElementNotEmpty);

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

document.getElementById("reset-password-form").addEventListener("submit", async function (params) {
    if (!identifier.validate()) {
        return;
    }

    const identifierContent = identifier.getValue();


    const body = identifierContent.includes('@')
        ? { email: identifierContent}
        : { username: identifierContent};

    const loginSuccess = document.getElementById("request-success");
    const loginError = document.getElementById("request-error");

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
            loginSuccess.textContent = 'E-Mail to reset password sent.';
            loginSuccess.style.display = "block";
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            loginError.textContent = json.error || 'Username/E-Mail is wrong.';
            loginError.style.display = "block";
        }
    } catch (err) {
        loginError.textContent = 'Serverfehler while requesting reset.';
        loginError.style.display = "block";
    }
})

document.getElementById("back-to-login").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);

    window.location.href = "login";
})