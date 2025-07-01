const password = new inputObject("password", "password-wrapper", "Min. 10 chars incl. upper/lowercase, digit & symbol!",
    "password-error", (passwordElement) => {
        const passwordValue = passwordElement.getValue();
        isAtLeast10Char = passwordValue.length >= 10;
        if (!isAtLeast10Char) {
            return false;
        }
        isUpper = false;
        isLower = false;
        isNumber = false;
        isSpecialChar = false;

        for (const char of passwordValue) {
            if (char >= 'a' && char <= 'z') {
                isLower = true;
            } else if (char >= 'A' && char <= 'Z') {
                isUpper = true;
            } else if (char >= '0' && char <= '9') {
                isNumber = true;
            } else {
                isSpecialChar = true;
            }
            if (isUpper && isLower && isNumber && isSpecialChar) {
                return true;
            }
        }
        return false;
    })
const repeatPassword = new inputObject("repeat-password", "repeat-password-wrapper", "Passwords don't match!", "repeat-password-error", (repeatPasswordElement) => {
    if (repeatPasswordElement.getValue() === password.getValue() && isElementNotEmpty(repeatPasswordElement)) {
        return true;
    } else {
        return false;
    }
})

let token;

window.onload = function () {
    const params = new URLSearchParams(window.location.search);

    const token_param = params.get('token');

    if (token_param) {
        token = token_param;
    }
}

document.getElementById("reset-container").addEventListener('click', (event) => {
    if (event.target !== document.getElementById("reset-container")) {
        document.getElementById("reset-success").style.display = "none";
        document.getElementById("reset-error").style.display = "none";
    }
})

document.getElementById("reset-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const resetSuccess = document.getElementById("reset-success");
    const resetError = document.getElementById("reset-error");

    if(!token) {
        resetError.textContent = "Couldn't verify.";
        resetError.style.display = "block";
        return;
    }

    const isPassword = password.validate();
    const isRepeatPassword = repeatPassword.validate();

    if(!isPassword || !isRepeatPassword) {
        return;
    }

    const body = {newPassword: password.getValue()};

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/auth/reset?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (json.success) {
            resetSuccess.textContent = 'Reset Password successfully.';
            resetSuccess.style.display = "block";

            setTimeout(() => {
                window.location.href = 'login';
            }, 1000);
        } else {
            resetError.textContent = json.error || 'Reset Password error';
            resetError.style.display = "block";
        }
    } catch (err) {
        resetError.textContent = 'Serverfehler while resetting Password.';
        resetError.style.display = "block";
    }

})

document.getElementById("toggle-password").addEventListener("click", function (event) {
    const passwordInput = password.getElement();
    const toggleButton = document.getElementById("toggle-password");

    togglePassword(toggleButton, passwordInput);
})

document.getElementById("toggle-repeat-password").addEventListener("click", function (event) {
    const repeatPasswordInput = repeatPassword.getElement();
    const toggleButton = document.getElementById("toggle-repeat-password");

    togglePassword(toggleButton, repeatPasswordInput);
})