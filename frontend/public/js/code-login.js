const identifier = new inputObject("username-email", "username-email", "Please enter username or E-Mail!", "username-email-error", isElementNotEmpty);

window.onload = function() {
    const savedIdentifier = sessionStorage.getItem("identifier");
    if(savedIdentifier) {
        identifier.getElement().value = savedIdentifier;
    }
}

document.getElementById("code-login-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!identifier.validate()) {
        return;
    }

    const identifierContent = identifier.getValue();


    const body = identifierContent.includes('@')
        ? { email: identifierContent}
        : { username: identifierContent};

    const codeLoginSuccess = document.getElementById("code-login-success");
    const codeLoginError = document.getElementById("code-login-error");

    try {
        const res = await fetch('http://localhost:3000/api/auth/request-login-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        console.log(res);

        const json = await res.json();
        console.log(json);
        if (json.success) {
            codeLoginSuccess.textContent = 'Code sent. Please check your E-Mails!';
            codeLoginSuccess.style.display = "block";
        } else {
            codeLoginError.textContent = json.error || 'Username/E-Mail is wrong.';
            codeLoginError.style.display = "block";
        }
    } catch (err) {
        codeLoginError.textContent = 'Serverfehler while requesting code.';
        codeLoginError.style.display = "block";
    }
})

document.getElementById("back-to-login").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);

    window.location.href = "login";
})