const username = new inputObject("username", "username", "Username must be longer than 3 characters!", "username-error",
    (usernameElement) => {
        if (usernameElement.getValue().length > 3) {
            return true;
        } else {
            return false;
        }
    })
const email = new inputObject("email", "email", "Please enter an E-Mail!", "email-error",
    (emailElement) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailElement.getValue());
        return isValid;
    })
const repeatEmail = new inputObject("repeat-email", "repeat-email", "Emails don’t match!", "repeat-email-error", (repeatEmailElement) => {
    if (repeatEmailElement.getValue() === email.getValue() && isElementNotEmpty(repeatEmailElement)) {
        return true;
    } else {
        return false;
    }
});
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

const passwordWrapper = document.getElementById("password-wrapper");
const repeatPasswordWrapper = document.getElementById("repeat-password-wrapper");

connectFocusToWrapper(password.getElement(), passwordWrapper);
connectFocusToWrapper(repeatPassword.getElement(), repeatPasswordWrapper);

const addressErrorText = "Please enter address!"

const firstName = new inputObject("fist-name", "fist-name", "Please enter first name!", "fist-name-error", isElementNotEmpty);
const lastName = new inputObject("last-name", "last-name", "Please enter last name!", "last-name-error", isElementNotEmpty);
const street = new inputObject("street", "street", addressErrorText, "address-error", isElementNotEmpty);
const houseNumber = new inputObject("house-number", "house-number", addressErrorText, "address-error", isElementNotEmpty);
const postalCode = new inputObject("postal-code", "postal-code", addressErrorText, "address-error", isElementNotEmpty);
const city = new inputObject("city", "city", addressErrorText, "address-error", isElementNotEmpty);
const country = new inputObject("country", "country", "Please enter Country!", "country-error", isElementNotEmpty);

const formPageOne = document.getElementById("form-page-one");
const formPageTwo = document.getElementById("form-page-two");

window.onload = function () {
    const savedIdentifier = sessionStorage.getItem("identifier");
    const savedPassword = sessionStorage.getItem("password");
    if (savedIdentifier) {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(savedIdentifier)) {
            email.getElement().value = savedIdentifier;
        } else {
            username.getElement().value = savedIdentifier;
        }
    }

}

document.getElementById("continue-button").addEventListener("click", async function (event) {
    event.preventDefault();
    const isUsername = username.validate()
    let isEmail = email.validate()
    if (isEmail) {
        email.removeError();
        try {
            const res = await fetch(`http://localhost:3000/api/auth/check-email?email=${email.getValue()}`);
            const json = await res.json();
            if (json.success) {
                if (json.exists) {
                    email.customError("E-Mail already exists!");
                    isEmail = false
                } else {
                    email.removeError();
                }
            } else {
                email.customError("No Success when checking email.");
            }
        } catch (err) {
            email.customError('Serverfehler beim Username Checken');
        }
    }
    const isRepeatEmail = repeatEmail.validate()
    const isPassword = password.validate()
    const isRepeatPassword = repeatPassword.validate()

    if (!isUsername || !isEmail || !isRepeatEmail || !isPassword || !isRepeatEmail || !isRepeatPassword) {
        return;
    }

    formPageOne.style.display = "none";
    formPageTwo.style.display = "flex";

});

document.getElementById("signup-container").addEventListener('click', (event) => {
    if (event.target !== document.getElementById("login-container")) {
        document.getElementById("signup-success").style.display = "none";
        document.getElementById("signup-error").style.display = "none";
    }
})

username.getElement().addEventListener('input', async (event) => {
    checkUsernameExists();

})

async function checkUsernameExists() {
    if (username.validate()) {
        try {
            const res = await fetch(`http://localhost:3000/api/auth/check-username?username=${username.getValue()}`);
            const json = await res.json();
            if (json.success) {
                if (json.exists) {
                    username.showErrorBorderAndMessage("Username already taken!");
                } else {
                    username.removeError();
                }
            } else {
                username.showErrorBorderAndMessage("No Success when checking username.");
            }
        } catch (err) {
            username.showErrorBorderAndMessage('Serverfehler beim Username Checken');
        }
    } else if (username.getValue() === "") {
        username.removeError();
    }
}

document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const isFirstNameValid = firstName.validate();
    const isLastNameValid = lastName.validate();
    const isStreetValid = street.validate();
    const isHouseNumberValid = houseNumber.validate();
    const isPostalCodeValid = postalCode.validate();
    const isCityValid = city.validate();
    const isCountryValid = country.validate();

    if (!isFirstNameValid || !isLastNameValid || !isStreetValid || !isHouseNumberValid ||
        !isPostalCodeValid || !isCityValid || !isCountryValid) {
        return;
    }


    const body = {
        first_name: firstName.getValue(), last_name: lastName.getValue(), username: username.getValue(),
        email: email.getValue(), password: password.getValue(), street: street.getValue(), house_number: houseNumber.getValue(),
        postal_code: postalCode.getValue(), city: city.getValue(), country: country.getValue()
    };

    const signupSuccess = document.getElementById("signup-success");
    const signupError = document.getElementById("signup-error");

    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (json.success) {
            signupSuccess.textContent = 'Signup successful.';
            signupSuccess.style.display = "block";

            const emailContent = email.getValue();
            sessionStorage.setItem("identifier", emailContent);

            setTimeout(() => {
                window.location.href = '/resent-verification';
            }, 1000);
        } else {
            signupError.textContent = json.error || 'Signup error';
            signupError.style.display = "block";
        }
    } catch (err) {
        signupError.textContent = 'Serverfehler beim Login';
        signupError.style.display = "block";
    }


})

document.getElementById("back-to-one").addEventListener("click", function (event) {
    event.preventDefault();
    formPageOne.style.display = "flex";
    formPageTwo.style.display = "none";
})

document.getElementById("to-login").addEventListener("click", function (event) {
    event.preventDefault();

    const usernameContent = username.getValue();
    const emailContent = email.getValue();

    if (usernameContent.length > 0) {
        sessionStorage.setItem("identifier", usernameContent);
    } else {
        sessionStorage.setItem("identifier", emailContent);
    }

    window.location.href = "login";
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