const input = new inputObject("username-email", "Please enter username or E-Mail!", "username-email-error", isElementEmpty);
const password = new inputObject("password", "Please enter password!", "password-error", isElementEmpty);

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();

    if(!input.validate() && !password.validate()) {
        return;
    }

    
})