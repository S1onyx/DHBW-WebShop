const identifier = document.getElementById("email");
const codeInput = new inputObject("code-input", "code-input", "Please enter code!", "code-error", isElementNotEmpty);

window.onload = function() {
    const savedIdentifier = sessionStorage.getItem("identifier");
    if(savedIdentifier) {
        identifier.textContent = savedIdentifier;
    }
}

document.getElementById("code-login-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!codeInput.validate()) {
        return;
    }

    const identifierContent = identifier.textContent;
    const code = codeInput.getValue();


    const body = identifierContent.includes('@')
        ? { email: identifierContent, code: code}
        : { username: identifierContent, code: code};

    const codeLoginSuccess = document.getElementById("code-login-success");
    const codeLoginError = document.getElementById("code-login-error");

    try {
        const res = await fetch('http://localhost:3000/api/auth/login-with-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (json.success) {
            codeLoginSuccess.textContent = 'Login successful.';
            codeLoginSuccess.style.display = "block";
            setTimeout(() => {
                    window.location.href = '/';
            }, 1000);
        } else {
            codeLoginError.textContent = json.error || 'Code is wrong.';
            codeLoginError.style.display = "block";
        }
    } catch (err) {
        codeLoginError.textContent = 'Serverfehler while loging in via code.';
        codeLoginError.style.display = "block";
    }
})

document.getElementById("back-to-request-code").addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = "code-login";
})