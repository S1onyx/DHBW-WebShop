const identifier = new inputObject("username-email", "username-email", "Please enter username or E-Mail!", "username-email-error", isElementNotEmpty);
const password = new inputObject("password", "password-wrapper", "Please enter password!", "password-error", isElementNotEmpty);

const passwordWrapper = document.getElementById("password-wrapper");

connectFocusToWrapper(password.getElement(), passwordWrapper);

window.onload = function () {
    const savedIdentifier = sessionStorage.getItem("identifier");
    const savedPassword = sessionStorage.getItem("password");
    if (savedIdentifier) {
        identifier.getElement().value = savedIdentifier;
    }
}

document.getElementById("login-container").addEventListener('click', (event) => {
    if (event.target !== document.getElementById("login-container")) {
        document.getElementById("login-success").style.display = "none";
        document.getElementById("login-error").style.display = "none";
  }
})

document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!identifier.validate() || !password.validate()) {
        return;
    }

    const identifierContent = identifier.getValue();
    const passwordContent = password.getValue();


    const body = identifierContent.includes('@')
        ? { email: identifierContent, password: passwordContent }
        : { username: identifierContent, password: passwordContent };

    const loginSuccess = document.getElementById("login-success");
    const loginError = document.getElementById("login-error");

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (json.success) {
            loginSuccess.textContent = 'Login successful.';
            loginSuccess.style.display = "block";
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            loginError.textContent = json.error || 'Username/E-Mail or password is wrong.';
            loginError.style.display = "block";
            if(json.retryVerification) {
                setTimeout(() => {
                    const identifierContent = identifier.getValue();
                    sessionStorage.setItem("identifier", identifierContent);
                    window.location.href = 'resent-verification';
            }, 1000);
            }
        }
    } catch (err) {
        loginError.textContent = 'Serverfehler beim Login';
        loginError.style.display = "block";
    }

})

document.getElementById("to-signup").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);


    window.location.href = "signup";
});

document.getElementById("code-login-button").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);


    window.location.href = "code-login";
});

document.getElementById("forgot-password-link").addEventListener("click", function (event) {
    event.preventDefault();

    const identifierContent = identifier.getValue();
    sessionStorage.setItem("identifier", identifierContent);

    window.location.href = "reset-password";
})

document.getElementById("toggle-password").addEventListener("click", function (event) {
    const passwordInput = password.getElement();
    const toggleButton = document.getElementById("toggle-password");

    togglePassword(toggleButton, passwordInput);
})