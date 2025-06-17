const username = new inputObject("username", "username", "Username must be longer than 5 characters!", "username-error",
    (usernameElement) => {
        if (usernameElement.getValue().length > 5) {
            return true;
        } else {
            return false;
        }
    })
const email = new inputObject("email", "email", "Please enter an E-Mail!", "email-error",
    (emailElement) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailElement.getValue());
    })
const repeatEmail = new inputObject("repeat-email", "repeat-email", "Emails don’t match!", "repeat-email-error", (repeatEmailElement) => {
    if (repeatEmailElement.getValue() === email.getValue() && isElementEmpty(repeatEmailElement)) {
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
    if (repeatPasswordElement.getValue() === repeatPassword.getValue() && isElementEmpty(repeatPasswordElement)) {
        return true;
    } else {
        return false;
    }
})

const addressErrorText = "Please enter address!"

const firstName = new inputObject("fist-name", "fist-name", "Please enter first name!", "fist-name-error", isElementEmpty);
const lastName = new inputObject("last-name", "last-name", "Please enter last name!", "last-name-error", isElementEmpty);
const street = new inputObject("street", "street", addressErrorText, "address-error", isElementEmpty);
const houseNumber = new inputObject("house-number", "house-number", addressErrorText, "address-error", isElementEmpty);
const postalCode = new inputObject("postal-code", "postal-code", addressErrorText, "address-error", isElementEmpty);
const city = new inputObject("city", "city", addressErrorText, "address-error", isElementEmpty);
const country = new inputObject("country", "country", "Please enter Country!", "country-error", isElementEmpty);

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

    if (savedPassword) {
        password.getElement().value = savedPassword;
    }
}

document.getElementById("continue-button").addEventListener("click", function (event) {
    event.preventDefault();
    const isUsername = username.validate()
    const isEmail = email.validate()
    const isRepeatEmail = repeatEmail.validate()
    const isPassword = password.validate()
    const isRepeatPassword = repeatPassword.validate()

    if (!isUsername || !isEmail || !isRepeatEmail || !isPassword || !isRepeatEmail) {
        return;
    }

    formPageOne.style.display = "none";
    formPageTwo.style.display = "flex";

})

document.getElementById("signup-form").addEventListener("submit", function (event) {
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

    const passwordContent = password.getValue();
    sessionStorage.setItem("password", passwordContent);

    window.location.href = "login.html";
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