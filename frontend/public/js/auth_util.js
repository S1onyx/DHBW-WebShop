class inputObject {
    constructor(elementId, elementForError, errorText, errorElementId, validateFn) {
        this._element = document.getElementById(elementId);
        this._elementForError = document.getElementById(elementForError);
        this._errorText = errorText;
        this._errorElement = document.getElementById(errorElementId);
        this._validateFn = validateFn;
    }

    validate() {
        const isValid = this._validateFn(this);
        if(!isValid) {
            showInputError(this._errorText, this._errorElement, this._elementForError);
            addRemoveErrorEventListener(this._element, this._errorElement, this._elementForError);
            return false;
        } else {
            return true;
        }
    }

    customError(message) {
        showInputError(message, this._errorElement, this._elementForError);
        addRemoveErrorEventListener(this._element, this._errorElement, this._elementForError);
    }

    getValue() {
        const content = this._element.value.trim();
        return content;
    }

    getElement() {
        return this._element;
    }

    showErrorBorderAndMessage(message) {
        showInputError(message, this._errorElement, this._elementForError);
    }

    removeError() {
        this._errorElement.textContent = "";
        this._elementForError.classList.remove("input-error");
        this._element.classList.remove("input-error");
    }
}

function addRemoveErrorEventListener(inputElement, errorElement, wrapperElement){
    inputElement.addEventListener("focus", () => {
        errorElement.textContent = "";
        wrapperElement.classList.remove("input-error");
    });
}



function isElementNotEmpty(element) {
    if(!element.getValue()) {
        return false;
    } else {
        return true;
    }
}

function showInputError(message, errorElement, element) {
    errorElement.textContent = message;
    element.classList.add("input-error");
}

function togglePassword(toggleButton, passwordInput) {
    if(passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleButton.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        toggleButton.textContent = "Show";
    }
}

function connectFocusToWrapper(input, wrapper) {
  input.addEventListener("focus", () => wrapper.classList.add("password-focus"));
  input.addEventListener("blur", () => wrapper.classList.remove("password-focus"));
}