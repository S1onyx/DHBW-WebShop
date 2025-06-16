class inputObject {
    constructor(elementId, errorText, errorElementId, validateFn) {
        this._element = document.getElementById(elementId);
        this._errorText = errorText;
        this._errorElement = document.getElementById(errorElementId);
        this._validateFn = validateFn;
    }

    validate() {
        const isValid = this._validateFn(this);
        if(!isValid) {
            showInputError(this._errorText, this._errorElement, this._element);
            addRemoveErrorEventListener(this._element, this._errorElement);
            return false;
        } else {
            return true;
        }
    }

    getValue() {
        const content = this._element.value.trim();
        return content;
    }
}

function addRemoveErrorEventListener(element, errorElement){
    element.addEventListener("focus", () => {
        errorElement.textContent = "";
        element.classList.remove("input-error");
    })
}

function isElementEmpty(element) {
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