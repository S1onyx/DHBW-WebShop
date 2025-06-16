const username = new inputObject("username", "Username must be longer than 5 characters!", "username-error",
    (usernameElement) => {
        if (usernameElement.getValue().length > 5) {
            return true;
        } else {
            return false;
        }
    })
const email = new inputObject("email", "Please enter an E-Mail!", "email-error",
    (emailElement) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailElement.getValue());
})
const repeatEmail = new inputObject("repeat-email", "Emails don’t match!", "repeat-email-error", (repeatEmailElement) => {
    if(repeatEmailElement.getValue() === email.getValue() && isElementEmpty(repeatEmailElement)) {
        return true;
    } else {
        return false;
    }
});
const password = new inputObject("password", "Min. 10 chars incl. upper/lowercase, digit & symbol!",
    "password-error", (passwordElement) => {
        isAtLeast10Char = passwordElement.getValue().length >= 10;
        if(!isAtLeast10Char) {
            return false;
        }
        isUpper = false;
        isLower = false;
        isNumber = false;
        isSpecialChar = false;

        for(const char of passwordElement.getValue()) {
            if(char >= 'a' && char <= 'z') {
                isLower == true;
            }else if(char >= 'A' && char <= 'Z') {
                isUpper == true;
            }else if(char >= '0' && char <= '9') {
                isNumber = true;
            }else {
                isSpecialChar = true;
            }
            if(isUpper && isLower && isNumber && isSpecialChar) {
                return true;
            }
        }
        return false;
})
const repeatPassword = new inputObject("repeat-password", "Passwords don't match!", "repeat-password-error", (repeatPasswordElement) => {
    if(repeatPasswordElement.getValue() === repeatPassword.getValue() && isElementEmpty(repeatPasswordElement)) {
        return true;
    } else {
        return false;
    }
})

document.getElementById("signup-form").addEventListener("submit", function (event) {
    event.preventDefault();
    !username.validate()
    !email.validate()
    !repeatEmail.validate()
    !password.validate()
    !repeatPassword.validate()

    //TODO: Check if emails and passwords are the same and if email and password are valid


})